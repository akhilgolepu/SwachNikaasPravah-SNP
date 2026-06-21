/**
 * simStore — Application state store backed by the FastAPI backend.
 *
 * Uses React 19's useSyncExternalStore for zero-dependency reactivity.
 * All mutations go through the backend REST API and the store updates
 * optimistically. WebSocket messages drive real-time state changes.
 */
import { useSyncExternalStore } from "react";
import type { Drain, Ticket, Crew, AlertEvent, WebSocketMessage } from "./types";
import {
  fetchDrains, fetchTickets, fetchCrews, fetchAlerts,
  dispatchCrewAPI, resolveTicketAPI, escalateTicketAPI,
  dismissDrainAPI, toggleStormAPI,
} from "./api";
import {
  connectWebSocket, onWebSocketMessage,
  getWsStatus, subscribeWsStatus,
} from "./websocket";

// ── Focus Request Type (from redesign) ──────────────────────────────────────
export interface FocusRequest {
  drainId: string;
  lat: number;
  lng: number;
  token: number;
}

// ── State Shape ─────────────────────────────────────────────────────────────
export interface State {
  drains: Drain[];
  tickets: Ticket[];
  alerts: AlertEvent[];
  crews: Crew[];
  selectedDrainId: string | null;
  stormMode: boolean;
  focus: FocusRequest | null;
  wsStatus: "connecting" | "connected" | "disconnected";
  loading: boolean;
}

let state: State = {
  drains: [],
  tickets: [],
  alerts: [],
  crews: [],
  selectedDrainId: null,
  stormMode: false,
  focus: null,
  wsStatus: "disconnected",
  loading: true,
};

// ── Pub/Sub ─────────────────────────────────────────────────────────────────
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }
function setState(updater: (s: State) => State) {
  state = updater(state);
  emit();
}

// ── WebSocket Integration ───────────────────────────────────────────────────
function handleWsMessage(msg: WebSocketMessage) {
  switch (msg.event) {
    case "BLOCKAGE_ALERT":
    case "DRAIN_UPDATE":
      // Update the specific drain in state
      if (msg.drain_id && msg.drain_id !== "SYS") {
        setState((s) => ({
          ...s,
          drains: s.drains.map((d) =>
            d.id === msg.drain_id
              ? {
                  ...d,
                  blockage_pct: msg.blockage_pct ?? d.blockage_pct,
                  risk_index: msg.risk_index ?? d.risk_index,
                  status: (msg.status as Drain["status"]) ?? d.status,
                  last_frame_at: "now",
                }
              : d
          ),
        }));
      }
      // If it was a persisted alert, add to alerts feed
      if (msg.event === "BLOCKAGE_ALERT" && msg.persisted) {
        setState((s) => ({
          ...s,
          alerts: [
            {
              id: Date.now(),
              drain_id: msg.drain_id ?? "",
              drain_name: msg.drain_name ?? "",
              ward: msg.ward ?? "",
              risk_index: msg.risk_index ?? 0,
              kind: (msg.kind as AlertEvent["kind"]) ?? "blockage",
              message: msg.message ?? "",
              detected_at: msg.timestamp ?? new Date().toISOString(),
            },
            ...s.alerts,
          ].slice(0, 50),
        }));
      }
      break;

    case "DISPATCH":
      // Refresh full state from backend to get accurate ticket/crew/drain state
      simStore.refreshFromAPI();
      break;

    case "TICKET_RESOLVED":
    case "TICKET_ESCALATED":
      simStore.refreshFromAPI();
      break;

    case "STORM_ACTIVATED":
      setState((s) => ({
        ...s,
        stormMode: true,
        alerts: [
          {
            id: Date.now(),
            drain_id: "SYS",
            drain_name: "IMD WEATHER FUSION",
            ward: "ALL WARDS",
            risk_index: 95,
            kind: "weather" as const,
            message: msg.message ?? "FLASH FLOOD WARNING",
            detected_at: msg.timestamp ?? new Date().toISOString(),
          },
          ...s.alerts,
        ],
      }));
      // Refresh drains to get updated values
      fetchDrains().then((drains) => setState((s) => ({ ...s, drains }))).catch(() => {});
      break;

    case "STORM_DEACTIVATED":
      setState((s) => ({ ...s, stormMode: false }));
      fetchDrains().then((drains) => setState((s) => ({ ...s, drains }))).catch(() => {});
      break;
  }
}

// ── Public Store API ────────────────────────────────────────────────────────
export const simStore = {
  getState: () => state,

  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },

  /** Load initial data from backend and connect WebSocket. */
  async initialize() {
    setState((s) => ({ ...s, loading: true }));

    try {
      const [drains, tickets, crews, alerts] = await Promise.all([
        fetchDrains(),
        fetchTickets(),
        fetchCrews(),
        fetchAlerts(),
      ]);
      setState((s) => ({
        ...s,
        drains,
        tickets,
        crews,
        alerts,
        loading: false,
      }));
    } catch (err) {
      console.error("[store] Failed to load from API:", err);
      setState((s) => ({ ...s, loading: false }));
    }

    // Connect WebSocket
    onWebSocketMessage(handleWsMessage);
    connectWebSocket();

    // Track WS status
    subscribeWsStatus(() => {
      setState((s) => ({ ...s, wsStatus: getWsStatus() }));
    });
  },

  /** Re-fetch all data from the backend. */
  async refreshFromAPI() {
    try {
      const [drains, tickets, crews, alerts] = await Promise.all([
        fetchDrains(),
        fetchTickets(),
        fetchCrews(),
        fetchAlerts(),
      ]);
      setState((s) => ({ ...s, drains, tickets, crews, alerts }));
    } catch (err) {
      console.error("[store] Refresh failed:", err);
    }
  },

  selectDrain(id: string | null) {
    setState((s) => ({ ...s, selectedDrainId: id }));
  },

  focusDrain(id: string) {
    const d = state.drains.find((x) => x.id === id);
    if (!d) return;
    setState((s) => ({
      ...s,
      selectedDrainId: id,
      focus: { drainId: id, lat: d.lat, lng: d.lng, token: Date.now() },
    }));
  },

  clearFocus() {
    setState((s) => ({ ...s, focus: null }));
  },

  async dismissDrain(drainId: string) {
    const drain = state.drains.find((d) => d.id === drainId);
    if (!drain) return;

    // Optimistic update
    setState((s) => ({
      ...s,
      drains: s.drains.map((d) =>
        d.id === drainId ? { ...d, status: "dismissed" as const } : d
      ),
      selectedDrainId: s.selectedDrainId === drainId ? null : s.selectedDrainId,
    }));

    try {
      await dismissDrainAPI(drainId);
    } catch (err) {
      console.error("[store] Dismiss failed:", err);
      simStore.refreshFromAPI();
    }
  },

  async dispatchCrew(drainId: string, crewName: string) {
    // Optimistic update
    setState((s) => ({
      ...s,
      drains: s.drains.map((d) =>
        d.id === drainId ? { ...d, status: "dispatched" as const } : d
      ),
      crews: s.crews.map((c) =>
        c.name === crewName ? { ...c, available: false } : c
      ),
    }));

    try {
      await dispatchCrewAPI(drainId, crewName);
      await simStore.refreshFromAPI();
    } catch (err) {
      console.error("[store] Dispatch failed:", err);
      simStore.refreshFromAPI();
    }
  },

  async resolveTicket(ticketId: string) {
    setState((s) => ({
      ...s,
      tickets: s.tickets.map((t) =>
        t.id === ticketId ? { ...t, status: "resolved" as const } : t
      ),
    }));

    try {
      await resolveTicketAPI(ticketId);
      await simStore.refreshFromAPI();
    } catch (err) {
      console.error("[store] Resolve failed:", err);
      simStore.refreshFromAPI();
    }
  },

  async escalateTicket(ticketId: string) {
    try {
      await escalateTicketAPI(ticketId);
      await simStore.refreshFromAPI();
    } catch (err) {
      console.error("[store] Escalate failed:", err);
    }
  },

  async toggleStorm() {
    try {
      const result = await toggleStormAPI();
      setState((s) => ({ ...s, stormMode: result.storm_mode }));
      // The WebSocket will push the updates, but also refresh
      await simStore.refreshFromAPI();
    } catch (err) {
      console.error("[store] Storm toggle failed:", err);
    }
  },

  dismissAlert(id: number) {
    setState((s) => ({
      ...s,
      alerts: s.alerts.filter((a) => a.id !== id),
    }));
  },
};

if (typeof window !== "undefined") {
  (window as any).simStore = simStore;
}

// ── Hook ────────────────────────────────────────────────────────────────────
export function useSimStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    simStore.subscribe,
    () => selector(simStore.getState()),
    () => selector(state),
  );
}

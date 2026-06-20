import { useSyncExternalStore } from "react";
import {
  initialDrains,
  initialTickets,
  crews as initialCrews,
  computeRI,
  riStatus,
  type Drain,
  type Ticket,
  type Crew,
} from "./mockData";

export interface AlertEvent {
  id: string;
  drainId: string;
  drainName: string;
  ward: string;
  ri: number;
  at: number;
  kind: "blockage" | "weather" | "dispatch";
  message: string;
}

interface State {
  drains: Drain[];
  tickets: Ticket[];
  alerts: AlertEvent[];
  selectedDrainId: string | null;
  stormMode: boolean;
  crews: Crew[];
}

let state: State = {
  drains: initialDrains,
  tickets: initialTickets,
  alerts: [
    { id: "A-init-1", drainId: "HYD-MDP-003", drainName: "Madhapur HITEC Underpass", ward: "Madhapur", ri: 86, at: Date.now() - 240000, kind: "blockage", message: "Critical blockage detected — plastic + silt" },
    { id: "A-init-2", drainId: "MUM-WOR-018", drainName: "Worli Sea Face Box", ward: "Worli", ri: 83, at: Date.now() - 660000, kind: "weather", message: "68mm/6h forecast — high cascade risk" },
  ],
  selectedDrainId: null,
  stormMode: false,
  crews: initialCrews,
};

const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }
function setState(updater: (s: State) => State) {
  state = updater(state);
  emit();
}

export const simStore = {
  getState: () => state,
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
  selectDrain(id: string | null) { setState((s) => ({ ...s, selectedDrainId: id })); },
  dismissAlert(id: string) {
    setState((s) => ({ ...s, alerts: s.alerts.filter((a) => a.id !== id) }));
  },
  dismissDrain(drainId: string) {
    const drain = state.drains.find((d) => d.id === drainId);
    if (!drain) return;
    setState((s) => ({
      ...s,
      drains: s.drains.map((d) => (d.id === drainId ? { ...d, status: "dismissed" as const } : d)),
      selectedDrainId: s.selectedDrainId === drainId ? null : s.selectedDrainId,
      alerts: [
        {
          id: `A-${Date.now()}`,
          drainId,
          drainName: drain.name,
          ward: drain.ward,
          ri: drain.riskIndex,
          at: Date.now(),
          kind: "blockage" as const,
          message: `Drain ${drain.name} was dismissed by operator`,
        },
        ...s.alerts,
      ],
    }));
  },
  dispatchCrew(drainId: string, crewName: string) {
    const drain = state.drains.find((d) => d.id === drainId);
    if (!drain) return;
    
    const existingTicketIndex = state.tickets.findIndex(
      (t) => t.drainId === drainId && (t.status === "open" || t.status === "assigned")
    );
    
    const etaMin = Math.round(8 + Math.random() * 20);

    setState((s) => {
      let nextTickets = [...s.tickets];
      if (existingTicketIndex !== -1) {
        nextTickets[existingTicketIndex] = {
          ...nextTickets[existingTicketIndex],
          status: "in_progress",
          crew: crewName,
          etaMin,
        };
      } else {
        const ticket: Ticket = {
          id: `TKT-${2419 + s.tickets.length}`,
          drainId: drain.id,
          drainName: drain.name,
          ward: drain.ward,
          riskIndex: drain.riskIndex,
          createdAt: "just now",
          status: "in_progress",
          crew: crewName,
          etaMin,
          evidenceFrame: new Date().toISOString().replace("T", " ").slice(0, 19) + " IST",
        };
        nextTickets = [ticket, ...nextTickets];
      }

      return {
        ...s,
        tickets: nextTickets,
        drains: s.drains.map((d) => (d.id === drainId ? { ...d, status: "dispatched" as const } : d)),
        crews: s.crews.map((c) => (c.name === crewName ? { ...c, available: false } : c)),
        alerts: [
          { id: `A-${Date.now()}`, drainId, drainName: drain.name, ward: drain.ward, ri: drain.riskIndex, at: Date.now(), kind: "dispatch" as const, message: `${crewName} dispatched — ETA ${etaMin}m` },
          ...s.alerts,
        ],
      };
    });
  },
  resolveTicket(ticketId: string) {
    const ticket = state.tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    setState((s) => ({
      ...s,
      tickets: s.tickets.map((t) => (t.id === ticketId ? { ...t, status: "resolved" as const } : t)),
      drains: s.drains.map((d) => (d.id === ticket.drainId ? { ...d, status: "ok" as const, riskIndex: 15, blockagePct: 10 } : d)),
      crews: ticket.crew ? s.crews.map((c) => (c.name === ticket.crew ? { ...c, available: true } : c)) : s.crews,
      alerts: [
        {
          id: `A-${Date.now()}`,
          drainId: ticket.drainId,
          drainName: ticket.drainName,
          ward: ticket.ward,
          ri: 15,
          at: Date.now(),
          kind: "blockage" as const,
          message: `Ticket ${ticketId} resolved — site cleared by ${ticket.crew || "field crew"}`,
        },
        ...s.alerts,
      ],
    }));
  },
  escalateTicket(ticketId: string) {
    const ticket = state.tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    setState((s) => {
      const nextRI = Math.min(100, ticket.riskIndex + 15);
      return {
        ...s,
        tickets: s.tickets.map((t) => (t.id === ticketId ? { ...t, riskIndex: nextRI } : t)),
        drains: s.drains.map((d) => (d.id === ticket.drainId ? { ...d, riskIndex: nextRI, status: "critical" as const } : d)),
        alerts: [
          {
            id: `A-${Date.now()}`,
            drainId: ticket.drainId,
            drainName: ticket.drainName,
            ward: ticket.ward,
            ri: nextRI,
            at: Date.now(),
            kind: "weather" as const,
            message: `CRITICAL ESCALATION for ticket ${ticketId} — Senior Engineer requested.`,
          },
          ...s.alerts,
        ],
      };
    });
  },
  toggleStorm() {
    setState((s) => {
      const next = !s.stormMode;
      if (next) {
        const bumped = s.drains.map((d) => {
          const rf = Math.min(120, d.rainfallForecastMm + 35);
          const bp = Math.min(99, d.blockagePct + Math.round(Math.random() * 18));
          const ri = computeRI({ blockagePct: bp, rainfallForecastMm: rf, topoRisk: d.topoRisk });
          return { ...d, rainfallForecastMm: rf, blockagePct: bp, riskIndex: ri, status: riStatus(ri) };
        });
        return {
          ...s,
          stormMode: true,
          drains: bumped,
          alerts: [
            { id: `A-storm-${Date.now()}`, drainId: "SYS", drainName: "IMD WEATHER FUSION", ward: "ALL WARDS", ri: 95, at: Date.now(), kind: "weather" as const, message: "FLASH FLOOD WARNING — 60+mm/6h across monitored network" },
            ...s.alerts,
          ],
        };
      } else {
        return { ...s, stormMode: false, drains: initialDrains, crews: initialCrews, tickets: initialTickets };
      }
    });
  },
  injectMockAlert() {
    const candidates = state.drains.filter((d) => d.status !== "dispatched");
    if (!candidates.length) return;
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    const bp = Math.min(99, target.blockagePct + Math.round(5 + Math.random() * 20));
    const ri = computeRI({ ...target, blockagePct: bp });
    setState((s) => ({
      ...s,
      drains: s.drains.map((d) => (d.id === target.id ? { ...d, blockagePct: bp, riskIndex: ri, status: riStatus(ri), lastFrameAt: "now" } : d)),
      alerts: [
        { id: `A-${Date.now()}`, drainId: target.id, drainName: target.name, ward: target.ward, ri, at: Date.now(), kind: "blockage" as const, message: `Blockage rising to ${bp}% — ${target.detected.join(", ") || "debris"}` },
        ...s.alerts,
      ].slice(0, 40),
    }));
  },
};

export function useSimStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(simStore.subscribe, () => selector(simStore.getState()), () => selector(state));
}

// Global ticking
let started = false;
export function startSimulator() {
  if (started || typeof window === "undefined") return;
  started = true;
  setInterval(() => simStore.injectMockAlert(), 52000);
}

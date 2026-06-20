import { useSyncExternalStore } from "react";
import {
  initialDrains,
  initialTickets,
  computeRI,
  riStatus,
  type Drain,
  type Ticket,
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
  dispatchCrew(drainId: string, crew: string) {
    const drain = state.drains.find((d) => d.id === drainId);
    if (!drain) return;
    const ticket: Ticket = {
      id: `TKT-${2419 + state.tickets.length}`,
      drainId: drain.id,
      drainName: drain.name,
      ward: drain.ward,
      riskIndex: drain.riskIndex,
      createdAt: "just now",
      status: "assigned",
      crew,
      etaMin: Math.round(8 + Math.random() * 20),
      evidenceFrame: new Date().toISOString().replace("T", " ").slice(0, 19) + " IST",
    };
    setState((s) => ({
      ...s,
      tickets: [ticket, ...s.tickets],
      drains: s.drains.map((d) => (d.id === drainId ? { ...d, status: "dispatched" as const } : d)),
      alerts: [
        { id: `A-${Date.now()}`, drainId, drainName: drain.name, ward: drain.ward, ri: drain.riskIndex, at: Date.now(), kind: "dispatch" as const, message: `${crew} dispatched — ETA ${ticket.etaMin}m` },
        ...s.alerts,
      ],
    }));
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
        return { ...s, stormMode: false, drains: initialDrains };
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

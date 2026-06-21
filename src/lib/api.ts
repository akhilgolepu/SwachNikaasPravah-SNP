/**
 * API client — typed fetch wrapper for DrainageAI backend REST endpoints.
 */
import type { Drain, Ticket, Crew, AlertEvent } from "./types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Drains ──────────────────────────────────────────────────────────────────
export const fetchDrains = () => json<Drain[]>("/api/v1/drains");
export const fetchDrain = (id: string) => json<Drain>(`/api/v1/drains/${id}`);
export const dismissDrainAPI = (id: string) =>
  json<Drain>(`/api/v1/drains/${id}?status=dismissed`, { method: "PATCH" });

// ── Alerts ──────────────────────────────────────────────────────────────────
export const fetchAlerts = () => json<AlertEvent[]>("/api/v1/alerts");
export const fetchActiveAlerts = () => json<AlertEvent[]>("/api/v1/alerts/active");
export const dismissAlertAPI = (id: number) =>
  json<{ status: string }>(`/api/v1/alerts/${id}`, { method: "DELETE" });

// ── Tickets ─────────────────────────────────────────────────────────────────
export const fetchTickets = () => json<Ticket[]>("/api/v1/tickets");
export const resolveTicketAPI = (id: string) =>
  json<Ticket>(`/api/v1/tickets/${id}/resolve`, { method: "POST" });
export const escalateTicketAPI = (id: string) =>
  json<Ticket>(`/api/v1/tickets/${id}/escalate`, { method: "POST" });

// ── Dispatch ────────────────────────────────────────────────────────────────
export const dispatchCrewAPI = (drainId: string, crewName: string) =>
  json<Ticket>("/api/v1/dispatch", {
    method: "POST",
    body: JSON.stringify({ drain_id: drainId, crew_name: crewName }),
  });

// ── Crews ───────────────────────────────────────────────────────────────────
export const fetchCrews = () => json<Crew[]>("/api/v1/crews");

// ── Weather ─────────────────────────────────────────────────────────────────
export const toggleStormAPI = () =>
  json<{ storm_mode: boolean; message: string }>("/api/v1/weather/storm", {
    method: "POST",
  });

// ── Inference ───────────────────────────────────────────────────────────────
export const getInferenceFrameURL = (drainId: string) =>
  `${BASE}/api/v1/inference/${drainId}/frame?t=${Date.now()}`;

export const getRawFrameURL = (drainId: string) =>
  `${BASE}/api/v1/inference/${drainId}/raw-frame?t=${Date.now()}`;

// MJPEG continuous streams — no cache-busting needed (persistent connection)
export const getInferenceStreamURL = (drainId: string) =>
  `${BASE}/api/v1/inference/${drainId}/stream`;

export const getRawStreamURL = (drainId: string) =>
  `${BASE}/api/v1/inference/${drainId}/raw-stream`;

// ── Health ──────────────────────────────────────────────────────────────────
export const healthCheck = () => json<{ status: string }>("/api/v1/health");

/**
 * Shared TypeScript types for DrainageAI — mirrors backend Pydantic schemas.
 */

export type RiskStatus = "critical" | "warning" | "ok" | "dispatched" | "dismissed";

export interface Drain {
  id: string;
  name: string;
  ward: string;
  city: "Hyderabad" | "Mumbai";
  lat: number;
  lng: number;
  type: "Stormwater" | "Combined" | "Box Culvert";
  blockage_pct: number;
  rainfall_forecast_mm: number;
  topo_risk: number;
  risk_index: number;
  status: RiskStatus;
  uptime: number;
  last_frame_at: string;
  detected: string[];
}

export interface Ticket {
  id: string;
  drain_id: string;
  drain_name: string;
  ward: string;
  risk_index: number;
  created_at: string;
  status: "open" | "assigned" | "in_progress" | "resolved" | "escalated";
  crew?: string;
  eta_min?: number;
  evidence_frame: string;
}

export interface Crew {
  id: string;
  name: string;
  lead: string;
  distance_km: number;
  available: boolean;
  members: number;
}

export interface AlertEvent {
  id: number;
  drain_id: string;
  drain_name: string;
  ward: string;
  risk_index: number;
  kind: "blockage" | "weather" | "dispatch";
  message: string;
  detected_at: string;
}

export interface WebSocketMessage {
  event: string;
  drain_id?: string;
  drain_name?: string;
  ward?: string;
  risk_index?: number;
  blockage_pct?: number;
  status?: string;
  kind?: string;
  message?: string;
  timestamp?: string;
  crew?: string;
  eta_min?: number;
  ticket_id?: string;
  persisted?: boolean;
}

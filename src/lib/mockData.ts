export type RiskStatus = "critical" | "warning" | "ok" | "dispatched" | "dismissed";

export interface Drain {
  id: string;
  name: string;
  ward: string;
  city: "Hyderabad" | "Mumbai";
  lat: number;
  lng: number;
  type: "Stormwater" | "Combined" | "Box Culvert";
  blockagePct: number; // A_b
  rainfallForecastMm: number; // R_f (6h)
  topoRisk: number; // V_t (0-1)
  riskIndex: number; // RI 0-100
  status: RiskStatus;
  uptime: number; // %
  lastFrameAt: string;
  detected: string[]; // e.g. ["plastic","silt"]
}

export interface Ticket {
  id: string;
  drainId: string;
  drainName: string;
  ward: string;
  riskIndex: number;
  createdAt: string;
  status: "open" | "assigned" | "in_progress" | "resolved" | "escalated";
  crew?: string;
  etaMin?: number;
  evidenceFrame: string;
}

export interface Crew {
  id: string;
  name: string;
  lead: string;
  distanceKm: number;
  available: boolean;
  members: number;
}

// Hyderabad + Mumbai coordinate spread
const seed: Omit<Drain, "riskIndex" | "status">[] = [
  { id: "HYD-GCB-014", name: "Gachibowli Jn. Main Outfall", ward: "Gachibowli", city: "Hyderabad", lat: 17.4401, lng: 78.3489, type: "Stormwater", blockagePct: 78, rainfallForecastMm: 45, topoRisk: 0.82, uptime: 99.4, lastFrameAt: "2s ago", detected: ["plastic", "silt"] },
  { id: "HYD-KKD-007", name: "Kukatpally Y-Junction", ward: "Kukatpally", city: "Hyderabad", lat: 17.4849, lng: 78.4138, type: "Combined", blockagePct: 62, rainfallForecastMm: 38, topoRisk: 0.71, uptime: 98.1, lastFrameAt: "1s ago", detected: ["plastic"] },
  { id: "HYD-BJR-021", name: "Banjara Hills Rd No. 12", ward: "Banjara Hills", city: "Hyderabad", lat: 17.4156, lng: 78.4347, type: "Stormwater", blockagePct: 24, rainfallForecastMm: 12, topoRisk: 0.31, uptime: 99.9, lastFrameAt: "1s ago", detected: [] },
  { id: "HYD-MDP-003", name: "Madhapur HITEC Underpass", ward: "Madhapur", city: "Hyderabad", lat: 17.4483, lng: 78.3915, type: "Box Culvert", blockagePct: 88, rainfallForecastMm: 52, topoRisk: 0.91, uptime: 97.7, lastFrameAt: "3s ago", detected: ["plastic", "debris", "silt"] },
  { id: "HYD-SEC-019", name: "Secunderabad Clock Tower", ward: "Secunderabad", city: "Hyderabad", lat: 17.4399, lng: 78.4983, type: "Combined", blockagePct: 41, rainfallForecastMm: 18, topoRisk: 0.45, uptime: 99.2, lastFrameAt: "1s ago", detected: ["silt"] },
  { id: "HYD-AMP-012", name: "Ameerpet Metro Outfall", ward: "Ameerpet", city: "Hyderabad", lat: 17.4374, lng: 78.4482, type: "Stormwater", blockagePct: 56, rainfallForecastMm: 28, topoRisk: 0.6, uptime: 98.8, lastFrameAt: "2s ago", detected: ["plastic"] },
  { id: "HYD-JHL-005", name: "Jubilee Hills Check Post", ward: "Jubilee Hills", city: "Hyderabad", lat: 17.4239, lng: 78.4070, type: "Stormwater", blockagePct: 15, rainfallForecastMm: 8, topoRisk: 0.22, uptime: 99.7, lastFrameAt: "1s ago", detected: [] },
  { id: "HYD-KHJ-009", name: "Khairatabad Flyover", ward: "Khairatabad", city: "Hyderabad", lat: 17.4126, lng: 78.4664, type: "Combined", blockagePct: 69, rainfallForecastMm: 33, topoRisk: 0.75, uptime: 96.4, lastFrameAt: "4s ago", detected: ["plastic", "silt"] },
  { id: "MUM-BKC-002", name: "BKC Connector Drain", ward: "Bandra-Kurla", city: "Mumbai", lat: 19.0656, lng: 72.8691, type: "Box Culvert", blockagePct: 71, rainfallForecastMm: 62, topoRisk: 0.88, uptime: 98.3, lastFrameAt: "2s ago", detected: ["plastic", "debris"] },
  { id: "MUM-AND-011", name: "Andheri Sub-Station Inlet", ward: "Andheri West", city: "Mumbai", lat: 19.1197, lng: 72.8468, type: "Stormwater", blockagePct: 49, rainfallForecastMm: 41, topoRisk: 0.58, uptime: 99.1, lastFrameAt: "1s ago", detected: ["plastic"] },
  { id: "MUM-DAD-006", name: "Dadar TT Outfall", ward: "Dadar", city: "Mumbai", lat: 19.0186, lng: 72.8430, type: "Combined", blockagePct: 33, rainfallForecastMm: 22, topoRisk: 0.4, uptime: 99.5, lastFrameAt: "1s ago", detected: [] },
  { id: "MUM-WOR-018", name: "Worli Sea Face Box", ward: "Worli", city: "Mumbai", lat: 19.0094, lng: 72.8175, type: "Box Culvert", blockagePct: 84, rainfallForecastMm: 68, topoRisk: 0.93, uptime: 97.2, lastFrameAt: "3s ago", detected: ["plastic", "silt", "debris"] },
];

export function computeRI(d: Pick<Drain, "blockagePct" | "rainfallForecastMm" | "topoRisk">): number {
  // RI = 0.5*Ab + 0.3*min(Rf/70,1)*100 + 0.2*Vt*100
  const rfNorm = Math.min(d.rainfallForecastMm / 70, 1) * 100;
  return Math.round(0.5 * d.blockagePct + 0.3 * rfNorm + 0.2 * d.topoRisk * 100);
}

export function riStatus(ri: number): RiskStatus {
  if (ri >= 70) return "critical";
  if (ri >= 45) return "warning";
  return "ok";
}

export const initialDrains: Drain[] = seed.map((d) => {
  const ri = computeRI(d);
  return { ...d, riskIndex: ri, status: riStatus(ri) };
});

export const crews: Crew[] = [
  { id: "C-01", name: "Crew Alpha", lead: "R. Subramanyam", distanceKm: 1.2, available: true, members: 4 },
  { id: "C-02", name: "Crew Bravo", lead: "K. Lakshmi", distanceKm: 2.7, available: true, members: 5 },
  { id: "C-03", name: "Crew Charlie", lead: "M. Ibrahim", distanceKm: 3.4, available: false, members: 3 },
  { id: "C-04", name: "Crew Delta", lead: "S. Venkatesh", distanceKm: 4.9, available: true, members: 4 },
  { id: "C-05", name: "Crew Echo", lead: "A. Pradeep", distanceKm: 6.1, available: true, members: 6 },
];

export const initialTickets: Ticket[] = [
  { id: "TKT-2418", drainId: "HYD-MDP-003", drainName: "Madhapur HITEC Underpass", ward: "Madhapur", riskIndex: computeRI(seed[3]), createdAt: "4 min ago", status: "open", evidenceFrame: "2025-06-20 14:32:08 IST" },
  { id: "TKT-2417", drainId: "MUM-WOR-018", drainName: "Worli Sea Face Box", ward: "Worli", riskIndex: computeRI(seed[11]), createdAt: "11 min ago", status: "assigned", crew: "Crew Alpha", etaMin: 18, evidenceFrame: "2025-06-20 14:25:41 IST" },
  { id: "TKT-2416", drainId: "HYD-GCB-014", drainName: "Gachibowli Jn. Main Outfall", ward: "Gachibowli", riskIndex: computeRI(seed[0]), createdAt: "22 min ago", status: "in_progress", crew: "Crew Bravo", etaMin: 6, evidenceFrame: "2025-06-20 14:13:55 IST" },
  { id: "TKT-2415", drainId: "MUM-BKC-002", drainName: "BKC Connector Drain", ward: "Bandra-Kurla", riskIndex: computeRI(seed[8]), createdAt: "38 min ago", status: "resolved", crew: "Crew Delta", evidenceFrame: "2025-06-20 13:58:12 IST" },
];

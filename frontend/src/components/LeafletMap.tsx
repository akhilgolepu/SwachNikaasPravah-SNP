/**
 * LeafletMap — Real GIS map canvas with dark tiles, color-coded drain markers,
 * fly-to animation, and interactive selection.
 *
 * Replaces the previous SVG-based MapCanvas with an actual Leaflet map
 * using real lat/lng coordinates for Hyderabad and Mumbai.
 */
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { useSimStore, simStore } from "@/lib/simStore";
import type { Drain } from "@/lib/types";
import "leaflet/dist/leaflet.css";

// ── Status → color mapping ──────────────────────────────────────────────────
const statusColor = (s: Drain["status"]): string => {
  switch (s) {
    case "critical": return "#FF3B3B";
    case "warning": return "#F5A524";
    case "dispatched": return "#0066FF";
    case "dismissed": return "#555555";
    default: return "#17C964";
  }
};

// ── Fly-to controller (reacts to selected drain) ────────────────────────────
function FlyToSelected() {
  const map = useMap();
  const selected = useSimStore((s) => s.selectedDrainId);
  const drains = useSimStore((s) => s.drains);

  useEffect(() => {
    if (!selected) {
      // Zoom out to show both cities
      map.flyTo([18.25, 75.5], 6, { duration: 1.2 });
      return;
    }
    const drain = drains.find((d) => d.id === selected);
    if (drain) {
      map.flyTo([drain.lat, drain.lng], 14, { duration: 1.5 });
    }
  }, [selected, drains, map]);

  return null;
}

export function LeafletMap() {
  const drains = useSimStore((s) => s.drains);
  const selected = useSimStore((s) => s.selectedDrainId);
  const wsStatus = useSimStore((s) => s.wsStatus);

  return (
    <div className="relative w-full h-full overflow-hidden border border-border">
      <MapContainer
        center={[18.25, 75.5]}
        zoom={6}
        className="w-full h-full z-0"
        style={{ background: "#0A0A0A" }}
        zoomControl={false}
        attributionControl={false}
      >
        {/* Dark map tiles — CartoDB Dark Matter */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        <FlyToSelected />

        {drains.map((d) => {
          const isSel = selected === d.id;
          const color = statusColor(d.status);
          const radius = d.status === "critical" ? 10 : isSel ? 9 : 7;

          return (
            <CircleMarker
              key={d.id}
              center={[d.lat, d.lng]}
              radius={radius}
              pathOptions={{
                color: isSel ? "#FFFFFF" : color,
                fillColor: color,
                fillOpacity: d.status === "dismissed" ? 0.3 : 0.85,
                weight: isSel ? 3 : 1.5,
              }}
              eventHandlers={{
                click: () => simStore.selectDrain(d.id),
              }}
            >
              <Popup className="drain-popup" closeButton={false}>
                <div style={{ minWidth: 200 }}>
                  <div style={{ fontSize: 10, fontFamily: "JetBrains Mono", letterSpacing: 2, color: "#8F8F8F", textTransform: "uppercase" }}>
                    {d.id}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4, color: "#fff" }}>
                    {d.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#8F8F8F", marginTop: 2 }}>
                    {d.ward} · {d.city} · {d.type}
                  </div>
                  <div style={{
                    display: "flex", gap: 12, marginTop: 8,
                    fontSize: 11, fontFamily: "JetBrains Mono",
                  }}>
                    <span>Block: <b style={{ color }}>{d.blockage_pct}%</b></span>
                    <span>Rain: <b>{d.rainfall_forecast_mm}mm</b></span>
                    <span>RI: <b style={{ color, fontSize: 14 }}>{d.risk_index}</b></span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex items-center gap-3 px-3 py-2 bg-card/90 border border-border backdrop-blur-sm z-[1000]">
        {([
          ["Critical", "#FF3B3B"],
          ["Warning", "#F5A524"],
          ["Normal", "#17C964"],
          ["Dispatched", "#0066FF"],
        ] as const).map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="h-2 w-2" style={{ background: color, borderRadius: "50%" }} />
            <span className="text-[10px] uppercase tracking-wider mono text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Connection status */}
      <div className="absolute top-4 right-4 px-3 py-1.5 bg-card/90 border border-border backdrop-blur-sm z-[1000]">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${
            wsStatus === "connected" ? "bg-risk-ok pulse-dot"
              : wsStatus === "connecting" ? "bg-risk-warning pulse-dot"
              : "bg-risk-critical"
          }`} />
          <span className="text-[10px] mono uppercase tracking-wider text-muted-foreground">
            {wsStatus === "connected" ? "Live · WebSocket"
              : wsStatus === "connecting" ? "Connecting..."
              : "Disconnected"}
          </span>
        </div>
      </div>
    </div>
  );
}

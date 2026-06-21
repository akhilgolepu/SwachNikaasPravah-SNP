import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { simStore, useSimStore } from "@/lib/simStore";
import type { Drain } from "@/lib/mockData";

const INITIAL_CENTER: [number, number] = [18.5, 75.7]; // between Mumbai & Hyderabad
const INITIAL_ZOOM = 6;

const statusHex = (s: Drain["status"]) =>
  s === "critical" ? "#FF3B3B" :
  s === "warning" ? "#F5A524" :
  s === "dispatched" ? "#0066FF" :
  s === "dismissed" ? "#4A4A4A" : "#17C964";

function buildIcon(d: Drain, isSelected: boolean): L.DivIcon {
  const color = statusHex(d.status);
  const pulse = d.status === "critical"
    ? `<span class="absolute inset-0 rounded-full" style="background:${color};opacity:.35;animation:pulse-critical 1.6s ease-out infinite;border-radius:9999px;"></span>`
    : "";
  const ring = isSelected ? `box-shadow:0 0 0 2px #0066FF, 0 0 0 4px rgba(0,102,255,.25);` : "box-shadow:0 0 0 2px #0A0A0A;";
  const html = `
    <div style="position:relative;width:18px;height:18px;">
      ${pulse}
      <span style="position:absolute;inset:4px;background:${color};${ring};border-radius:9999px;"></span>
    </div>
  `;
  return L.divIcon({
    className: "drainage-marker",
    html,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function FocusController() {
  const map = useMap();
  const focus = useSimStore((s) => s.focus);
  const lastToken = useRef<number | null>(null);
  useEffect(() => {
    if (!focus || focus.token === lastToken.current) return;
    lastToken.current = focus.token;
    // cinematic: zoom out slightly then fly in close
    const current = map.getZoom();
    const intermediate = Math.max(5, Math.min(current, 7));
    map.flyTo(map.getCenter(), intermediate, { duration: 0.5, easeLinearity: 0.25 });
    window.setTimeout(() => {
      map.flyTo([focus.lat, focus.lng], 16, { duration: 1.4, easeLinearity: 0.2 });
    }, 520);
  }, [focus, map]);
  return null;
}

function FitOnMount({ drains }: { drains: Drain[] }) {
  const map = useMap();
  useEffect(() => {
    if (!drains.length) return;
    const bounds = L.latLngBounds(drains.map((d) => [d.lat, d.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 7 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export function MapCanvas() {
  const drains = useSimStore((s) => s.drains);
  const selected = useSimStore((s) => s.selectedDrainId);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative w-full h-full bg-[#0A0A0A] overflow-hidden border border-border">
      {mounted ? (
        <MapContainer
          center={INITIAL_CENTER}
          zoom={INITIAL_ZOOM}
          minZoom={4}
          maxZoom={18}
          zoomControl={false}
          attributionControl={false}
          worldCopyJump
          preferCanvas
          style={{ width: "100%", height: "100%", background: "#0A0A0A" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains={["a", "b", "c", "d"]}
            maxZoom={20}
          />
          <FitOnMount drains={drains} />
          <FocusController />
          {drains.map((d) => (
            <Marker
              key={d.id}
              position={[d.lat, d.lng]}
              icon={buildIcon(d, selected === d.id)}
              eventHandlers={{ click: () => simStore.focusDrain(d.id) }}
            >
              <Popup className="drainage-popup">
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11 }}>
                  <div style={{ opacity: 0.7 }}>{d.id}</div>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>{d.name}</div>
                  <div style={{ opacity: 0.7, marginTop: 2 }}>{d.ward} · {d.city}</div>
                  <div style={{ marginTop: 6 }}>RI <b style={{ color: statusHex(d.status) }}>{d.riskIndex}</b></div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <div className="absolute inset-0 grid place-items-center text-[10px] mono uppercase tracking-widest text-muted-foreground">
          Initializing GIS tile layer…
        </div>
      )}

      <div className="absolute z-[500] bottom-4 left-4 flex items-center gap-3 px-3 py-2 bg-card border border-border">
        {[
          ["critical", "#FF3B3B", "Critical"],
          ["warning", "#F5A524", "Warning"],
          ["ok", "#17C964", "Normal"],
          ["dispatched", "#0066FF", "Dispatched"],
          ["dismissed", "#4A4A4A", "Dismissed"],
        ].map(([k, c, l]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: c }} />
            <span className="text-[10px] uppercase tracking-wider mono text-muted-foreground">{l}</span>
          </div>
        ))}
      </div>

      <div className="absolute z-[500] top-4 right-4 px-3 py-1.5 bg-card border border-border">
        <span className="text-[10px] mono uppercase tracking-wider text-muted-foreground">Live · CARTO Dark Matter</span>
      </div>
    </div>
  );
}

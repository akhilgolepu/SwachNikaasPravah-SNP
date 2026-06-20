"use client";

import { useEffect, useMemo, useState } from "react";
import { useSimStore, simStore } from "@/lib/simStore";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export function MapContent() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className="relative w-full h-full border border-border bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Initializing map...</div>
      </div>
    );
  }

  return <MapContentInner />;
}

function MapContentInner() {
  const drains = useSimStore((s) => s.drains);
  const selectedId = useSimStore((s) => s.selectedDrainId);

  const bounds = useMemo(() => ({
    minLat: 17.4126 - 0.05,
    maxLat: 19.1197 + 0.05,
    minLng: 72.8175 - 0.05,
    maxLng: 78.4983 + 0.05,
  }), []);

  const center = useMemo(
    () => [(bounds.minLat + bounds.maxLat) / 2, (bounds.minLng + bounds.maxLng) / 2] as [number, number],
    [bounds]
  );

  const getIconColor = (status: string): string => {
    switch (status) {
      case "critical": return "#FF3B30";
      case "warning": return "#FF9500";
      case "dispatched": return "#007AFF";
      default: return "#34C759";
    }
  };

  const createMarkerIcon = (status: string, isPulsing: boolean) => {
    const color = getIconColor(status);
    const html = `<div style="width: 20px; height: 20px; background: ${color}; border: 3px solid #0A0A0A; border-radius: 50%; box-shadow: 0 0 12px ${color}80; ${isPulsing ? 'animation: pulse-marker 1.6s ease-in-out infinite;' : ''}"></div>`;
    return L.divIcon({
      html,
      className: "custom-marker",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -15],
    });
  };

  function MarkerPopup({ drain }: any) {
    const riskColor = getIconColor(drain.status);
    return (
      <div className="text-sm space-y-1" style={{ minWidth: "200px" }}>
        <div className="font-semibold" style={{ color: riskColor }}>{drain.id}</div>
        <div className="text-xs text-muted-foreground">{drain.name}</div>
        <div className="flex justify-between gap-2 mt-2 pt-2 border-t border-border/30">
          <span className="text-xs">Risk Index: <span className="font-semibold" style={{ color: riskColor }}>{drain.riskIndex}</span></span>
        </div>
      </div>
    );
  }

  function FlyToController({ drainId }: any) {
    const map = useMap();
    const drains = useSimStore((s) => s.drains);

    useEffect(() => {
      if (!drainId || !map) return;
      const drain = drains.find((d) => d.id === drainId);
      if (!drain) return;
      map.flyTo([drain.lat, drain.lng], 16, { duration: 2, easeLinearity: 0.25 });
    }, [drainId, map, drains]);

    return null;
  }

  function InitialBoundsController() {
    const map = useMap();
    useEffect(() => {
      map.fitBounds([[bounds.minLat, bounds.minLng], [bounds.maxLat, bounds.maxLng]]);
    }, [map]);
    return null;
  }

  return (
    <div className="relative w-full h-full border border-border overflow-hidden">
      <style>{`
        .leaflet-container { background-color: #0a0a0a !important; font-family: inherit; }
        .leaflet-control { background-color: rgba(20, 20, 20, 0.95) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; }
        .leaflet-control-zoom-in, .leaflet-control-zoom-out { background-color: rgba(20, 20, 20, 0.95) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; color: #ffffff !important; }
        .leaflet-control-zoom-in:hover, .leaflet-control-zoom-out:hover { background-color: rgba(40, 40, 40, 0.95) !important; }
        .leaflet-control-attribution { background-color: rgba(20, 20, 20, 0.8) !important; color: #8f8f8f !important; }
        .leaflet-popup-content-wrapper { background-color: rgba(20, 20, 20, 0.95) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; border-radius: 4px; }
        .leaflet-popup-tip { background-color: rgba(20, 20, 20, 0.95) !important; }
        @keyframes pulse-marker { 0%, 100% { opacity: 1; box-shadow: 0 0 12px currentColor; } 50% { opacity: 0.5; box-shadow: 0 0 24px currentColor; } }
      `}</style>

      <MapContainer center={center} zoom={7} style={{ height: "100%", width: "100%", zIndex: 0 }} dragging zoomControl attributionControl>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' maxZoom={19} minZoom={3} />
        <InitialBoundsController />
        <FlyToController drainId={selectedId} />
        {drains.map((drain) => (
          <Marker key={drain.id} position={[drain.lat, drain.lng]} icon={createMarkerIcon(drain.status, drain.status === "critical" && selectedId !== drain.id)} eventHandlers={{ click: () => simStore.selectDrain(drain.id) }}>
            <Popup><MarkerPopup drain={drain} /></Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute bottom-4 left-4 flex items-center gap-3 px-3 py-2 bg-card border border-border z-10">
        {[["critical", "#FF3B30", "Critical"], ["warning", "#FF9500", "Warning"], ["ok", "#34C759", "Normal"], ["dispatched", "#007AFF", "Dispatched"]].map(([k, c, l]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className="h-2 w-2" style={{ background: c }} />
            <span className="text-[10px] uppercase tracking-wider mono text-muted-foreground">{l}</span>
          </div>
        ))}
      </div>

      <div className="absolute top-4 right-4 px-3 py-1.5 bg-card border border-border z-10">
        <span className="text-[10px] mono uppercase tracking-wider text-muted-foreground">Live · WebSocket</span>
      </div>
    </div>
  );
}

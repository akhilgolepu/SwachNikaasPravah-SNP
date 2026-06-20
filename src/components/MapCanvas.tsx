import { useEffect, useRef, useState } from "react";
import { useSimStore, simStore } from "@/lib/simStore";
import type { Drain } from "@/lib/types";

const VIEW = { w: 1000, h: 600 };
const BOUNDS = { minLat: 18.9, maxLat: 19.3, minLng: 72.7, maxLng: 78.6 };
// Use two clusters: Mumbai-left, Hyderabad-right
function project(d: Drain) {
  // Map cities to halves of canvas to keep both visible
  if (d.city === "Mumbai") {
    const lat = (d.lat - 18.95) / (19.2 - 18.95);
    const lng = (d.lng - 72.79) / (72.88 - 72.79);
    return { x: 60 + lng * 360, y: 100 + (1 - lat) * 380 };
  }
  const lat = (d.lat - 17.39) / (17.50 - 17.39);
  const lng = (d.lng - 78.34) / (78.50 - 78.34);
  return { x: 560 + lng * 380, y: 100 + (1 - lat) * 380 };
}

const statusColor = (s: Drain["status"]) =>
  s === "critical" ? "var(--color-risk-critical)" :
  s === "warning" ? "var(--color-risk-warning)" :
  s === "dispatched" ? "var(--color-primary)" :
  s === "dismissed" ? "rgba(100, 110, 130, 0.4)" : "var(--color-risk-ok)";

export function MapCanvas() {
  const drains = useSimStore((s) => s.drains);
  const selected = useSimStore((s) => s.selectedDrainId);
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState(`0 0 ${VIEW.w} ${VIEW.h}`);
  const currentViewBoxRef = useRef({ x: 0, y: 0, w: VIEW.w, h: VIEW.h });

  // tick to animate pulse
  useEffect(() => {
    const i = setInterval(() => svgRef.current?.classList.toggle("opacity-100"), 1000);
    return () => clearInterval(i);
  }, []);

  // Cinematic pan-and-zoom (fly-to tracking) animated SVG viewBox
  useEffect(() => {
    const selectedDrain = drains.find((d) => d.id === selected);
    let target = { x: 0, y: 0, w: VIEW.w, h: VIEW.h };

    if (selectedDrain) {
      const { x, y } = project(selectedDrain);
      // Zoom in to a smaller window centered at target (x, y)
      const zoomW = 350;
      const zoomH = 210;
      const zoomX = Math.max(0, Math.min(VIEW.w - zoomW, x - zoomW / 2));
      const zoomY = Math.max(0, Math.min(VIEW.h - zoomH, y - zoomH / 2));
      target = { x: zoomX, y: zoomY, w: zoomW, h: zoomH };
    }

    let start: number | null = null;
    const duration = 1000; // 1 second smooth fly-to transition
    const initial = { ...currentViewBoxRef.current };

    let animId: number;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      
      // Easing: cubic easeInOut
      const ease = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const current = {
        x: initial.x + (target.x - initial.x) * ease,
        y: initial.y + (target.y - initial.y) * ease,
        w: initial.w + (target.w - initial.w) * ease,
        h: initial.h + (target.h - initial.h) * ease,
      };

      currentViewBoxRef.current = current;
      setViewBox(`${current.x.toFixed(1)} ${current.y.toFixed(1)} ${current.w.toFixed(1)} ${current.h.toFixed(1)}`);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [selected, drains]);

  return (
    <div className="relative w-full h-full bg-[#0A0A0A] overflow-hidden border border-border">
      {/* faux dark map grid */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute inset-0 bg-gradient-radial" style={{
        background: "radial-gradient(circle at 30% 40%, rgba(0,102,255,0.06), transparent 50%), radial-gradient(circle at 75% 60%, rgba(23,201,100,0.04), transparent 50%)",
      }} />

      <svg ref={svgRef} viewBox={viewBox} className="absolute inset-0 w-full h-full transition-all duration-300">
        {/* coastline / road squiggles */}
        <g stroke="#1F1F1F" strokeWidth="1" fill="none">
          <path d="M0,380 Q120,360 240,400 T480,380 T720,420 T1000,400" />
          <path d="M0,200 Q200,220 400,180 T800,220 T1000,200" opacity="0.5" />
          <path d="M120,0 L120,600" opacity="0.3" />
          <path d="M560,0 L560,600" opacity="0.5" strokeDasharray="4 6" />
        </g>
        {/* City labels */}
        <text x="180" y="80" fill="#8F8F8F" fontSize="11" letterSpacing="3" className="mono">MUMBAI</text>
        <text x="720" y="80" fill="#8F8F8F" fontSize="11" letterSpacing="3" className="mono">HYDERABAD</text>

        {drains.map((d) => {
          const { x, y } = project(d);
          const isSel = selected === d.id;
          const color = statusColor(d.status);
          return (
            <g key={d.id} className="cursor-pointer" onClick={() => simStore.selectDrain(d.id)}>
              {d.status === "critical" && (
                <circle cx={x} cy={y} r="18" fill={color} opacity="0.15">
                  <animate attributeName="r" values="10;24;10" dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0;0.3" dur="1.6s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={x} cy={y} r="6" fill={color} stroke="#0A0A0A" strokeWidth="2" />
              {isSel && (
                <>
                  <rect x={x - 12} y={y - 12} width="24" height="24" fill="none" stroke={color} strokeWidth="1" />
                  <text x={x + 16} y={y - 8} fill="#FFFFFF" fontSize="10" className="mono">{d.id}</text>
                  <text x={x + 16} y={y + 6} fill="#8F8F8F" fontSize="9" className="mono">RI {d.risk_index}</text>
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* legend */}
      <div className="absolute bottom-4 left-4 flex items-center gap-3 px-3 py-2 bg-card border border-border">
        {[
          ["critical", "var(--color-risk-critical)", "Critical"],
          ["warning", "var(--color-risk-warning)", "Warning"],
          ["ok", "var(--color-risk-ok)", "Normal"],
          ["dispatched", "var(--color-primary)", "Dispatched"],
        ].map(([k, c, l]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className="h-2 w-2" style={{ background: c }} />
            <span className="text-[10px] uppercase tracking-wider mono text-muted-foreground">{l}</span>
          </div>
        ))}
      </div>

      <div className="absolute top-4 right-4 px-3 py-1.5 bg-card border border-border">
        <span className="text-[10px] mono uppercase tracking-wider text-muted-foreground">Live · WebSocket</span>
      </div>
    </div>
  );
}

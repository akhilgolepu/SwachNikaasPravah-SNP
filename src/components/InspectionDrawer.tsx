import { useEffect, useState } from "react";
import { simStore, useSimStore } from "@/lib/simStore";
import { getInferenceFrameURL, getRawFrameURL } from "@/lib/api";
import { X, RefreshCw, Send, AlertTriangle } from "lucide-react";

function useTickingTimestamp() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 47);
    return () => clearInterval(id);
  }, []);
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const ms = String(now.getMilliseconds()).padStart(3, "0");
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return { date, time: `${hh}:${mm}:${ss}`, ms };
}

function nvrChannelId(drain: { ward: string; id: string }, channel: number) {
  const wardSlug = String(drain.ward || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 5) || "ZONE";
  const cam = String(channel).padStart(2, "0");
  const node = drain.id.split("-").slice(-1)[0] || "000";
  return `NVR-${wardSlug}-${node} // CAM ${cam}`;
}

export function InspectionDrawer() {
  const selectedId = useSimStore((s) => s.selectedDrainId);
  const drain = useSimStore((s) => s.drains.find((d) => d.id === s.selectedDrainId) || null);
  const crews = useSimStore((s) => s.crews);
  const [dispatching, setDispatching] = useState(false);

  if (!selectedId || !drain) return null;

  const close = () => { simStore.selectDrain(null); setDispatching(false); };
  const handleDispatch = async (crewName: string) => {
    await simStore.dispatchCrew(drain.id, crewName);
    setDispatching(false);
    setTimeout(close, 400);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={close} />
      <aside className="fixed right-0 top-16 bottom-0 w-full sm:w-[520px] bg-background border-l border-border z-40 slide-in-right overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] mono uppercase tracking-widest text-muted-foreground">{drain.id}</span>
              <span className={`text-[10px] mono uppercase tracking-widest px-1.5 py-0.5 ${
                drain.status === "critical" ? "bg-risk-critical text-white" :
                drain.status === "warning" ? "bg-risk-warning text-black" :
                drain.status === "dispatched" ? "bg-primary text-white" : "bg-risk-ok text-black"
              }`}>{drain.status}</span>
            </div>
            <h3 className="text-base font-semibold mt-1">{drain.name}</h3>
            <p className="text-[11px] text-muted-foreground">{drain.ward} · {drain.city} · {drain.type}</p>
          </div>
          <button onClick={close} className="h-8 w-8 grid place-items-center border border-border hover:bg-surface-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Split viewport — real backend frames */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <StreamPanel label="RAW RTSP" drain={drain} mode="raw" channel={1} />
            <StreamPanel label="YOLO INFERENCE" drain={drain} mode="yolo" channel={2} />
          </div>

          {/* Risk Index Math */}
          <section>
            <h4 className="text-[11px] mono uppercase tracking-widest text-muted-foreground mb-3">
              Risk Index Fusion — RI = 0.5·A<sub>b</sub> + 0.3·R<sub>f</sub> + 0.2·V<sub>t</sub>
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="A_b · Blockage" value={`${drain.blockage_pct}%`} accent={drain.blockage_pct >= 70} />
              <Stat label="R_f · Rain 6h" value={`${drain.rainfall_forecast_mm} mm`} accent={drain.rainfall_forecast_mm >= 50} />
              <Stat label="V_t · Topo" value={drain.topo_risk.toFixed(2)} accent={drain.topo_risk >= 0.7} />
            </div>
            <div className="mt-3 bento-lg flex items-center justify-between" style={{ padding: 20 }}>
              <div>
                <div className="text-[10px] mono uppercase tracking-widest text-muted-foreground">Computed Risk Index</div>
                <div className={`mono text-4xl font-semibold mt-1 ${
                  drain.risk_index >= 70 ? "text-risk-critical" : drain.risk_index >= 45 ? "text-risk-warning" : "text-risk-ok"
                }`}>{drain.risk_index}<span className="text-base text-muted-foreground">/100</span></div>
              </div>
              {drain.risk_index >= 70 && (
                <div className="flex items-center gap-2 text-risk-critical">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-[11px] mono uppercase tracking-widest">Critical Threshold</span>
                </div>
              )}
            </div>
          </section>

          {/* Detected debris */}
          <section>
            <h4 className="text-[11px] mono uppercase tracking-widest text-muted-foreground mb-2">Detected Classes</h4>
            <div className="flex flex-wrap gap-2">
              {(drain.detected.length ? drain.detected : ["none"]).map((d) => (
                <span key={d} className="px-2.5 py-1 text-[11px] mono uppercase tracking-wider border border-border bg-card">
                  {d}
                </span>
              ))}
              <span className="px-2.5 py-1 text-[11px] mono uppercase tracking-wider border border-border bg-card">
                uptime · {drain.uptime}%
              </span>
            </div>
          </section>

          {/* Dispatch CTA */}
          {!dispatching ? (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setDispatching(true)}
                disabled={drain.status === "dispatched"}
                className="col-span-2 flex items-center justify-center gap-2 h-12 bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-colors text-[12px] font-semibold uppercase tracking-widest disabled:opacity-40"
              >
                <Send className="h-4 w-4" /> Quick Dispatch
              </button>
              <button onClick={() => simStore.dismissDrain(drain.id)} className="h-12 border border-border text-[11px] font-medium uppercase tracking-widest hover:border-foreground transition-colors">
                Dismiss
              </button>
            </div>
          ) : (
            <div className="border border-border">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h5 className="text-[11px] mono uppercase tracking-widest">Closest Available Crew</h5>
                <button onClick={() => setDispatching(false)} className="text-[11px] text-muted-foreground hover:text-foreground">cancel</button>
              </div>
              <div className="divide-y divide-border">
                {crews.filter((c) => c.available).slice(0, 4).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleDispatch(c.name)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary hover:text-primary-foreground transition-colors text-left"
                  >
                    <div>
                      <div className="text-[13px] font-medium">{c.name} · {c.lead}</div>
                      <div className="text-[10px] mono opacity-70">{c.members} members</div>
                    </div>
                    <div className="text-right">
                      <div className="mono text-sm font-medium">{c.distance_km} km</div>
                      <div className="text-[10px] mono opacity-70">ETA ~{Math.round(c.distance_km * 4)}m</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bento" style={{ padding: 16 }}>
      <div className="text-[9px] mono uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mono text-xl font-semibold mt-1 ${accent ? "text-risk-critical" : ""}`}>{value}</div>
    </div>
  );
}

function StreamPanel({ label, drain, mode, channel }: { label: string; drain: { id: string; ward: string; blockage_pct: number }; mode: "raw" | "yolo"; channel: number }) {
  const ts = useTickingTimestamp();
  const channelId = nvrChannelId(drain, channel);
  const [frameKey, setFrameKey] = useState(0);

  // Get frame URL from the backend inference API
  const frameUrl = mode === "yolo"
    ? getInferenceFrameURL(drain.id)
    : getRawFrameURL(drain.id);

  // Auto-refresh frame every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => setFrameKey((k) => k + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative aspect-video bg-black border border-border overflow-hidden">
      {/* Backend-served frame (real JPEG from YOLO inference) */}
      <img
        key={frameKey}
        src={`${frameUrl}&k=${frameKey}`}
        alt={`${label} — ${drain.id}`}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          // Fallback to CSS gradient if backend isn't running
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />

      {/* Fallback background (shown if img fails to load) */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, #1a2030 0%, #0a0f18 60%, #0a0a0a 100%)",
      }} />

      {/* CCTV scanlines */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 3px)",
        }}
      />
      {/* Moving scan line */}
      <div className="absolute inset-x-0 h-px bg-primary/60 scan-line" />

      {/* HUD — top */}
      <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-black/70 border border-white/10">
            <span className="h-1.5 w-1.5 bg-risk-critical pulse-dot" />
            <span className="text-[9px] mono uppercase tracking-widest text-white">REC</span>
            <span className="text-[9px] mono uppercase tracking-widest text-white/80">· {label}</span>
          </div>
          <div className="px-1.5 py-0.5 bg-black/70 border border-white/10">
            <span className="text-[9px] mono uppercase tracking-[0.18em] text-white/90">{channelId}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="px-1.5 py-0.5 bg-black/70 border border-white/10 mono text-[10px] text-white tabular-nums leading-tight text-right">
            <div className="text-white/70">{ts.date}</div>
            <div>
              {ts.time}
              <span className="text-white/60">.{ts.ms}</span>
            </div>
          </div>
          <button
            onClick={() => setFrameKey((k) => k + 1)}
            className="h-5 w-5 grid place-items-center bg-black/70 border border-white/10 hover:bg-primary/30"
            title="Refresh frame"
          >
            <RefreshCw className="h-2.5 w-2.5 text-white" />
          </button>
        </div>
      </div>

      {/* HUD — bottom */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <span className="text-[9px] mono text-white/70">{drain.id} · 1920×1080 · 24fps · H.264</span>
        <span className="text-[9px] mono text-white/70 uppercase tracking-widest">{mode === "yolo" ? "AI: YOLOv8-DRAIN" : "AI: OFF"}</span>
      </div>
    </div>
  );
}

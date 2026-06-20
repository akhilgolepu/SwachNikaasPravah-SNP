import { simStore, useSimStore } from "@/lib/simStore";
import { ChevronRight } from "lucide-react";
import type { Drain } from "@/lib/mockData";

const statusStyle = (s: Drain["status"]) => {
  if (s === "critical") return { dot: "bg-risk-critical pulse-dot", label: "CRITICAL", text: "text-risk-critical", border: "border-risk-critical" };
  if (s === "warning") return { dot: "bg-risk-warning", label: "WARNING", text: "text-risk-warning", border: "border-risk-warning" };
  if (s === "dispatched") return { dot: "bg-primary", label: "DISPATCHED", text: "text-primary", border: "border-primary" };
  if (s === "dismissed") return { dot: "bg-muted-foreground/40", label: "DISMISSED", text: "text-muted-foreground", border: "border-border" };
  return { dot: "bg-risk-ok", label: "NORMAL", text: "text-risk-ok", border: "border-risk-ok" };
};

export function AlertFeed() {
  const drains = useSimStore((s) => s.drains);
  const selected = useSimStore((s) => s.selectedDrainId);
  const sorted = [...drains].sort((a, b) => b.riskIndex - a.riskIndex);

  return (
    <div className="flex flex-col h-full bg-card border border-border">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-wider">Active Alert Feed</h2>
          <p className="text-[10px] mono uppercase tracking-widest text-muted-foreground mt-1">
            Sorted by Risk Index · {sorted.length} assets
          </p>
        </div>
        <span className="px-2 py-0.5 mono text-[10px] bg-background border border-border">RI ↓</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {sorted.map((d) => {
          const s = statusStyle(d.status);
          const isSel = selected === d.id;
          return (
            <button
              key={d.id}
              onClick={() => simStore.selectDrain(d.id)}
              className={`group w-full text-left px-5 py-4 border-b border-border transition-colors ${
                isSel ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-surface-2"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`h-2 w-2 shrink-0 ${s.dot}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] mono uppercase tracking-widest ${s.text}`}>{s.label}</span>
                      <span className="text-[10px] mono text-muted-foreground">· {d.id}</span>
                    </div>
                    <div className="text-[13px] font-medium truncate mt-0.5">{d.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{d.ward} · {d.city}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`mono text-2xl font-semibold leading-none ${s.text}`}>{d.riskIndex}</div>
                  <div className="text-[9px] mono uppercase text-muted-foreground tracking-widest mt-1">RI</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Metric label="Block" value={`${d.blockagePct}%`} />
                <Metric label="Rain 6h" value={`${d.rainfallForecastMm}mm`} />
                <Metric label="Topo" value={d.topoRisk.toFixed(2)} />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] mono text-muted-foreground">{d.lastFrameAt} · {d.uptime}% uptime</span>
                <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-background px-2 py-1">
      <div className="text-[9px] mono uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mono text-[12px] font-medium">{value}</div>
    </div>
  );
}

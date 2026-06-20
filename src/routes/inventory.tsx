import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useSimStore, simStore } from "@/lib/simStore";
import { RefreshCw, Wrench } from "lucide-react";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Drain Inventory & Stream Matrix — DrainageAI" },
      { name: "description", content: "High-density audit grid of every monitored stormwater asset." },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const drains = useSimStore((s) => s.drains);
  const router = useRouter();
  const [ward, setWard] = useState("ALL");
  const [risk, setRisk] = useState("ALL");
  const [type, setType] = useState("ALL");

  const handleInspect = (drainId: string) => {
    simStore.navigateToMapWithDrain(drainId);
    router.navigate({ to: "/" });
  };

  // Exclude dismissed assets from the inventory table
  const activeDrains = drains.filter((d) => d.status !== "dismissed");
  const wards = ["ALL", ...Array.from(new Set(activeDrains.map((d) => d.ward)))];

  const filtered = useMemo(() => {
    return activeDrains.filter((d) => {
      if (ward !== "ALL" && d.ward !== ward) return false;
      if (risk === "CRIT" && d.status !== "critical") return false;
      if (risk === "WARN" && d.status !== "warning") return false;
      if (risk === "OK" && d.status !== "ok") return false;
      if (type !== "ALL" && d.type !== type) return false;
      return true;
    }).sort((a, b) => b.rainfallForecastMm - a.rainfallForecastMm);
  }, [activeDrains, ward, risk, type]);

  return (
    <main className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6">
      <header className="mb-6">
        <p className="text-[10px] mono uppercase tracking-widest text-muted-foreground">Operations / Inventory</p>
        <h1 className="text-2xl font-semibold mt-2">Drain Inventory & Stream Matrix</h1>
        <p className="text-sm text-muted-foreground mt-1">{filtered.length} of {activeDrains.length} active assets · sorted by 6h rainfall forecast</p>
      </header>

      {/* Filter matrix */}
      <section className="bento mb-6 grid grid-cols-2 md:grid-cols-4 gap-4" style={{ padding: 20 }}>
        <Select label="Ward" value={ward} onChange={setWard} options={wards} />
        <Select label="Risk Class" value={risk} onChange={setRisk} options={[
          { v: "ALL", l: "All" }, { v: "CRIT", l: "Critical" }, { v: "WARN", l: "Warning" }, { v: "OK", l: "Normal" }
        ]} />
        <Select label="Typology" value={type} onChange={setType} options={["ALL", "Stormwater", "Combined", "Box Culvert"]} />
        <div className="flex items-end">
          <button className="w-full h-10 border border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors text-[11px] mono uppercase tracking-widest flex items-center justify-center gap-2">
            <RefreshCw className="h-3 w-3" /> Force RTSP Recalibrate
          </button>
        </div>
      </section>

      {/* Table */}
      <div className="bento" style={{ padding: 0 }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] mono uppercase tracking-widest text-muted-foreground">
                <th className="text-left px-4 py-3 font-medium">Camera ID</th>
                <th className="text-left px-4 py-3 font-medium">Location</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-right px-4 py-3 font-medium">Blockage</th>
                <th className="text-right px-4 py-3 font-medium">Forecast 6h</th>
                <th className="text-right px-4 py-3 font-medium">RI</th>
                <th className="text-right px-4 py-3 font-medium">Uptime</th>
                <th className="text-right px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-border hover:bg-surface-2">
                  <td className="px-4 py-3 mono text-[12px]">{d.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{d.name}</div>
                    <div className="text-[11px] text-muted-foreground">{d.ward} · {d.city}</div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-muted-foreground">{d.type}</td>
                  <td className="px-4 py-3 text-right mono">
                    <BlockBar pct={d.blockagePct} />
                  </td>
                  <td className="px-4 py-3 text-right mono">{d.rainfallForecastMm} mm</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`mono text-base font-semibold ${
                      d.status === "critical" ? "text-risk-critical" :
                      d.status === "warning" ? "text-risk-warning" :
                      d.status === "dispatched" ? "text-primary" : "text-risk-ok"
                    }`}>{d.riskIndex}</span>
                  </td>
                  <td className="px-4 py-3 text-right mono text-[12px] text-muted-foreground">{d.uptime}%</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => handleInspect(d.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 border border-border text-[10px] mono uppercase tracking-widest hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                    >
                      <Wrench className="h-3 w-3" /> Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function Select({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: (string | { v: string; l: string })[];
}) {
  return (
    <label className="block">
      <div className="text-[10px] mono uppercase tracking-widest text-muted-foreground mb-1.5">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 bg-background border border-border text-sm focus:outline-none focus:border-primary"
      >
        {options.map((o) => {
          const v = typeof o === "string" ? o : o.v;
          const l = typeof o === "string" ? o : o.l;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </label>
  );
}

function BlockBar({ pct }: { pct: number }) {
  const color = pct >= 70 ? "bg-risk-critical" : pct >= 45 ? "bg-risk-warning" : "bg-risk-ok";
  return (
    <div className="flex items-center gap-2 justify-end">
      <div className="w-20 h-1.5 bg-border">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="mono text-[12px] w-10 text-right">{pct}%</span>
    </div>
  );
}

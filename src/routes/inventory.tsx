import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSimStore, simStore } from "@/lib/simStore";
import { RefreshCw, Wrench } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Drain Inventory & Stream Matrix — SwachNikaasPravah-SNP" },
      { name: "description", content: "High-density audit grid of every monitored stormwater asset." },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const navigate = useNavigate();
  const drains = useSimStore((s) => s.drains);
  const loading = useSimStore((s) => s.loading);
  const [ward, setWard] = useState("ALL");
  const [risk, setRisk] = useState("ALL");
  const [type, setType] = useState("ALL");

  const inspect = (id: string) => {
    simStore.focusDrain(id);
    navigate({ to: "/" });
  };

  const wards = ["ALL", ...Array.from(new Set(drains.map((d) => d.ward)))];

  const filtered = useMemo(() => {
    return drains.filter((d) => {
      if (ward !== "ALL" && d.ward !== ward) return false;
      if (risk === "CRIT" && d.status !== "critical") return false;
      if (risk === "WARN" && d.status !== "warning") return false;
      if (risk === "OK" && d.status !== "ok") return false;
      if (type !== "ALL" && d.type !== type) return false;
      return true;
    }).sort((a, b) => b.rainfall_forecast_mm - a.rainfall_forecast_mm);
  }, [drains, ward, risk, type]);

  return (
    <main className="space-y-8 relative z-10">
      <header className="mb-6">
        <p className="text-[10px] mono uppercase tracking-widest text-[#00F2FF]">Operations / Inventory</p>
        <h1 className="text-3xl font-semibold mt-2 text-white glow-text">Drain Inventory & Stream Matrix</h1>
        <p className="text-sm text-white/60 mt-1">
          {loading ? "Loading..." : `${filtered.length} of ${drains.length} assets · sorted by 6h rainfall forecast`}
        </p>
      </header>

      {/* Filter matrix */}
      <motion.section 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ delay: 0.1 }}
        className="glass-card mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 relative overflow-hidden group"
      >
        <div className="absolute inset-0 kinetic-gradient opacity-10 pointer-events-none transition-opacity group-hover:opacity-20" />
        <div className="relative z-10 flex flex-col gap-1.5 justify-center">
          <Select label="Ward" value={ward} onChange={setWard} options={wards} />
        </div>
        <div className="relative z-10 flex flex-col gap-1.5 justify-center">
          <Select label="Risk Class" value={risk} onChange={setRisk} options={[
            { v: "ALL", l: "All" }, { v: "CRIT", l: "Critical" }, { v: "WARN", l: "Warning" }, { v: "OK", l: "Normal" }
          ]} />
        </div>
        <div className="relative z-10 flex flex-col gap-1.5 justify-center">
          <Select label="Typology" value={type} onChange={setType} options={["ALL", "Stormwater", "Combined", "Box Culvert"]} />
        </div>
        <div className="relative z-10 flex items-end">
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0, 102, 255, 0.4)" }}
            onClick={() => simStore.refreshFromAPI()}
            className="w-full h-10 rounded-xl border border-white/10 bg-[#0066FF] transition-all text-[11px] mono uppercase tracking-widest flex items-center justify-center gap-2 text-white relative overflow-hidden"
          >
            <RefreshCw className="h-3 w-3" /> Force RTSP Recalibrate
            {/* Shimmer overlay */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent hover:animate-[shimmer_1.5s_infinite]" />
          </motion.button>
        </div>
      </motion.section>

      {/* Table */}
      <div className="glass-card p-0 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5 pointer-events-none" />
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[10px] mono uppercase tracking-widest text-white/40 bg-white/5">
                <th className="text-left px-6 py-4 font-medium">Camera ID</th>
                <th className="text-left px-6 py-4 font-medium">Location</th>
                <th className="text-left px-6 py-4 font-medium">Type</th>
                <th className="text-right px-6 py-4 font-medium">Blockage</th>
                <th className="text-right px-6 py-4 font-medium">Forecast 6h</th>
                <th className="text-right px-6 py-4 font-medium">RI</th>
                <th className="text-right px-6 py-4 font-medium">Uptime</th>
                <th className="text-right px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <motion.tr 
                  key={d.id} 
                  whileHover={{ translateY: -2, boxShadow: "0 0 15px rgba(0, 102, 255, 0.2)", backgroundColor: "rgba(255,255,255,0.05)" }}
                  className="border-b border-white/5 transition-all duration-300 text-white"
                >
                  <td className="px-6 py-4 mono text-[12px]">{d.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{d.name}</div>
                    <div className="text-[11px] text-white/50">{d.ward} · {d.city}</div>
                  </td>
                  <td className="px-6 py-4 text-[12px] text-white/50">{d.type}</td>
                  <td className="px-6 py-4 text-right mono">
                    <BlockBar pct={d.blockage_pct} />
                  </td>
                  <td className="px-6 py-4 text-right mono">{d.rainfall_forecast_mm} mm</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`mono text-base font-semibold ${
                      d.status === "critical" ? "text-[#FF3B3B] drop-shadow-[0_0_8px_rgba(255,59,59,0.8)] animate-pulse" :
                      d.status === "warning" ? "text-[#F5A524] drop-shadow-[0_0_8px_rgba(245,165,36,0.8)]" :
                      d.status === "dispatched" ? "text-[#0066FF]" : "text-[#17C964]"
                    }`}>{d.risk_index}</span>
                  </td>
                  <td className="px-6 py-4 text-right mono text-[12px] text-white/50">{d.uptime}%</td>
                  <td className="px-6 py-4 text-right">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => inspect(d.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-[10px] mono uppercase tracking-widest bg-[#0066FF] shadow-[0_0_15px_rgba(0,102,255,0.3)] transition-all text-white"
                    >
                      <Wrench className="h-3 w-3" /> Inspect
                    </motion.button>
                  </td>
                </motion.tr>
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
    <label className="block w-full">
      <div className="text-[10px] mono uppercase tracking-widest text-white/40 mb-1.5">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]/50 transition-all"
      >
        {options.map((o) => {
          const v = typeof o === "string" ? o : o.v;
          const l = typeof o === "string" ? o : o.l;
          return <option key={v} value={v} className="bg-[#121212] text-white">{l}</option>;
        })}
      </select>
    </label>
  );
}

function BlockBar({ pct }: { pct: number }) {
  const color = pct >= 70 ? "bg-[#FF3B3B] shadow-[0_0_10px_rgba(255,59,59,0.8)]" : pct >= 45 ? "bg-[#F5A524]" : "bg-[#17C964]";
  return (
    <div className="flex items-center gap-2 justify-end">
      <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`} 
        />
      </div>
      <span className="mono text-[12px] w-10 text-right">{pct}%</span>
    </div>
  );
}

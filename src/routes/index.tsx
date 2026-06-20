import { createFileRoute } from "@tanstack/react-router";
import { AlertFeed } from "@/components/AlertFeed";
import { LeafletMap } from "@/components/LeafletMap";
import { useSimStore } from "@/lib/simStore";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ICCC Map Dashboard — DrainageAI" },
      { name: "description", content: "Real-time GIS canvas plotting active drain risk across Hyderabad and Mumbai." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const drains = useSimStore((s) => s.drains);
  const loading = useSimStore((s) => s.loading);
  const critical = drains.filter((d) => d.status === "critical").length;
  const warning = drains.filter((d) => d.status === "warning").length;
  const dispatched = drains.filter((d) => d.status === "dispatched").length;

  return (
    <main className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6">
      {/* Top KPI bento */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border mb-6">
        <KPI label="Monitored Drains" value={loading ? "—" : drains.length.toString()} sub="across 2 cities" />
        <KPI label="Critical Now" value={loading ? "—" : critical.toString()} sub="RI ≥ 70" accent="critical" />
        <KPI label="Warning" value={loading ? "—" : warning.toString()} sub="45 ≤ RI < 70" accent="warning" />
        <KPI label="Crews Dispatched" value={loading ? "—" : dispatched.toString()} sub="active tickets" accent="primary" />
      </section>

      {/* Split workspace */}
      <section className="grid grid-cols-12 gap-6" style={{ height: "calc(100vh - 280px)", minHeight: 600 }}>
        <div className="col-span-12 lg:col-span-4 min-h-0">
          <AlertFeed />
        </div>
        <div className="col-span-12 lg:col-span-8 min-h-0">
          <LeafletMap />
        </div>
      </section>
    </main>
  );
}

function KPI({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: "critical" | "warning" | "primary" }) {
  const color =
    accent === "critical" ? "text-risk-critical" :
    accent === "warning" ? "text-risk-warning" :
    accent === "primary" ? "text-primary" : "text-foreground";
  return (
    <div className="bg-card p-6">
      <div className="text-[10px] mono uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mono text-4xl font-semibold mt-3 ${color}`}>{value}</div>
      <div className="text-[11px] text-muted-foreground mt-2">{sub}</div>
    </div>
  );
}

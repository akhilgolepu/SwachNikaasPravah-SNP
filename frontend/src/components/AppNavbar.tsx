import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, Menu, Moon, Sun, X, Zap } from "lucide-react";
import { simStore, useSimStore } from "@/lib/simStore";

const nav = [
  { to: "/", label: "ICCC Map" },
  { to: "/inventory", label: "Inventory" },
  { to: "/dispatch", label: "Dispatch" },
];

export function AppNavbar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [open, setOpen] = useState(false);
  const [light, setLight] = useState(false);
  const storm = useSimStore((s) => s.stormMode);
  const alerts = useSimStore((s) => s.alerts);
  const wsStatus = useSimStore((s) => s.wsStatus);

  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
    document.documentElement.classList.toggle("dark", !light);
  }, [light]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto h-full max-w-[1400px] px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="relative h-7 w-7 bg-primary grid place-items-center">
                <Activity className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[15px] font-semibold tracking-tight">DrainageAI</span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mono">ICCC v1.0</span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {nav.map((n) => {
                const active = pathname === n.to;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`px-3 py-2 text-[13px] font-medium transition-colors ${
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {n.label}
                    {active && <span className="block h-px bg-primary mt-1.5 -mb-2.5" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection + alert status */}
            <div className="hidden sm:flex items-center gap-2 px-3 h-8 border border-border bg-card">
              <span className={`h-1.5 w-1.5 ${
                storm ? "bg-risk-critical pulse-dot"
                  : wsStatus === "connected" ? "bg-risk-ok"
                  : wsStatus === "connecting" ? "bg-risk-warning pulse-dot"
                  : "bg-risk-critical"
              }`} />
              <span className="text-[11px] mono uppercase tracking-wider text-muted-foreground">
                {storm ? "Flash Flood" : wsStatus === "connected" ? "Live · WS" : wsStatus === "connecting" ? "Connecting" : "Offline"}
              </span>
              <span className="text-[11px] mono text-foreground">· {alerts.length} alerts</span>
            </div>
            <button
              onClick={() => simStore.toggleStorm()}
              className={`hidden sm:flex items-center gap-1.5 px-3 h-8 border text-[11px] mono uppercase tracking-wider transition-colors ${
                storm
                  ? "border-risk-critical bg-risk-critical text-white"
                  : "border-border bg-card text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary"
              }`}
            >
              <Zap className="h-3 w-3" />
              {storm ? "Reset" : "Simulate Storm"}
            </button>
            <button
              onClick={() => setLight((v) => !v)}
              className="h-8 w-8 grid place-items-center border border-border bg-card hover:bg-primary hover:border-primary hover:text-primary-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {light ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={() => setOpen(true)}
              className="md:hidden h-8 w-8 grid place-items-center border border-border bg-card"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile 50% overlay */}
      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-background border-l border-border slide-in-right p-6 flex flex-col">
            <div className="flex justify-end">
              <button onClick={() => setOpen(false)} className="h-8 w-8 grid place-items-center border border-border">
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-1">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 text-sm font-medium border-l-2 border-transparent hover:border-primary hover:text-primary"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
      <div className="h-16" />
    </>
  );
}

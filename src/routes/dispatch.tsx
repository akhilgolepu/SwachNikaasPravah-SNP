import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSimStore, simStore } from "@/lib/simStore";
import { crews } from "@/lib/mockData";
import {
  Camera, CheckCircle2, AlertTriangle, ArrowUpRight, Users, Info,
} from "lucide-react";

export const Route = createFileRoute("/dispatch")({
  head: () => ({
    meta: [
      { title: "Dispatch & Ticket Control — DrainageAI" },
      { name: "description", content: "Convert AI insights into field maintenance dispatch tickets." },
    ],
  }),
  component: DispatchPage,
});

function DispatchPage() {
  const tickets = useSimStore((s) => s.tickets);
  const crewAvailability = useSimStore((s) => s.crewAvailability);
  const [selectedId, setSelectedId] = useState<string>(tickets[0]?.id);
  const selected = tickets.find((t) => t.id === selectedId) ?? tickets[0];
  const [selectedCrewId, setSelectedCrewId] = useState<string | null>(null);
  // Track which ticket ids are currently animating out (false positive / escalate)
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const open = tickets.filter((t) => t.status === "open").length;
  const active = tickets.filter((t) => t.status === "assigned" || t.status === "in_progress").length;
  const resolved = tickets.filter((t) => t.status === "resolved").length;

  // Check if any ticket is escalated for the diagnostic banner
  const hasEscalated = tickets.some((t) => t.status === "escalated");

  const handleDispatchCrew = () => {
    if (!selected) return;
    // If no crew explicitly selected, default to first available (closest proximity)
    const crewToDispatch = selectedCrewId
      ? crews.find((c) => c.id === selectedCrewId)
      : crews.find((c) => crewAvailability[c.id] !== false && c.available);
    if (!crewToDispatch) return;
    simStore.dispatchCrew(selected.drainId, crewToDispatch.name);
    setSelectedCrewId(null);
  };

  const handleFalsePositive = () => {
    if (!selected) return;
    const ticketId = selected.id;
    // Animate out first, then mutate
    setRemovingIds((prev) => new Set([...prev, ticketId]));
    setTimeout(() => {
      simStore.markTicketFalsePositive(ticketId);
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(ticketId);
        return next;
      });
      // Auto-select next available ticket
      const remaining = tickets.filter((t) => t.id !== ticketId);
      if (remaining.length > 0) setSelectedId(remaining[0].id);
    }, 350);
  };

  const handleEscalate = () => {
    if (!selected) return;
    simStore.escalateTicket(selected.id);
  };

  const isActionDisabled = !selected || selected.status === "resolved" || selected.status === "escalated" || selected.status === "in_progress";

  return (
    <main className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6">
      <header className="mb-6">
        <p className="text-[10px] mono uppercase tracking-widest text-muted-foreground">Operations / Dispatch</p>
        <h1 className="text-2xl font-semibold mt-2">Dispatch & Ticket Control Center</h1>
      </header>

      <section className="grid grid-cols-3 gap-px bg-border border border-border mb-6">
        <StatTile label="Open" value={open.toString()} icon={<AlertTriangle className="h-4 w-4 text-risk-critical" />} />
        <StatTile label="In Field" value={active.toString()} icon={<Users className="h-4 w-4 text-risk-warning" />} />
        <StatTile label="Resolved Today" value={resolved.toString()} icon={<CheckCircle2 className="h-4 w-4 text-risk-ok" />} />
      </section>

      {/* Escalation diagnostic banner */}
      {hasEscalated && (
        <div className="mb-6 flex items-start gap-3 px-5 py-4 border border-purple-500/40 bg-purple-500/5">
          <Info className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-[12px] font-semibold text-purple-300 uppercase tracking-wider">Escalation Active — Ward Engineer Notified</div>
            <div className="text-[11px] text-purple-400/80 mono mt-1">
              Diagnostic package transmitted · Awaiting senior engineer acknowledgement · SLA clock running
            </div>
          </div>
        </div>
      )}

      <section className="grid grid-cols-12 gap-6">
        {/* Tickets list */}
        <div className="col-span-12 lg:col-span-5">
          <div className="bento" style={{ padding: 0 }}>
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-[13px] font-semibold uppercase tracking-wider">Active Tickets</h2>
            </div>
            <div>
              {tickets.map((t) => {
                const isSel = selected?.id === t.id;
                const isRemoving = removingIds.has(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => !isRemoving && setSelectedId(t.id)}
                    className={`w-full text-left px-5 py-4 border-b border-border transition-colors ${isSel ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-surface-2"
                      } ${t.status === "escalated" ? "border-l-2 border-l-purple-500" : ""} ${isRemoving ? "fade-out-down pointer-events-none" : ""
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="mono text-[12px] font-medium">{t.id}</span>
                          <StatusPill s={t.status} />
                        </div>
                        <div className="text-[13px] font-medium mt-1">{t.drainName}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {t.ward} · {t.createdAt}{t.crew ? ` · ${t.crew}` : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`mono text-xl font-semibold ${t.status === "escalated"
                            ? "text-purple-400"
                            : t.riskIndex >= 70 ? "text-risk-critical"
                              : t.riskIndex >= 45 ? "text-risk-warning"
                                : "text-risk-ok"
                          }`}>{t.riskIndex}</div>
                        <div className="text-[9px] mono uppercase tracking-widest text-muted-foreground">RI</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detail pane */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          {selected && (
            <>
              {/* Evidence vault */}
              <div className="bento" style={{ padding: 0 }}>
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h3 className="text-[13px] font-semibold uppercase tracking-wider flex items-center gap-2">
                      <Camera className="h-3.5 w-3.5" /> Visual Evidence Vault
                    </h3>
                    <p className="text-[11px] text-muted-foreground mono mt-1">Threshold breach frame · {selected.evidenceFrame}</p>
                  </div>
                  <span className="mono text-[11px] text-muted-foreground">{selected.drainId}</span>
                </div>
                <div className="relative aspect-[16/8] bg-black overflow-hidden">
                  <div className="absolute inset-0" style={{
                    background: "linear-gradient(180deg, #1a2030 0%, #0a0f18 60%, #0a0a0a 100%)",
                  }} />
                  <div className="absolute left-0 right-0 bottom-0 h-2/5" style={{
                    background: "linear-gradient(180deg, rgba(40,60,90,0.7), rgba(10,20,40,0.95))",
                  }} />
                  <div className="absolute inset-x-10 bottom-10 h-14 border border-[#2a2a2a]" style={{
                    backgroundImage: "repeating-linear-gradient(90deg, #1a1a1a 0 10px, #0a0a0a 10px 14px)",
                  }} />
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="absolute h-2 w-3" style={{
                      left: `${15 + i * 9}%`, bottom: `${28 + (i % 3) * 4}%`,
                      background: i % 2 ? "#a89656" : "#7a5a3a",
                    }} />
                  ))}
                  <div className="absolute border-2" style={{ left: "22%", top: "50%", width: "35%", height: "35%", borderColor: "var(--color-risk-critical)" }}>
                    <span className="absolute -top-5 left-0 text-[10px] mono px-1.5 bg-risk-critical text-white">plastic 0.94</span>
                  </div>
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 border border-border">
                    <span className="text-[10px] mono uppercase tracking-widest text-white">REC · CH-014</span>
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 border border-border">
                    <span className="text-[10px] mono text-white">{selected.evidenceFrame}</span>
                  </div>
                </div>
              </div>

              {/* Crew assignment */}
              <div className="bento" style={{ padding: 0 }}>
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="text-[13px] font-semibold uppercase tracking-wider">Crew Assignment · Proximity Sort</h3>
                </div>
                <div>
                  {crews.map((c) => {
                    const isAvailable = crewAvailability[c.id] !== false && c.available;
                    return (
                      <button
                        key={c.id}
                        onClick={() => isAvailable && setSelectedCrewId(c.id)}
                        disabled={!isAvailable}
                        className={`w-full px-5 py-4 border-b border-border flex items-center justify-between transition-colors ${selectedCrewId === c.id ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-surface-2"
                          } ${!isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`h-2 w-2 transition-colors duration-500 ${isAvailable ? "bg-risk-ok pulse-dot" : "bg-[#F5A524]"
                            }`} />
                          <div className="text-left">
                            <div className="text-[13px] font-medium">{c.name} · <span className="text-muted-foreground font-normal">{c.lead}</span></div>
                            <div className="text-[11px] text-muted-foreground mono mt-0.5">
                              {c.members} safai karamcharis · {isAvailable ? "available" : "engaged"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="mono text-sm font-medium">{c.distanceKm} km</div>
                            <div className="text-[10px] mono text-muted-foreground">ETA ~{Math.round(c.distanceKm * 4)}m</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action bar */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleDispatchCrew}
                  disabled={isActionDisabled}
                  className="h-12 bg-foreground text-background hover:bg-primary hover:text-primary-foreground text-[12px] font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Dispatch Crew <ArrowUpRight className="h-4 w-4" />
                </button>
                <button
                  onClick={handleFalsePositive}
                  disabled={isActionDisabled}
                  className="h-12 border border-border text-[12px] font-medium uppercase tracking-widest hover:border-foreground hover:bg-surface-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  False Positive
                </button>
                <button
                  onClick={handleEscalate}
                  disabled={isActionDisabled}
                  className="h-12 border border-risk-warning text-risk-warning text-[12px] font-medium uppercase tracking-widest hover:bg-risk-warning hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Escalate · Sr. Engineer
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function StatTile({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-card p-6 flex items-center justify-between">
      <div>
        <div className="text-[10px] mono uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="mono text-3xl font-semibold mt-2">{value}</div>
      </div>
      <div className="h-10 w-10 grid place-items-center border border-border">{icon}</div>
    </div>
  );
}

function StatusPill({ s }: { s: string }) {
  const m: Record<string, { c: string; t: string }> = {
    open: { c: "bg-risk-critical text-white", t: "OPEN" },
    assigned: { c: "bg-risk-warning text-black", t: "ASSIGNED" },
    in_progress: { c: "bg-primary text-white", t: "IN FIELD" },
    resolved: { c: "bg-risk-ok text-black", t: "RESOLVED" },
    escalated: { c: "bg-purple-500 text-white", t: "ESCALATED TO WARD ENGINEER" },
  };
  const v = m[s] ?? m.open;
  return <span className={`text-[9px] mono uppercase tracking-widest px-1.5 py-0.5 ${v.c}`}>{v.t}</span>;
}

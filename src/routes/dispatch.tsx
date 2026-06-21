import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Camera, CheckCircle2, AlertTriangle, ArrowUpRight, Users } from "lucide-react";
import { toast } from "sonner";
import { simStore, useSimStore } from "@/lib/simStore";

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
  const crews = useSimStore((s) => s.crews);
  const [selectedId, setSelectedId] = useState<string>(tickets[0]?.id);
  const [selectedCrewId, setSelectedCrewId] = useState<string | null>(null);
  const [resolvingIds, setResolvingIds] = useState<string[]>([]);
  const [purging, setPurging] = useState<string | null>(null);
  const [escalationBanner, setEscalationBanner] = useState<string | null>(null);

  const visibleTickets = tickets.filter(
    (t) =>
      (t.status !== "resolved" || resolvingIds.includes(t.id)) &&
      (t.status !== "false_positive" || purging === t.id)
  );

  const selected = visibleTickets.find((t) => t.id === selectedId) ?? visibleTickets[0];

  // Auto-select the next ticket if the selected one is resolved/removed
  useEffect(() => {
    if (visibleTickets.length > 0 && !visibleTickets.some((t) => t.id === selectedId)) {
      setSelectedId(visibleTickets[0].id);
    }
  }, [visibleTickets, selectedId]);

  const open = tickets.filter((t) => t.status === "open").length;
  const inField = tickets.filter((t) => t.status === "in_progress").length;
  const resolved = tickets.filter((t) => t.status === "resolved" || t.status === "false_positive").length;

  const handleDispatch = () => {
    if (!selected) return;
    const crew = (selectedCrewId ? crews.find((c) => c.id === selectedCrewId && c.available) : null)
      ?? crews.find((c) => c.available);
    if (!crew) {
      toast.error("No available crews. Recall an engaged team first.");
      return;
    }
    simStore.dispatchTicket(selected.id, crew.name);
    setSelectedCrewId(null);
    toast.success("Routing coordinates and threshold analytics successfully transmitted to Field Crew.", {
      description: `${crew.name} · ETA ~${Math.round(crew.distanceKm * 4)}m`,
    });
  };

  const handleFalsePositive = () => {
    if (!selected) return;
    const id = selected.id;
    setPurging(id);
    toast.message("Visual data logged. Frame forwarded to the training data pipeline for model retraining optimization.");
    setTimeout(() => {
      simStore.markFalsePositive(id);
      setPurging(null);
      const next = tickets.find((t) => t.id !== id && t.status !== "false_positive");
      if (next) setSelectedId(next.id);
    }, 420);
  };

  const handleEscalate = () => {
    if (!selected) return;
    simStore.escalateTicket(selected.id);
    setEscalationBanner(selected.id);
    toast.warning(`Ticket ${selected.id} escalated to Ward Engineer.`, {
      description: "Sr. Engineer notification dispatched via priority channel.",
    });
    setTimeout(() => setEscalationBanner(null), 6000);
  };

  return (
    <main className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6">
      <header className="mb-6">
        <p className="text-[10px] mono uppercase tracking-widest text-muted-foreground">Operations / Dispatch</p>
        <h1 className="text-2xl font-semibold mt-2">Dispatch & Ticket Control Center</h1>
      </header>

      <section className="grid grid-cols-3 gap-px bg-border border border-border mb-6">
        <StatTile label="Open" value={open.toString()} icon={<AlertTriangle className="h-4 w-4 text-risk-critical" />} />
        <StatTile label="In Field" value={inField.toString()} icon={<Users className="h-4 w-4 text-risk-warning" />} />
        <StatTile label="Resolved Today" value={resolved.toString()} icon={<CheckCircle2 className="h-4 w-4 text-risk-ok" />} />
      </section>

      {escalationBanner && (
        <div className="mb-6 border border-[#8B5CF6] bg-[#8B5CF6]/10 px-4 py-3 flex items-start justify-between">
          <div>
            <div className="text-[11px] mono uppercase tracking-widest text-[#C4B5FD]">Escalation Notice</div>
            <div className="text-sm mt-1">
              Ticket <span className="mono">{escalationBanner}</span> handed to Ward Engineer. Diagnostic packet attached.
            </div>
          </div>
          <button onClick={() => setEscalationBanner(null)} className="text-[10px] mono uppercase tracking-widest text-muted-foreground hover:text-foreground">dismiss</button>
        </div>
      )}

      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-5">
          <div className="bento" style={{ padding: 0 }}>
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-[13px] font-semibold uppercase tracking-wider">Active Tickets</h2>
            </div>
            <div>
              {visibleTickets.map((t) => {
                const isSel = selected?.id === t.id;
                const isResolving = resolvingIds.includes(t.id);
                const isEsc = t.status === "escalated";
                const isPurging = purging === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    style={{
                      transition: "opacity 500ms ease, transform 500ms ease, max-height 500ms ease, padding 500ms ease",
                      opacity: isPurging ? 0 : isResolving ? 0 : 1,
                      transform: isPurging ? "translateX(40px)" : isResolving ? "scaleY(0)" : "none",
                      maxHeight: isResolving ? "0px" : "150px",
                      paddingTop: isResolving ? "0px" : "16px",
                      paddingBottom: isResolving ? "0px" : "16px",
                    }}
                    className={`w-full text-left px-5 border-b border-border transition-all duration-500 ease-in-out transform origin-top overflow-hidden ${
                      isResolving ? "py-0 border-b-transparent pointer-events-none" : ""
                    } ${
                      isEsc
                        ? isSel
                          ? "bg-purple-950/40 border-l-4 border-l-purple-500"
                          : "bg-purple-950/10 border-l-2 border-l-purple-700/50 hover:bg-purple-950/20"
                        : isSel
                        ? "bg-primary/10 border-l-2 border-l-primary"
                        : "hover:bg-surface-2"
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
                        <div className={`mono text-xl font-semibold ${
                          isEsc ? "text-[#C4B5FD] font-bold" :
                          t.riskIndex >= 70 ? "text-risk-critical" : t.riskIndex >= 45 ? "text-risk-warning" : "text-risk-ok"
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

        <div className="col-span-12 lg:col-span-7 space-y-6">
          {selected && (
            <>
              {/* Diagnostic Info Banner */}
              {selected.status === "escalated" && (
                <div className="bg-purple-950/40 border border-purple-500/30 p-4 text-purple-200 text-[12px] flex items-start gap-3 rounded animate-pulse">
                  <AlertTriangle className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold uppercase tracking-wider text-purple-300">Diagnostic Info: Ward Engineering Overload</div>
                    <p className="mt-1 text-purple-300/80">Hydraulic surge detected in local downstream branch. Diverting emergency auxiliary flow sensors. Dispatch protocol upgraded to level 2 (Senior Engineer inspection required).</p>
                  </div>
                </div>
              )}

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
                  <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a2030 0%, #0a0f18 60%, #0a0a0a 100%)" }} />
                  <div className="absolute left-0 right-0 bottom-0 h-2/5" style={{ background: "linear-gradient(180deg, rgba(40,60,90,0.7), rgba(10,20,40,0.95))" }} />
                  <div className="absolute inset-x-10 bottom-10 h-14 border border-[#2a2a2a]" style={{ backgroundImage: "repeating-linear-gradient(90deg, #1a1a1a 0 10px, #0a0a0a 10px 14px)" }} />
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="absolute h-2 w-3" style={{ left: `${15 + i * 9}%`, bottom: `${28 + (i % 3) * 4}%`, background: i % 2 ? "#a89656" : "#7a5a3a" }} />
                  ))}
                  <div className={`absolute border-2 ${selected.status === "escalated" ? "border-purple-500" : "border-risk-critical"}`} style={{ left: "22%", top: "50%", width: "35%", height: "35%" }}>
                    <span className={`absolute -top-5 left-0 text-[10px] mono px-1.5 text-white ${selected.status === "escalated" ? "bg-purple-600" : "bg-risk-critical"}`}>plastic 0.94</span>
                  </div>
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 border border-border">
                    <span className="text-[10px] mono uppercase tracking-widest text-white">REC · {selected.drainId}</span>
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 border border-border">
                    <span className="text-[10px] mono text-white">{selected.evidenceFrame}</span>
                  </div>
                </div>
              </div>

              <div className="bento" style={{ padding: 0 }}>
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold uppercase tracking-wider">Crew Assignment · Proximity Sort</h3>
                  <span className="text-[10px] mono uppercase tracking-widest text-muted-foreground">
                    {selectedCrewId ? `Selected: ${crews.find((c) => c.id === selectedCrewId)?.name}` : "Auto: closest available"}
                  </span>
                </div>
                <div>
                  {crews.map((c) => {
                    const isPicked = selectedCrewId === c.id;
                    return (
                      <div
                        key={c.id}
                        className={`px-5 py-4 border-b border-border flex items-center justify-between transition-colors ${
                          c.available && selected.status !== "resolved" && selected.status !== "false_positive" ? "cursor-pointer" : ""
                        } ${
                          isPicked ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-surface-2"
                        }`}
                        onClick={() => c.available && selected.status !== "resolved" && selected.status !== "false_positive" && setSelectedCrewId(isPicked ? null : c.id)}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`h-2 w-2 rounded-full ${c.available ? "bg-risk-ok pulse-dot" : "bg-risk-warning"}`} />
                          <div>
                            <div className="text-[13px] font-medium">{c.name} · <span className="text-muted-foreground font-normal">{c.lead}</span></div>
                            <div className="text-[11px] text-muted-foreground mono mt-0.5">{c.members} safai karamcharis · {c.available ? "available" : "engaged"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="mono text-sm font-medium">{c.distanceKm} km</div>
                            <div className="text-[10px] mono text-muted-foreground">ETA ~{Math.round(c.distanceKm * 4)}m</div>
                          </div>
                          <button
                            disabled={!c.available || selected.status === "resolved" || selected.status === "false_positive"}
                            onClick={(e) => { e.stopPropagation(); setSelectedCrewId(isPicked ? null : c.id); }}
                            className="px-3 h-9 bg-foreground text-background hover:bg-primary hover:text-primary-foreground text-[11px] font-semibold uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {isPicked ? "Selected" : "Assign"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleDispatch}
                  disabled={selected.status === "in_progress" || selected.status === "resolved" || selected.status === "false_positive"}
                  className="h-12 bg-foreground text-background hover:bg-primary hover:text-primary-foreground text-[12px] font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Dispatch Crew <ArrowUpRight className="h-4 w-4" />
                </button>
                {selected.status === "in_progress" ? (
                  <button
                    disabled={selected.status === "resolved"}
                    onClick={() => {
                      setResolvingIds((prev) => [...prev, selected.id]);
                      toast.success("Ticket resolved successfully. Site status updated to normal.");
                      setTimeout(() => {
                        simStore.resolveTicket(selected.id);
                        setResolvingIds((prev) => prev.filter((id) => id !== selected.id));
                      }, 500);
                    }}
                    className="h-12 border border-border text-[12px] font-medium uppercase tracking-widest hover:border-foreground hover:bg-surface-2 transition-colors disabled:opacity-40"
                  >
                    Resolve Ticket
                  </button>
                ) : (
                  <button
                    disabled={selected.status === "resolved" || selected.status === "false_positive"}
                    onClick={handleFalsePositive}
                    className="h-12 border border-border text-[12px] font-medium uppercase tracking-widest hover:border-foreground hover:bg-surface-2 transition-colors disabled:opacity-40"
                  >
                    False Positive
                  </button>
                )}
                <button
                  disabled={selected.status === "resolved" || selected.status === "false_positive" || selected.status === "escalated"}
                  onClick={handleEscalate}
                  className="h-12 border border-risk-warning text-risk-warning text-[12px] font-medium uppercase tracking-widest hover:bg-risk-warning hover:text-black transition-colors disabled:opacity-40"
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
    false_positive: { c: "bg-muted text-muted-foreground", t: "FALSE POSITIVE" },
    escalated: { c: "bg-purple-600 text-white border border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-pulse", t: "ESCALATED TO WARD ENGINEER" },
  };
  const v = m[s] ?? m.open;
  return <span className={`text-[9px] mono uppercase tracking-widest px-1.5 py-0.5 ${v.c}`}>{v.t}</span>;
}

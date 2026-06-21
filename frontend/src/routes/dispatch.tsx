import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Camera, CheckCircle2, AlertTriangle, ArrowUpRight, Users } from "lucide-react";
import { toast } from "sonner";
import { getInferenceStreamURL } from "@/lib/api";
import { simStore, useSimStore } from "@/lib/simStore";
import { motion } from "framer-motion";

export const Route = createFileRoute("/dispatch")({
  head: () => ({
    meta: [
      { title: "Dispatch & Ticket Control — SwachNikaasPravah-SNP" },
      { name: "description", content: "Convert AI insights into field maintenance dispatch tickets." },
    ],
  }),
  component: DispatchPage,
});

function DispatchPage() {
  const tickets = useSimStore((s) => s.tickets);
  const crews = useSimStore((s) => s.crews);
  const [selectedId, setSelectedId] = useState<string>("");
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

  // Auto-select the first ticket once loaded
  useEffect(() => {
    if (visibleTickets.length > 0 && !selectedId) {
      setSelectedId(visibleTickets[0].id);
    }
  }, [visibleTickets, selectedId]);

  // Auto-select the next ticket if the selected one is resolved/removed
  useEffect(() => {
    if (visibleTickets.length > 0 && !visibleTickets.some((t) => t.id === selectedId)) {
      setSelectedId(visibleTickets[0].id);
    }
  }, [visibleTickets, selectedId]);

  const open = tickets.filter((t) => t.status === "open").length;
  const inField = tickets.filter((t) => t.status === "in_progress").length;
  const resolved = tickets.filter((t) => t.status === "resolved" || t.status === "false_positive").length;

  const handleDispatch = async () => {
    if (!selected) return;
    const crew = (selectedCrewId ? crews.find((c) => c.id === selectedCrewId && c.available) : null)
      ?? crews.find((c) => c.available);
    if (!crew) {
      toast.error("No available crews. Recall an engaged team first.");
      return;
    }
    await simStore.dispatchCrew(selected.drain_id, crew.name);
    setSelectedCrewId(null);
    toast.success("Routing coordinates and threshold analytics successfully transmitted to Field Crew.", {
      description: `${crew.name} · ETA ~${Math.round(crew.distance_km * 4)}m`,
    });
  };

  const handleFalsePositive = async () => {
    if (!selected) return;
    const id = selected.id;
    setPurging(id);
    toast.message("Visual data logged. Frame forwarded to the training data pipeline for model retraining optimization.");
    setTimeout(async () => {
      await simStore.markFalsePositive(id);
      setPurging(null);
      const next = tickets.find((t) => t.id !== id && t.status !== "false_positive");
      if (next) setSelectedId(next.id);
    }, 420);
  };

  const handleEscalate = async () => {
    if (!selected) return;
    await simStore.escalateTicket(selected.id);
    setEscalationBanner(selected.id);
    toast.warning(`Ticket ${selected.id} escalated to Ward Engineer.`, {
      description: "Sr. Engineer notification dispatched via priority channel.",
    });
    setTimeout(() => setEscalationBanner(null), 6000);
  };

  return (
    <main className="space-y-8 relative z-10">
      <header className="mb-6">
        <p className="text-[10px] mono uppercase tracking-widest text-[#00F2FF]">Operations / Dispatch</p>
        <h1 className="text-3xl font-semibold mt-2 text-white glow-text">Dispatch & Ticket Control Center</h1>
      </header>

      <section className="grid grid-cols-3 gap-6 mb-6">
        <StatTile label="Open" value={open.toString()} icon={<AlertTriangle className="h-6 w-6 text-[#FF3B3B]" />} />
        <StatTile label="In Field" value={inField.toString()} icon={<Users className="h-6 w-6 text-[#F5A524]" />} />
        <StatTile label="Resolved Today" value={resolved.toString()} icon={<CheckCircle2 className="h-6 w-6 text-[#17C964]" />} />
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

      <section className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-5">
          <div className="glass-card overflow-hidden h-full flex flex-col" style={{ padding: 0 }}>
            <div className="px-6 py-5 border-b border-white/10 bg-white/5">
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-white">Active Tickets</h2>
            </div>
            <div className="overflow-y-auto flex-1">
              {visibleTickets.map((t) => {
                const isSel = selected?.id === t.id;
                const isResolving = resolvingIds.includes(t.id);
                const isEsc = t.status === "escalated";
                const isPurging = purging === t.id;
                return (
                  <motion.div
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    role="button"
                    tabIndex={0}
                    whileHover={{ translateY: -2, boxShadow: "0 0 15px rgba(0, 102, 255, 0.2)", backgroundColor: "rgba(255,255,255,0.05)" }}
                    style={{
                      transition: "all 500ms cubic-bezier(0.4, 0, 0.2, 1)",
                      opacity: isPurging ? 0 : isResolving ? 0 : 1,
                      transform: isPurging ? "translateX(40px)" : isResolving ? "scaleY(0)" : "none",
                      maxHeight: isResolving ? "0px" : "150px",
                      paddingTop: isResolving ? "0px" : "20px",
                      paddingBottom: isResolving ? "0px" : "20px",
                    }}
                    className={`w-full text-left px-6 border-b border-white/5 transition-all duration-300 ease-in-out origin-top overflow-hidden text-white cursor-pointer ${
                      isResolving ? "py-0 border-b-transparent pointer-events-none" : ""
                    } ${
                      isEsc
                        ? isSel
                          ? "bg-[#7000FF]/40 border-l-4 border-l-[#7000FF] shadow-[inset_10px_0_20px_rgba(112,0,255,0.2)]"
                          : "bg-[#7000FF]/10 border-l-2 border-l-[#7000FF]/50"
                        : isSel
                        ? "bg-[#0066FF]/20 border-l-4 border-l-[#0066FF] shadow-[inset_10px_0_20px_rgba(0,102,255,0.2)]"
                        : "border-l-4 border-l-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="mono text-[12px] font-medium opacity-80">{t.id}</span>
                          <StatusPill s={t.status} />
                        </div>
                        <div className="text-[14px] font-semibold mt-1.5">{t.drain_name}</div>
                        <div className="text-[11px] text-white/50 mt-1">
                          {t.ward} · {t.created_at}{t.crew ? ` · ${t.crew}` : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`mono text-2xl font-bold ${
                          isEsc ? "text-[#C4B5FD] drop-shadow-[0_0_8px_rgba(196,181,253,0.8)]" :
                          t.risk_index >= 70 ? "text-[#FF3B3B] drop-shadow-[0_0_8px_rgba(255,59,59,0.8)]" : t.risk_index >= 45 ? "text-[#F5A524]" : "text-[#17C964]"
                        }`}>{t.risk_index}</div>
                        <div className="text-[9px] mono uppercase tracking-widest text-white/40 mt-1">RI</div>
                      </div>
                    </div>
                  </motion.div>
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
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-purple-950/40 border border-purple-500/30 p-4 text-purple-200 text-[12px] flex items-start gap-3 rounded animate-pulse"
                >
                  <AlertTriangle className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold uppercase tracking-wider text-purple-300">Diagnostic Info: Ward Engineering Overload</div>
                    <p className="mt-1 text-purple-300/80">Hydraulic surge detected in local downstream branch. Diverting emergency auxiliary flow sensors. Dispatch protocol upgraded to level 2 (Senior Engineer inspection required).</p>
                  </div>
                </motion.div>
              )}

              {/* Evidence vault */}
              <div className="glass-card overflow-hidden group" style={{ padding: 0 }}>
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                  <div>
                    <h3 className="text-[13px] font-semibold uppercase tracking-wider flex items-center gap-2 text-white">
                      <Camera className="h-3.5 w-3.5 text-[#00F2FF]" /> Visual Evidence Vault
                    </h3>
                    <p className="text-[11px] text-white/50 mono mt-1">Threshold breach frame · {selected.evidence_frame}</p>
                  </div>
                  <span className="mono text-[11px] text-[#0066FF] font-bold bg-[#0066FF]/10 px-2 py-1 rounded-md">{selected.drain_id}</span>
                </div>
                <div className="relative aspect-[16/8] bg-black overflow-hidden">
                  {/* Fallback gradient — z-0 so video sits above it */}
                  <div className="absolute inset-0 z-0 pointer-events-none" style={{
                    background: "linear-gradient(180deg, #1a2030 0%, #0a0f18 60%, #0a0a0a 100%)",
                  }} />
                  <div className="absolute left-0 right-0 bottom-0 h-2/5 z-0 pointer-events-none" style={{
                    background: "linear-gradient(180deg, rgba(40,60,90,0.7), rgba(10,20,40,0.95))",
                  }} />

                  {/* MJPEG stream — continuous YOLO-annotated video */}
                  <img
                    src={getInferenceStreamURL(selected.drain_id)}
                    alt={`Evidence stream — ${selected.drain_id}`}
                    className="absolute inset-0 w-full h-full object-cover z-[1]"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />

                  {/* HUD overlays */}
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded border border-white/10 z-[5]">
                    <span className="text-[10px] mono uppercase tracking-widest text-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B3B] animate-pulse"></span> LIVE · {selected.drain_id}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded border border-white/10 z-[5]">
                    <span className="text-[10px] mono text-white">{selected.evidence_frame}</span>
                  </div>
                  
                  {/* Scanner overlay effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none z-[2]" style={{ backgroundImage: 'linear-gradient(rgba(0, 242, 255, 0.2) 1px, transparent 1px)', backgroundSize: '100% 4px' }} />
                </div>
              </div>

              {/* Crew assignment */}
              <div className="glass-card overflow-hidden" style={{ padding: 0 }}>
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                  <h3 className="text-[13px] font-semibold uppercase tracking-wider text-white">Crew Assignment · Proximity Sort</h3>
                  <span className="text-[10px] mono uppercase tracking-widest text-[#00F2FF]">
                    {selectedCrewId ? `Selected: ${crews.find((c) => c.id === selectedCrewId)?.name}` : "Auto: closest available"}
                  </span>
                </div>
                <div>
                  {crews.map((c) => {
                    const isPicked = selectedCrewId === c.id;
                    return (
                      <motion.div
                        key={c.id}
                        whileHover={c.available && selected.status !== "resolved" && selected.status !== "false_positive" ? { translateY: -2, boxShadow: "0 0 10px rgba(0, 102, 255, 0.1)", backgroundColor: "rgba(255,255,255,0.03)" } : {}}
                        className={`px-6 py-5 border-b border-white/5 flex items-center justify-between transition-all duration-300 ${
                          c.available && selected.status !== "resolved" && selected.status !== "false_positive" ? "cursor-pointer" : ""
                        } ${
                          isPicked ? "bg-[#0066FF]/10 border-l-4 border-l-[#0066FF]" : "border-l-4 border-l-transparent"
                        }`}
                        onClick={() => c.available && selected.status !== "resolved" && selected.status !== "false_positive" && setSelectedCrewId(isPicked ? null : c.id)}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`h-2.5 w-2.5 rounded-full ${c.available ? "bg-[#17C964] shadow-[0_0_8px_rgba(23,201,100,0.8)] animate-pulse" : "bg-[#F5A524]"}`} />
                          <div>
                            <div className="text-[14px] font-semibold text-white">{c.name} · <span className="text-white/60 font-normal">{c.lead}</span></div>
                            <div className="text-[11px] text-white/40 mono mt-1">{c.members} safai karamcharis · <span className={c.available ? "text-[#17C964]" : "text-[#F5A524]"}>{c.available ? "available" : "engaged"}</span></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="mono text-lg font-bold text-white">{c.distance_km} km</div>
                            <div className="text-[10px] mono text-[#00F2FF]">ETA ~{Math.round(c.distance_km * 4)}m</div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1, boxShadow: "0 0 10px rgba(0, 102, 255, 0.3)" }}
                            disabled={!c.available || selected.status === "resolved" || selected.status === "false_positive"}
                            onClick={(e) => { e.stopPropagation(); setSelectedCrewId(isPicked ? null : c.id); }}
                            className={`px-4 h-10 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                              isPicked 
                                ? "bg-[#0066FF] text-white shadow-[0_0_15px_rgba(0,102,255,0.5)] border-transparent" 
                                : "bg-[#0066FF]/20 text-white"
                            }`}
                          >
                            {isPicked ? "Selected" : "Assign"}
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Action bar */}
              <div className="grid grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0, 102, 255, 0.4)" }}
                  onClick={handleDispatch}
                  disabled={selected.status === "in_progress" || selected.status === "resolved" || selected.status === "false_positive"}
                  className="h-14 rounded-xl bg-[#0066FF] text-white text-[12px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  Dispatch Crew <ArrowUpRight className="h-4 w-4" />
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent hover:animate-[shimmer_1.5s_infinite]" />
                </motion.button>
                {selected.status === "in_progress" ? (
                  <motion.button
                    whileHover={{ scale: 1.05, borderColor: "var(--status-ok)" }}
                    disabled={selected.status === "resolved"}
                    onClick={() => {
                      setResolvingIds((prev) => [...prev, selected.id]);
                      toast.success("Ticket resolved successfully. Site status updated to normal.");
                      setTimeout(async () => {
                        await simStore.resolveTicket(selected.id);
                        setResolvingIds((prev) => prev.filter((id) => id !== selected.id));
                      }, 500);
                    }}
                    className="h-14 rounded-xl border-2 border-[#17C964] text-[#17C964] text-[12px] font-bold uppercase tracking-widest transition-all disabled:opacity-30 shadow-[0_0_15px_rgba(23,201,100,0.2)]"
                  >
                    Resolve Ticket
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05, borderColor: "var(--brand-primary)" }}
                    disabled={selected.status === "resolved" || selected.status === "false_positive"}
                    onClick={handleFalsePositive}
                    className="h-14 rounded-xl border-2 border-white/10 text-white text-[12px] font-bold uppercase tracking-widest transition-all disabled:opacity-30"
                  >
                    False Positive
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "var(--status-critical)", color: "white" }}
                  disabled={selected.status === "resolved" || selected.status === "false_positive" || selected.status === "escalated"}
                  onClick={handleEscalate}
                  className="h-14 rounded-xl border-2 border-[#F5A524] text-[#F5A524] text-[12px] font-bold uppercase tracking-widest transition-all disabled:opacity-30 shadow-[0_0_15px_rgba(245,165,36,0.2)]"
                >
                  Escalate · Sr. Engineer
                </motion.button>
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
    <motion.div 
      whileHover={{ translateY: -4, boxShadow: "0 0 20px rgba(0, 102, 255, 0.3)" }}
      className="glass-card p-6 flex items-center justify-between relative overflow-hidden group transition-all duration-300"
    >
      <div className="absolute inset-0 kinetic-gradient opacity-10 pointer-events-none transition-opacity group-hover:opacity-20" />
      <div className="relative z-10">
        <div className="text-[10px] mono uppercase tracking-widest text-white/40">{label}</div>
        <div className="mono text-4xl font-bold mt-2 text-white">{value}</div>
      </div>
      <div className="h-14 w-14 rounded-2xl grid place-items-center glass-card border border-white/10 relative z-10 shadow-lg">{icon}</div>
    </motion.div>
  );
}

function StatusPill({ s }: { s: string }) {
  const m: Record<string, { c: string; t: string }> = {
    open: { c: "bg-[#FF3B3B]/20 text-[#FF3B3B] border border-[#FF3B3B]/30", t: "OPEN" },
    assigned: { c: "bg-[#F5A524]/20 text-[#F5A524] border border-[#F5A524]/30", t: "ASSIGNED" },
    in_progress: { c: "bg-[#0066FF]/20 text-[#0066FF] border border-[#0066FF]/30", t: "IN FIELD" },
    resolved: { c: "bg-[#17C964]/20 text-[#17C964] border border-[#17C964]/30", t: "RESOLVED" },
    false_positive: { c: "bg-white/10 text-white/40 border border-white/10", t: "FALSE POSITIVE" },
    escalated: { c: "bg-[#7000FF]/30 text-[#D8B4FE] border border-[#7000FF]/50 shadow-[0_0_15px_rgba(112,0,255,0.4)] animate-pulse", t: "ESCALATED TO WARD ENGINEER" },
  };
  const v = m[s] ?? m.open;
  return <span className={`text-[9px] mono uppercase tracking-widest px-2 py-0.5 rounded-full ${v.c}`}>{v.t}</span>;
}

# Gemini Model Instructions: Dispatch Page (DrainageAI v2.0)

## Objective

Generate the React/TypeScript code for the `DispatchPage` component, implementing the hyper-modern design principles for the ticket management and crew assignment interface. The page must be visually dynamic, highly interactive, and responsive, aligning with the overall DrainageAI v2.0 aesthetic.

## Key Requirements

1.  **Overall Page Structure**:
    *   The main content area (`<main>`) should adopt the `glass-card` aesthetic, providing a subtle backdrop blur and a clean, layered appearance. Maintain `max-w-[1400px] px-4 sm:px-6 py-6` for consistent layout.
    *   The page header (`<header>`) should use `Inter Tight` for titles and `JetBrains Mono` for labels. Apply a subtle `glow-text` effect to the main title (`Dispatch & Ticket Control Center`).

2.  **Top KPI Section (Stat Tiles)**:
    *   **Container**: The KPI section will be a `glass-card` with `rounded-xl` corners, maintaining the grid layout. Each `StatTile` will be a distinct, interactive `glass-card` with `rounded-xl` corners.
    *   **Appearance**: `bg-glass` background, `border-glass-border`. The icon container (`h-10 w-10 grid place-items-center border border-border`) will also be `glass-card` styled with `rounded-md`.
    *   **Hover Effect**: On hover, the tile should subtly `translateY(-4px)` and gain a light `box-shadow` (`shadow-glow-primary`).
    *   **Icon**: The icons (`AlertTriangle`, `Users`, `CheckCircle2`) will retain their color but will be rendered within a `glass-card` styled container, potentially with a subtle animation on update.
    *   **Typography**: `label` will use `font-mono uppercase tracking-widest text-white/40`, and `value` will be `mono text-3xl font-semibold`.

3.  **Tickets List (Left Panel)**:
    *   **Container**: The entire tickets list panel (`col-span-12 lg:col-span-5`) will be a `glass-card` with `rounded-xl` corners.
    *   **Header**: The header (`Active Tickets`) will use `font-mono uppercase tracking-wider text-white/40`.
    *   **Ticket Items**: Each ticket item will be a distinct, interactive `glass-card` styled element.
        *   **Appearance**: `rounded-lg` or `rounded-xl`, `bg-white/5` and `border-white/5`.
        *   **Hover Effect**: On hover, the item should subtly `translateY(-2px)` and gain a light `box-shadow` (`shadow-glow-primary`). The background should lighten (`bg-white/10`).
        *   **Selected State**: The selected ticket will have a prominent `border-l-4 border-l-brand-primary` and a slightly more intense background (`bg-brand-primary/10`).
        *   **Escalated State**: Escalated tickets will have a distinct purple theme (`bg-purple-950/40`, `border-l-purple-500`) and a subtle `pulse` animation on the border or background to indicate urgency.
        *   **Status Pill**: The `StatusPill` component will be redesigned with `rounded-full` shapes and vibrant colors, potentially with a subtle animation for status changes.
        *   **Typography**: `drain_name` will be `text-sm font-medium`, `id` will be `mono text-xs font-medium`, and `risk_index` will be `mono text-xl font-semibold` with dynamic color based on risk.

4.  **Detail Pane (Right Panel)**:
    *   **Container**: Each sub-section within the detail pane (Diagnostic Info, Visual Evidence, Crew Assignment) will be a `glass-card` with `rounded-xl` corners.
    *   **Diagnostic Info Banner**: This banner will be a `glass-card` with `rounded-md` corners. The `animate-pulse` will be retained, but the overall aesthetic will be more refined with a subtle purple glow.
    *   **Visual Evidence Vault**:
        *   **Container**: `glass-card` with `rounded-xl` corners.
        *   **Image Frame**: The image frame will have `rounded-md` corners. The fallback gradient will be updated to align with the new color palette and gradient style.
        *   **Overlay Elements**: The `REC` and timestamp overlays will be `glass-card` styled with `rounded-sm` corners.
    *   **Crew Assignment**:
        *   **Container**: `glass-card` with `rounded-xl` corners.
        *   **Crew Items**: Each crew item will be a distinct, interactive `glass-card` styled element with `rounded-lg` corners.
            *   **Hover Effect**: Similar to ticket items, a subtle `translateY(-2px)` and `box-shadow` on hover.
            *   **Selected Crew**: Highlighted with a `border-l-4 border-l-brand-primary`.
            *   **Assign Button**: Redesigned with `rounded-md` corners, `bg-brand-primary` on hover, and a subtle `shimmer` effect.
    *   **Action Bar**: The action buttons (`Dispatch Crew`, `False Positive / Resolve`, `Escalate`) will be redesigned.
        *   **Appearance**: `rounded-md` corners, `h-12` height.
        *   **Dispatch Crew**: `bg-brand-primary` with `glow-text` on label. On hover, `scale-105` and a subtle `shimmer`.
        *   **Resolve**: `glass-card` styled button with `border-glass-border` and `hover:border-brand-primary`.
        *   **Escalate**: `glass-card` styled button with `border-status-critical` and `text-status-critical`. On hover, `bg-status-critical` and `text-white`.

## Implementation Details

-   Utilize `motion.div` for the main page sections, `StatTile` components, ticket items, and crew items to implement entry and hover animations.
-   Ensure the `StatusPill` component is updated to use the new rounded aesthetic and vibrant colors.
-   The `Visual Evidence Vault` should integrate the new gradient styles for its fallback background.
-   Integrate the redesigned `DispatchPage` into `src/routes/dispatch.tsx`.
-   Ensure responsiveness for all sections on various screen sizes.

## Example Code Snippets (Conceptual)

```tsx
import { motion } from "framer-motion";
import { Camera, CheckCircle2, AlertTriangle, ArrowUpRight, Users } from "lucide-react";
// ... other imports and existing logic

function DispatchPage() {
  // ... existing state and memoized tickets/crews

  return (
    <main className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 glass-card">
      <header className="mb-6">
        <p className="text-[10px] mono uppercase tracking-widest text-white/40">Operations / Dispatch</p>
        <h1 className="text-2xl font-semibold mt-2 glow-text">Dispatch & Ticket Control Center</h1>
      </header>

      {/* Stat Tiles */}
      <section className="glass-card rounded-xl p-5 mb-6 grid grid-cols-3 gap-6">
        <StatTile label="Open" value={open.toString()} icon={<AlertTriangle className="h-4 w-4 text-status-critical" />} />
        <StatTile label="In Field" value={active.toString()} icon={<Users className="h-4 w-4 text-status-warning" />} />
        <StatTile label="Resolved Today" value={resolved.toString()} icon={<CheckCircle2 className="h-4 w-4 text-status-ok" />} />
      </section>

      <section className="grid grid-cols-12 gap-6">
        {/* Tickets list */}
        <div className="col-span-12 lg:col-span-5 glass-card rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-glass-border">
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-white/40">Active Tickets</h2>
          </div>
          <div>
            {visibleTickets.map((t) => {
              const isSel = selected?.id === t.id;
              const isEscalated = t.status === "escalated";
              return (
                <motion.button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  whileHover={{ translateY: -2, boxShadow: "0 0 15px rgba(0, 102, 255, 0.2)", backgroundColor: "rgba(255,255,255,0.05)" }}
                  className={`w-full text-left px-5 py-4 transition-all duration-300 rounded-lg border border-glass-border ${isSel ? "bg-brand-primary/10 border-l-4 border-l-brand-primary" : ""} ${isEscalated ? "bg-purple-950/40 border-l-4 border-l-purple-500 animate-pulse" : ""}`}
                >
                  {/* ... ticket content */}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Detail pane */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          {selected && (
            <>
              {/* Diagnostic Info Banner */}
              {selected.status === "escalated" && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-md bg-purple-950/40 border border-purple-500/30 p-4 text-purple-200 text-[12px] flex items-start gap-3 animate-pulse"
                >
                  {/* ... content */}
                </motion.div>
              )}

              {/* Visual Evidence Vault */}
              <div className="glass-card rounded-xl p-0">
                <div className="px-5 py-4 border-b border-glass-border flex items-center justify-between">
                  {/* ... header content */}
                </div>
                <div className="relative aspect-[16/8] bg-black overflow-hidden rounded-b-xl">
                  {/* ... image and fallback gradient */}
                </div>
              </div>

              {/* Crew assignment */}
              <div className="glass-card rounded-xl p-0">
                <div className="px-5 py-4 border-b border-glass-border">
                  <h3 className="text-[13px] font-semibold uppercase tracking-wider text-white/40">Crew Assignment · Proximity Sort</h3>
                </div>
                <div>
                  {crews.map((c) => (
                    <motion.div
                      key={c.id}
                      whileHover={{ translateY: -2, boxShadow: "0 0 10px rgba(0, 102, 255, 0.1)", backgroundColor: "rgba(255,255,255,0.03)" }}
                      className={`px-5 py-4 border-b border-glass-border flex items-center justify-between transition-all duration-300 rounded-lg ${selectedCrewName === c.name ? "bg-brand-primary/10 border-l-4 border-l-brand-primary" : ""}`}
                    >
                      {/* ... crew content */}
                      <motion.button
                        whileHover={{ scale: 1.1, boxShadow: "0 0 10px rgba(0, 102, 255, 0.3)" }}
                        className="px-3 h-9 rounded-md bg-brand-primary text-white text-[11px] font-semibold uppercase tracking-widest transition-all disabled:opacity-40"
                      >
                        Assign
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action bar */}
              <div className="grid grid-cols-3 gap-3">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0, 102, 255, 0.4)" }}
                  className="h-12 rounded-md bg-brand-primary text-white text-[12px] font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                >
                  Dispatch Crew <ArrowUpRight className="h-4 w-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, borderColor: "var(--brand-primary)" }}
                  className="h-12 rounded-md border border-glass-border text-white text-[12px] font-medium uppercase tracking-widest transition-all disabled:opacity-40"
                >
                  False Positive / Resolve
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "var(--status-critical)", color: "white" }}
                  className="h-12 rounded-md border border-status-critical text-status-critical text-[12px] font-medium uppercase tracking-widest transition-all disabled:opacity-40"
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

// Redesigned StatTile and StatusPill components
function StatTile({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ translateY: -4, boxShadow: "0 0 20px rgba(0, 102, 255, 0.3)" }}
      className="glass-card rounded-xl p-6 flex items-center justify-between transition-all duration-300"
    >
      <div>
        <div className="text-[10px] mono uppercase tracking-widest text-white/40">{label}</div>
        <div className="mono text-3xl font-semibold mt-2">{value}</div>
      </div>
      <div className="h-10 w-10 grid place-items-center glass-card rounded-md">{icon}</div>
    </motion.div>
  );
}

function StatusPill({ s }: { s: string }) {
  const statusMap: Record<string, { c: string; t: string }> = {
    open: { c: "bg-status-critical text-white", t: "OPEN" },
    assigned: { c: "bg-status-warning text-black", t: "ASSIGNED" },
    in_progress: { c: "bg-brand-primary text-white", t: "IN FIELD" },
    resolved: { c: "bg-status-ok text-black", t: "RESOLVED" },
    escalated: { c: "bg-brand-purple text-white border border-brand-purple/50 shadow-glow-purple", t: "ESCALATED" },
  };
  const { c, t } = statusMap[s] || { c: "bg-gray-700 text-white", t: "UNKNOWN" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] mono uppercase tracking-widest ${c}`}>{t}</span>
  );
}
```

## Deliverables

-   An updated `dispatch.tsx` file with the redesigned components.
-   Any necessary CSS additions to `refined-theme.css` or a new `dispatch.css`.
-   Ensure `StatTile` and `StatusPill` components are updated or new ones created to match the design.

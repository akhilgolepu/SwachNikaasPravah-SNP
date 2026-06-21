# Gemini Model Instructions: KPI Bento Grid Component (DrainageAI v2.0)

## Objective

Generate the React/TypeScript code for the `KPIGrid` component, implementing the hyper-modern design principles for the Key Performance Indicator (KPI) section. This component should be visually engaging, highly animated, and responsive.

## Key Requirements

1.  **Layout**: A responsive grid layout that displays four KPI cards. On desktop, it should be a 4-column grid. For smaller screens, it should adapt gracefully (e.g., 2 columns on tablet, 1 column on mobile).
2.  **Glassmorphic Cards**: Each KPI card must be a distinct `glass-card` with `rounded-xl` or `rounded-2xl` corners. The `glass-card` utility provides `backdrop-blur-2xl`, `bg-white/5`, and `border-white/10`.
3.  **Animated Entry**: Each KPI card should slide up from below with a staggered delay. Use Framer Motion with `initial={{ y: 20, opacity: 0 }}` and `animate={{ y: 0, opacity: 1 }}`. The `delay` should be incremental (e.g., 0.1s, 0.2s, 0.3s, 0.4s for each card).
4.  **Hover Effects**: On hover, each card should:
    *   `transform: translateY(-4px)` for an "uplifting" effect.
    *   Expand its `box-shadow` (e.g., `shadow-glow-primary`).
    *   The internal "aura" (see below) should intensify or subtly animate.
5.  **Internal Aura/Glow**: Each card must feature an internal, blurred circular "aura" element.
    *   Position: Absolutely positioned in the top-right corner of the card.
    *   Size: Approximately 96px x 96px, `rounded-full`.
    *   Effect: `filter: blur(60px)` and `opacity: 0.2`.
    *   Color: The aura color should correspond to the card's accent/status color (e.g., `brand-primary` for monitored drains, `status-critical` for critical alerts).
6.  **Critical Highlighting**: The "Critical Alerts" KPI card should have a more pronounced visual emphasis, such as a `ring-2 ring-status-critical/30` or a similar border highlight.
7.  **Content Structure**: Each card should display:
    *   **Label**: `font-mono uppercase tracking-[0.2em] text-white/40`.
    *   **Value**: Large, bold text (`text-5xl font-bold tracking-tighter`) in the card's accent color.
    *   **Sub-description**: `text-xs text-white/40` with a small colored dot (`w-1.5 h-1.5 rounded-full`) matching the accent color.

## Implementation Details

-   Create a reusable `KPICard` component that accepts `label`, `value`, `sub`, `color`, `delay`, and `isFocus` props.
-   The `KPICard` component should wrap its content in a `motion.div` to handle the entry and hover animations.
-   The `kpi-glow` element can be a `div` inside the `KPICard` with absolute positioning and dynamic background color based on props.
-   Ensure the grid layout is responsive using Tailwind CSS grid classes (`grid-cols-1`, `md:grid-cols-2`, `lg:grid-cols-4`).
-   Integrate the `KPIGrid` component into `src/routes/index.tsx`.

## Example Code Snippets (Conceptual)

```tsx
import { motion } from "framer-motion";

const KPICard = ({ label, value, sub, color, delay, isFocus = false }) => (
  <motion.div 
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay }}
    className={`glass-card p-8 relative overflow-hidden ${isFocus ? 'ring-2 ring-status-critical/30' : ''}`}
  >
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 bg-${color}`} />
    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mb-4">{label}</p>
    <div className="flex items-baseline gap-2">
      <h3 className={`text-5xl font-bold tracking-tighter text-${color}`}>{value}</h3>
      <span className="text-xs font-mono opacity-40">UNIT</span>
    </div>
    <p className="text-xs text-white/40 mt-4 flex items-center gap-2">
      <span className={`w-1.5 h-1.5 rounded-full bg-${color}`} />
      {sub}
    </p>
  </motion.div>
);

export const KPIGrid = () => (
  <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <KPICard label="Monitored Drains" value="12" sub="2 Cities" color="brand-primary" delay={0.1} />
    <KPICard label="Critical Alerts" value="04" sub="Immediate Action" color="status-critical" delay={0.2} isFocus />
    <KPICard label="Warnings" value="04" sub="Monitor Closely" color="status-warning" delay={0.3} />
    <KPICard label="Crews Live" value="08" sub="On Mission" color="brand-cyan" delay={0.4} />
  </section>
);
```

## Deliverables

-   A `KPIGrid.tsx` component file, potentially including a `KPICard` sub-component.
-   Any necessary CSS additions to `refined-theme.css` or a new `kpi-grid.css`.
-   Integration into `src/routes/index.tsx`.

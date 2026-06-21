# Gemini Model Instructions: Alert Feed Component (DrainageAI v2.0)

## Objective

Generate the React/TypeScript code for the `AlertFeed` component, implementing the hyper-modern design principles for the active alert feed section. This component should be visually dynamic, highly interactive, and responsive.

## Key Requirements

1.  **Glassmorphic Container**: The entire alert feed panel must be a `glass-card` (backdrop-blur, semi-transparent background, subtle border).
2.  **Animated Entry**: The `AlertFeed` container should slide in from the left on mount. Use Framer Motion with `initial={{ x: -50, opacity: 0 }}` and `animate={{ x: 0, opacity: 1 }}`.
3.  **Header Section**:
    *   Title: "ACTIVE ALERT FEED" (`font-mono uppercase tracking-widest text-xs text-white/40`).
    *   Sort Button: A circular button (`w-8 h-8 rounded-full bg-white/5`) with a down arrow icon (e.g., from Lucide React) and a subtle hover effect.
4.  **Scrollable Items Area**: The main content area should be scrollable (`overflow-y-auto`) and contain a list of `AlertItem` components.
5.  **Alert Item Design**: Each `AlertItem` must be a distinct, interactive card.
    *   Shape: `rounded-2xl` with `bg-white/5` and `border-white/5`.
    *   Content:
        *   **Status**: Display a status dot and label (`font-mono uppercase opacity-60`).
        *   **Status Dot**: `w-2 h-2 rounded-full`. Critical alerts should have a **pulsing red dot** (`bg-status-critical animate-pulse`). Warning alerts should have a static orange dot (`bg-status-warning`).
        *   **Drain Name**: `text-sm font-semibold`. On hover, the text color should change to `brand-primary`.
        *   **Location**: `text-xs text-white/60`.
        *   **Risk Score**: Right-aligned, `text-lg font-bold font-mono`. Color should match the status (e.g., `text-status-critical`).
6.  **Alert Item Hover Effects**: On hover, each `AlertItem` should:
    *   Exhibit a **fluid slide-right animation** (`transform: translateX(10px)`). Use Framer Motion `whileHover={{ x: 10 }}`.
    *   Background should lighten (`bg-white/10`).
    *   Border should brighten (`border-white/20`).
7.  **Critical Alert Shimmer**: Critical alert items should have a subtle `shimmer` effect to draw immediate attention. This can be achieved with an animated `linear-gradient` background.

## Implementation Details

-   Create a reusable `AlertItem` component that accepts `name`, `risk`, `status`, and `location` props.
-   The `AlertItem` component should wrap its content in a `motion.div` to handle the hover animations.
-   Ensure proper scrollbar styling for the `alert-items` container (refer to `prototype.html` for basic CSS).
-   Integrate the `AlertFeed` component into `src/routes/index.tsx`.

## Example Code Snippets (Conceptual)

```tsx
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react"; // Example icon

const AlertItem = ({ name, risk, status, location }) => (
  <motion.div 
    whileHover={{ x: 10 }}
    className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
  >
    <div className="flex justify-between items-start">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className={`w-2 h-2 rounded-full ${status === 'critical' ? 'bg-status-critical animate-pulse' : 'bg-status-warning'}`} />
          <span className="text-[10px] font-mono uppercase opacity-60">{status}</span>
        </div>
        <h4 className="text-sm font-semibold group-hover:text-brand-primary transition-colors">{name}</h4>
        <p className="text-xs text-white/60">{location}</p>
      </div>
      <div className="text-right">
        <span className={`text-lg font-bold font-mono ${status === 'critical' ? 'text-status-critical' : 'text-status-warning'}`}>{risk}</span>
        <p className="text-[8px] font-mono opacity-40">RISK</p>
      </div>
    </div>
  </motion.div>
);

export const AlertFeed = () => (
  <motion.aside 
    initial={{ x: -50, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ delay: 0.5 }}
    className="col-span-12 lg:col-span-4 glass-card overflow-hidden flex flex-col"
  >
    <div className="p-6 border-b border-white/5 flex justify-between items-center">
      <h2 className="font-bold uppercase tracking-widest text-xs text-white/40">Active Alert Feed</h2>
      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
        <ChevronRight className="w-4 h-4 text-white/60" />
      </div>
    </div>
    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
      <AlertItem name="Worli Sea Face Box" risk={98} status="critical" location="Worli, Mumbai" />
      <AlertItem name="Madhapur Underpass" risk={84} status="critical" location="Madhapur, Hyderabad" />
      <AlertItem name="BKC Connector Drain" risk={72} status="warning" location="Bandra, Mumbai" />
    </div>
  </motion.aside>
);
```

## Deliverables

-   An `AlertFeed.tsx` component file, including the `AlertItem` sub-component.
-   Any necessary CSS additions to `refined-theme.css` or a new `alert-feed.css`.
-   Integration into `src/routes/index.tsx`.
`

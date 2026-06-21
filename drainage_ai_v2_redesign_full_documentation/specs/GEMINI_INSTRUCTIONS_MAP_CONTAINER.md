# Gemini Model Instructions: Map Container Component (DrainageAI v2.0)

## Objective

Generate the React/TypeScript code for the `MapContainer` component, implementing the hyper-modern design principles for the central map workspace. This component should be visually dynamic, interactive, and responsive, serving as the primary visual hub for drain monitoring.

## Key Requirements

1.  **Glassmorphic Panel**: The entire map container must be a large `glass-card` (backdrop-blur, semi-transparent background, subtle border).
2.  **Animated Entry**: The `MapContainer` should scale in from `0.95` to `1` on mount. Use Framer Motion with `initial={{ scale: 0.95, opacity: 0 }}` and `animate={{ scale: 1, opacity: 1 }}`.
3.  **Background**: The map area should feature a subtle, dark grid pattern overlaying the actual map tiles. This can be achieved using CSS `background-image` with `linear-gradient` for the grid pattern.
4.  **Ambient Breathing Glow**: A large, blurred circular glow must be centrally positioned within the map area.
    *   Effect: It should subtly "breathe" (scale and change opacity) over a 6-second cycle.
    *   Implementation: Use a CSS `@keyframes` animation on `transform: scale` and `opacity` for a `div` with `filter: blur(100px)` and low opacity (e.g., `opacity: 0.05`). The color should be `brand-primary`.
5.  **Focused Asset Card**: A `glass-card` should be positioned in the bottom-left corner of the map, displaying details of the currently selected drain.
    *   Content: Label (`Focused Asset`), Drain ID (`MUM-WOR-018`), and a brief description (`Worli, Mumbai · Blockage 84%`).
    *   **Floating Animation**: This card must have a gentle, continuous floating animation (`animate-float`) where it moves vertically from `translateY(0)` to `translateY(-10px)` and back over 6 seconds.
6.  **Drain Markers**: The actual map markers for drains should be visually enhanced.
    *   Representation: **3D-like glowing spheres** that pulse more intensely when critical or selected.
    *   Interaction: When a drain is selected (e.g., from the Alert Feed), the map should smoothly `flyTo()` its location (using Leaflet functionality).
7.  **Interactive Border**: On hover over the entire map container, a **rotating conic gradient border** should appear/intensify. This border should use the `focused-gradient-border` utility class, which animates a `conic-gradient` using `@property --angle`.

## Implementation Details

-   The `MapContainer` component will likely wrap a Leaflet map instance. The visual enhancements (grid, glow, focused card) will be overlaid on top of the map.
-   The `focused-gradient-border` class will need to be applied to the main `motion.main` container for the map.
-   The `animate-float` class will be applied to the `focused-card`.
-   Dynamic map interactions (e.g., `map.flyTo()`) will be triggered by state changes (e.g., `selectedDrainId` from `simStore`).
-   Integrate the `MapContainer` component into `src/routes/index.tsx`.

## Example Code Snippets (Conceptual)

```tsx
import { motion } from "framer-motion";
// import { LeafletMap } from "@/components/LeafletMap"; // Assuming existing Leaflet component

export const MapContainer = () => (
  <motion.main 
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 0.6 }}
    className="col-span-12 lg:col-span-8 glass-card relative overflow-hidden group"
  >
    {/* Background grid - can be a div or applied to main container */}
    <div className="absolute inset-0 bg-[url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="1000" height="1000" fill="rgba(5,5,5,0.5)"/><rect width="1000" height="1000" fill="url(%23grid)" /></svg>\')] opacity-30" />

    {/* Ambient Breathing Glow */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-64 h-64 rounded-full bg-brand-primary/5 blur-[100px] animate-breathe" />
    </div>

    {/* Leaflet Map component would go here */}
    {/* <LeafletMap /> */}

    {/* Focused Asset Card */}
    <div className="relative z-10 p-8 h-full flex flex-col justify-end">
      <div className="glass-card p-6 w-fit animate-float">
        <p className="text-xs font-mono text-brand-cyan mb-2">FOCUSED ASSET</p>
        <h3 className="text-xl font-bold mb-1">MUM-WOR-018</h3>
        <p className="text-sm text-white/60">Worli, Mumbai · Blockage 84%</p>
      </div>
    </div>
    
    {/* Gradient Border Animation on hover */}
    <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:focused-gradient-border pointer-events-none transition-all duration-700" />
  </motion.main>
);
```

## Deliverables

-   A `MapContainer.tsx` component file.
-   Any necessary CSS additions to `refined-theme.css` or a new `map-container.css`.
-   Integration into `src/routes/index.tsx`.

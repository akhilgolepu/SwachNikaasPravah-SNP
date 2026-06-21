# Gemini Model Instructions: Inventory Page (DrainageAI v2.0)

## Objective

Generate the React/TypeScript code for the `InventoryPage` component, implementing the hyper-modern design principles for the asset management interface. The page must be visually engaging, highly interactive, and responsive, aligning with the overall DrainageAI v2.0 aesthetic.

## Key Requirements

1.  **Overall Page Structure**:
    *   The main content area (`<main>`) should adopt the `glass-card` aesthetic, providing a subtle backdrop blur and a clean, layered appearance. Maintain `max-w-[1400px] px-4 sm:px-6 py-6` for consistent layout.
    *   The page header (`<header>`) should use `Inter Tight` for titles and `JetBrains Mono` for labels. Apply a subtle `glow-text` effect to the main title (`Drain Inventory & Stream Matrix`).

2.  **Filter Matrix Section**:
    *   **Container**: The filter matrix `section` will be a `glass-card` with `rounded-xl` corners. It should maintain the `grid grid-cols-2 md:grid-cols-4 gap-4` layout.
    *   **Select Components**: Redesign the `Select` components (`Ward`, `Risk Class`, `Typology`):
        *   **Appearance**: `rounded-md` borders, `bg-glass` background, and a subtle `border-glass-border`.
        *   **Focus State**: On focus, the select box border should animate with a `focused-gradient-border` effect. The dropdown arrow (if implemented) should subtly rotate.
        *   **Typography**: Labels will use `font-mono uppercase tracking-widest text-white/40`.
    *   **Force RTSP Recalibrate Button**: Transform this button into a prominent, interactive element:
        *   **Appearance**: `rounded-md`, `bg-brand-primary` with `glow-text` for the label.
        *   **Hover Effect**: On hover, the button should slightly scale up (`scale-105`), and a subtle `shimmer` animation should pass across its surface.
        *   **Icon**: The `RefreshCw` icon should be larger and potentially have a subtle rotation animation on hover.

3.  **Inventory Table**:
    *   **Container**: The table wrapper `div` will be a `glass-card` with `rounded-xl` corners.
    *   **Table Header (`<thead>`)**:
        *   **Appearance**: `rounded-t-xl` for the header row, with `bg-glass` background.
        *   **Typography**: `text-[10px] mono uppercase tracking-widest text-white/40` for column headers.
    *   **Table Rows (`<tr>`)**:
        *   **Hover Effect**: On hover, the entire row should subtly `translateY(-2px)` and gain a light `box-shadow` (`shadow-glow-primary`). The background should lighten (`bg-white/5`).
        *   **Status Highlighting**: The `RI` column (`risk_index`) will use dynamic text colors based on `d.status` (`text-status-critical`, `text-status-warning`, `text-status-ok`).
        *   **BlockBar Component**: Update the `BlockBar` with `rounded-full` progress bars and a smooth `transition-width` for percentage changes.
        *   **Inspect Button**: Redesign the `Inspect` button with `rounded-md` corners, `bg-brand-primary` on hover, and a subtle `ArrowUpRight` icon animation.

## Implementation Details

-   Utilize `motion.div` for the main page sections and individual table rows to implement entry and hover animations.
-   Ensure the `Select` components are wrapped in `motion.div` to handle focus-based gradient animations for their borders.
-   The `BlockBar` component should be updated to use the new rounded aesthetic and smooth transitions.
-   Integrate the redesigned `InventoryPage` into `src/routes/inventory.tsx`.
-   Ensure responsiveness for the filter controls and table on various screen sizes.

## Example Code Snippets (Conceptual)

```tsx
import { motion } from "framer-motion";
import { RefreshCw, Wrench } from "lucide-react";
// ... other imports and existing logic

function InventoryPage() {
  // ... existing state and memoized filters

  return (
    <main className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 glass-card">
      <header className="mb-6">
        <p className="text-[10px] mono uppercase tracking-widest text-white/40">Operations / Inventory</p>
        <h1 className="text-2xl font-semibold mt-2 glow-text">Drain Inventory & Stream Matrix</h1>
        {/* ... other header content */}
      </header>

      {/* Filter matrix */}
      <motion.section 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ delay: 0.1 }} 
        className="glass-card rounded-xl p-5 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {/* Redesigned Select components */}
        <Select label="Ward" value={ward} onChange={setWard} options={wards} />
        {/* ... other Selects */}
        <div className="flex items-end">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0, 102, 255, 0.4)" }}
            className="w-full h-10 rounded-md bg-brand-primary text-white text-[11px] mono uppercase tracking-widest flex items-center justify-center gap-2 relative overflow-hidden"
          >
            <RefreshCw className="h-3 w-3" /> Force RTSP Recalibrate
            {/* Add shimmer effect here */}
          </motion.button>
        </div>
      </motion.section>

      {/* Table */}
      <div className="glass-card rounded-xl p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="rounded-t-xl bg-glass">
              <tr className="border-b border-glass-border text-[10px] mono uppercase tracking-widest text-white/40">
                {/* ... table headers */}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <motion.tr 
                  key={d.id} 
                  whileHover={{ translateY: -2, boxShadow: "0 0 15px rgba(0, 102, 255, 0.2)", backgroundColor: "rgba(255,255,255,0.05)" }}
                  className="border-b border-glass-border transition-all duration-300"
                >
                  {/* ... table data */}
                  <td className="px-4 py-3 text-right">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => { simStore.selectDrain(d.id); navigate({ to: "/" }); }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-brand-primary text-white text-[10px] mono uppercase tracking-widest transition-all"
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

// Redesigned Select and BlockBar components
function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <div className="text-[10px] mono uppercase tracking-widest text-white/40 mb-1.5">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-md bg-glass border border-glass-border text-sm focus:outline-none focus:focused-gradient-border transition-all"
      >
        {/* ... options */}
      </select>
    </label>
  );
}

function BlockBar({ pct }: { pct: number }) {
  const color = pct >= 70 ? "bg-status-critical" : pct >= 45 ? "bg-status-warning" : "bg-status-ok";
  return (
    <div className="flex items-center gap-2 justify-end">
      <div className="w-20 h-2 rounded-full bg-glass-border overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full ${color}`}
        />
      </div>
      <span className="mono text-[12px] w-10 text-right">{pct}%</span>
    </div>
  );
}
```

## Deliverables

-   An updated `inventory.tsx` file with the redesigned components.
-   Any necessary CSS additions to `refined-theme.css` or a new `inventory.css`.
-   Ensure `Select` and `BlockBar` components are updated or new ones created to match the design.

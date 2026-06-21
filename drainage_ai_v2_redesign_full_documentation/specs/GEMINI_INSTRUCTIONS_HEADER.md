# Gemini Model Instructions: Header Component (DrainageAI v2.0)

## Objective

Generate the React/TypeScript code for the `RefinedHeader` component, implementing the hyper-modern design principles outlined in the `CORE_DESIGN_ARCHITECTURE.md` and `COMPONENT_EVOLUTION.md` documents. The component must be visually stunning, highly animated, and responsive.

## Key Requirements

1.  **Glassmorphism**: The header container must utilize the `glass-card` utility class, providing a `backdrop-blur-2xl`, `bg-white/5`, and `border-white/10` effect.
2.  **Animated Entry**: The entire header should slide down from the top on mount. Use Framer Motion with `initial={{ y: -100, opacity: 0 }}` and `animate={{ y: 0, opacity: 1 }}`.
3.  **Logo Design**:
    *   A 48px x 48px square, `rounded-2xl`, with a solid background of `brand-primary` (`#0066FF`).
    *   Contains a bold white 
letter "D" (font-size: 24px, font-weight: bold).
    *   Apply a `box-shadow: 0 0 20px rgba(0, 102, 255, 0.4)` for a subtle glow.
4.  **Title**: "DrainageAI v2.0"
    *   Use the `Inter Tight` font.
    *   The "v2.0" part should be highlighted in `brand-primary` (`#0066FF`).
    *   Apply the `glow-text` utility class for a subtle text glow.
5.  **Navigation**: Four navigation buttons (`Dashboard`, `Map View`, `Inventory`, `Dispatch`).
    *   Default text color: `text-white/60`.
    *   On hover: `text-white`.
    *   **Animated Underline**: Each button must have an underline that expands from left to right on hover. Implement this using a CSS pseudo-element (`::after`) with `width: 0` initially and `width: 100%` on hover, transitioning with `0.3s`.
6.  **Status Badge**: A pill-shaped badge for "Live System".
    *   Shape: `rounded-full`.
    *   Background: `bg-status-ok/10`.
    *   Border: `border-status-ok/20`.
    *   Content: A pulsing green dot (`w-2 h-2 rounded-full bg-status-ok animate-pulse`) and the text "Live System" (`text-xs font-mono uppercase text-status-ok`).

## Implementation Details

-   Use `motion.header` for the main container.
-   Ensure responsive behavior: navigation should collapse or adapt for smaller screens (e.g., using a hamburger menu or hiding some links).
-   The `RefinedDashboard.tsx` skeleton provides a basic structure; expand upon it to meet these specifications.
-   Utilize the `refined-theme.css` for color variables and utility classes.

## Example Code Snippets (Conceptual)

```tsx
import { motion } from "framer-motion";

// ... (logo, title, nav items, status badge structure)

<motion.header
  initial={{ y: -100, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  className="glass-card p-6 flex justify-between items-center"
>
  {/* Logo and Title */}
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
      <span className="text-2xl font-bold">D</span>
    </div>
    <h1 className="text-2xl font-bold tracking-tight glow-text">DrainageAI <span className="text-brand-primary">v2.0</span></h1>
  </div>

  {/* Navigation */}
  <nav className="hidden md:flex gap-8 text-sm font-medium text-white/60">
    {/* Each button with animated underline */}
  </nav>

  {/* Status Badge */}
  <div className="flex items-center gap-4">
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-status-ok/10 border border-status-ok/20">
      <div className="w-2 h-2 rounded-full bg-status-ok animate-pulse" />
      <span className="text-xs font-mono text-status-ok uppercase">Live System</span>
    </div>
  </div>
</motion.header>
```

```css
/* For animated underline */
nav button::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--brand-primary);
  transition: width 0.3s ease-out;
}

nav button:hover::after {
  width: 100%;
}
```

## Deliverables

-   A `RefinedHeader.tsx` component file.
-   Any necessary CSS additions to `refined-theme.css` or a new `header.css` if component-specific styles are extensive.
-   Integration into `src/routes/index.tsx`.

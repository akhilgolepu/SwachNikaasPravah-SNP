# DrainageAI v2.0: Dispatch Page Redesign

This document outlines the redesign specifications for the `Dispatch` page, ensuring it aligns with the hyper-modern, animated, and gradient-focused aesthetic established for the main dashboard. The goal is to transform the ticket management and crew assignment interface into a dynamic, intuitive, and visually engaging control center.

## 1. Overall Page Structure and Aesthetic

-   **Main Container**: The entire `main` content area will adopt the `glass-card` aesthetic, providing a subtle backdrop blur and a clean, layered appearance. The `max-w-[1400px]` and `px-4 sm:px-6 py-6` will be maintained for consistent layout.
-   **Header**: The page header (`Operations / Dispatch`, `Dispatch & Ticket Control Center`) will use the new typography (`Inter Tight` for titles, `JetBrains Mono` for labels) and a subtle `glow-text` effect for the main title.

## 2. Top KPI Section (Stat Tiles)

### Pre-existing Skeleton
-   **Structure**: A `section` with `grid grid-cols-3 gap-px bg-border border border-border` containing `StatTile` components.
-   **Styling**: Basic rectangular tiles with `bg-card` and `border-border`.

### v2.0 Improvements
-   **Container**: The KPI section will be a `glass-card` with `rounded-xl` corners, maintaining the grid layout. The `gap-px bg-border border border-border` will be replaced with internal `glass-card` styling for each tile.
-   **Stat Tiles**: Each `StatTile` will be redesigned to be a distinct, interactive `glass-card` with `rounded-xl` corners.
    *   **Appearance**: `bg-glass` background, `border-glass-border`. The icon container (`h-10 w-10 grid place-items-center border border-border`) will also be `glass-card` styled with `rounded-md`.
    *   **Hover Effect**: On hover, the tile should subtly `translateY(-4px)` and gain a light `box-shadow` (`shadow-glow-primary`).
    *   **Icon**: The icons (`AlertTriangle`, `Users`, `CheckCircle2`) will retain their color but will be rendered within a `glass-card` styled container, potentially with a subtle animation on update.
    *   **Typography**: `label` will use `font-mono uppercase tracking-widest text-white/40`, and `value` will be `mono text-3xl font-semibold`.

## 3. Tickets List (Left Panel)

### Pre-existing Skeleton
-   **Structure**: A `div` (`col-span-12 lg:col-span-5`) containing a `bento` styled list of tickets.
-   **Styling**: Basic list items with `border-b border-border` and `hover:bg-surface-2`.

### v2.0 Improvements
-   **Container**: The entire tickets list panel will be a `glass-card` with `rounded-xl` corners.
-   **Header**: The header (`Active Tickets`) will use `font-mono uppercase tracking-wider text-white/40`.
-   **Ticket Items**: Each ticket item will be a distinct, interactive `glass-card` styled element.
    *   **Appearance**: `rounded-lg` or `rounded-xl`, `bg-white/5` and `border-white/5`.
    *   **Hover Effect**: On hover, the item should subtly `translateY(-2px)` and gain a light `box-shadow` (`shadow-glow-primary`). The background should lighten (`bg-white/10`).
    *   **Selected State**: The selected ticket will have a prominent `border-l-4 border-l-brand-primary` and a slightly more intense background (`bg-brand-primary/10`).
    *   **Escalated State**: Escalated tickets will have a distinct purple theme (`bg-purple-950/40`, `border-l-purple-500`) and a subtle `pulse` animation on the border or background to indicate urgency.
    *   **Status Pill**: The `StatusPill` component will be redesigned with `rounded-full` shapes and vibrant colors, potentially with a subtle animation for status changes.
    *   **Typography**: `drain_name` will be `text-sm font-medium`, `id` will be `mono text-xs font-medium`, and `risk_index` will be `mono text-xl font-semibold` with dynamic color based on risk.

## 4. Detail Pane (Right Panel)

### Pre-existing Skeleton
-   **Structure**: A `div` (`col-span-12 lg:col-span-7`) containing diagnostic info, visual evidence, crew assignment, and action buttons.
-   **Styling**: Basic `bento` styled sections.

### v2.0 Improvements
-   **Container**: Each sub-section within the detail pane (Diagnostic Info, Visual Evidence, Crew Assignment) will be a `glass-card` with `rounded-xl` corners.
-   **Diagnostic Info Banner**: This banner will be a `glass-card` with `rounded-md` corners. The `animate-pulse` will be retained, but the overall aesthetic will be more refined with a subtle purple glow.
-   **Visual Evidence Vault**: 
    *   **Container**: `glass-card` with `rounded-xl` corners.
    *   **Image Frame**: The image frame will have `rounded-md` corners. The fallback gradient will be updated to align with the new color palette and gradient style.
    *   **Overlay Elements**: The `REC` and timestamp overlays will be `glass-card` styled with `rounded-sm` corners.
-   **Crew Assignment**: 
    *   **Container**: `glass-card` with `rounded-xl` corners.
    *   **Crew Items**: Each crew item will be a distinct, interactive `glass-card` styled element with `rounded-lg` corners.
        *   **Hover Effect**: Similar to ticket items, a subtle `translateY(-2px)` and `box-shadow` on hover.
        *   **Selected Crew**: Highlighted with a `border-l-4 border-l-brand-primary`.
        *   **Assign Button**: Redesigned with `rounded-md` corners, `bg-brand-primary` on hover, and a subtle `shimmer` effect.
-   **Action Bar**: The action buttons (`Dispatch Crew`, `False Positive / Resolve`, `Escalate`) will be redesigned.
    *   **Appearance**: `rounded-md` corners, `h-12` height.
    *   **Dispatch Crew**: `bg-brand-primary` with `glow-text` on label. On hover, `scale-105` and a subtle `shimmer`.
    *   **Resolve**: `glass-card` styled button with `border-glass-border` and `hover:border-brand-primary`.
    *   **Escalate**: `glass-card` styled button with `border-status-critical` and `text-status-critical`. On hover, `bg-status-critical` and `text-white`.

## 5. Responsive Design

-   The two main columns (Tickets List and Detail Pane) should stack vertically on smaller screens.
-   Button groups and crew assignment lists should adapt to single-column layouts on mobile.

## References

-   [1] CORE_DESIGN_ARCHITECTURE.md
-   [2] COMPONENT_EVOLUTION.md
-   [3] ANIMATION_AND_GRADIENT_LOGIC.md

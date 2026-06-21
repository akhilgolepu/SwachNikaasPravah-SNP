"""# DrainageAI v2.0: Inventory Page Redesign

This document outlines the redesign specifications for the `Inventory` page, ensuring it aligns with the hyper-modern, animated, and gradient-focused aesthetic established for the main dashboard. The goal is to transform the functional data grid into an engaging and intuitive asset management interface.

## 1. Overall Page Structure and Aesthetic

-   **Main Container**: The entire `main` content area will adopt the `glass-card` aesthetic, providing a subtle backdrop blur and a clean, layered appearance. The `max-w-[1400px]` and `px-4 sm:px-6 py-6` will be maintained for consistent layout.
-   **Header**: The page header (`Operations / Inventory`, `Drain Inventory & Stream Matrix`) will use the new typography (`Inter Tight` for titles, `JetBrains Mono` for labels) and a subtle `glow-text` effect for the main title.

## 2. Filter Matrix Section

### Pre-existing Skeleton
-   **Structure**: A `section` with `bento` styling, containing `Select` components and a `RefreshCw` button.
-   **Styling**: Basic rectangular select boxes and a standard button.

### v2.0 Improvements
-   **Container**: The filter matrix `section` will be a `glass-card` with `rounded-xl` corners, maintaining the `grid grid-cols-2 md:grid-cols-4 gap-4` layout.
-   **Select Components**: The `Select` components will be redesigned to be more visually appealing and interactive:
    *   **Appearance**: `rounded-md` borders, `bg-glass` background, and a subtle `border-glass-border`.
    *   **Focus State**: On focus, the select box border should animate with a `focused-gradient-border` effect, and the dropdown arrow (if applicable) should subtly rotate.
    *   **Typography**: Labels (`Ward`, `Risk Class`, `Typology`) will use `font-mono uppercase tracking-widest text-white/40`.
-   **Force RTSP Recalibrate Button**: This button will be transformed into a prominent, interactive element:
    *   **Appearance**: `rounded-md`, `bg-brand-primary` with a `glow-text` effect for the label.
    *   **Hover Effect**: On hover, the button should slightly scale up (`scale-105`), and a subtle `shimmer` animation should pass across its surface.
    *   **Icon**: The `RefreshCw` icon will be larger and potentially have a subtle rotation animation on hover.

## 3. Inventory Table

### Pre-existing Skeleton
-   **Structure**: A `div` with `bento` styling containing an `overflow-x-auto` wrapper for a standard HTML `table`.
-   **Styling**: Basic table with `border-b border-border` for rows and `hover:bg-surface-2`.

### v2.0 Improvements
-   **Container**: The table container will be a `glass-card` with `rounded-xl` corners, ensuring the entire table is visually integrated into the new aesthetic.
-   **Table Header**: 
    *   **Appearance**: `rounded-t-xl` for the header row, with `bg-glass` background.
    *   **Typography**: `text-[10px] mono uppercase tracking-widest text-white/40` for column headers.
-   **Table Rows**: Each `tr` element will be significantly enhanced:
    *   **Hover Effect**: On hover, the entire row should subtly `translateY(-2px)` and gain a light `box-shadow` (`shadow-glow-primary`). The background should lighten (`bg-white/5`).
    *   **Status Highlighting**: The `RI` column will use dynamic text colors based on `d.status` (`text-status-critical`, `text-status-warning`, `text-status-ok`).
    *   **BlockBar**: The `BlockBar` component will be updated with `rounded-full` progress bars and potentially a subtle animation on value change.
    *   **Inspect Button**: The `Inspect` button will adopt the new button styling, featuring `rounded-md` corners, `bg-brand-primary` on hover, and a subtle `ArrowUpRight` icon animation.

### Implementation Guidance
-   Apply `motion.div` to the table rows (`tr`) for hover animations.
-   Ensure the `Select` components are wrapped in `motion.div` to handle focus-based gradient animations.
-   The `BlockBar` component should use `rounded-full` for the bar and a smooth `transition-width` for percentage changes.
-   The `Inspect` button should use the new button styling guidelines from the `CORE_DESIGN_ARCHITECTURE.md`.

## 4. Responsive Design

-   The table should remain horizontally scrollable on smaller screens (`overflow-x-auto`).
-   Filter controls should stack vertically or adapt to a more compact layout on mobile.

## References

-   [1] CORE_DESIGN_ARCHITECTURE.md
-   [2] COMPONENT_EVOLUTION.md
-   [3] ANIMATION_AND_GRADIENT_LOGIC.md
"""

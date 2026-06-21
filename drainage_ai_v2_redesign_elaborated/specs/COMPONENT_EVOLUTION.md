# DrainageAI v2.0: Component Evolution and Improvement

This document details the transformation of key UI components from the original DrainageAI skeleton to the hyper-modern v2.0 design. Each section outlines the pre-existing structure, the envisioned improvements, and specific implementation guidance.

## 1. Header Component

### Pre-existing Skeleton
-   **Structure**: Simple `header` with a logo, navigation links, and a status indicator.
-   **Styling**: Minimalist, dark theme, sharp edges, basic text.
-   **Interactivity**: Standard hover states for navigation.

### v2.0 Improvements
-   **Aesthetic**: Transformed into a prominent **glassmorphic bar** that appears to float at the top of the screen. It will feature a subtle background blur and a delicate border.
-   **Logo**: The `DrainageAI` logo will be redesigned as a vibrant, rounded square (`rounded-2xl`) with a strong brand primary color (`#0066FF`) and a subtle glow (`box-shadow: 0 0 20px rgba(0, 102, 255, 0.4)`). The text `DrainageAI v2.0` will use the `Inter Tight` font, with `v2.0` highlighted in the brand primary color and a `glow-text` effect.
-   **Navigation**: Navigation links will be `text-white/60` by default, transitioning to `text-white` on hover. Each link will feature an **animated underline** that expands from left to right on hover, using the brand primary color.
-   **Status Indicator**: The `Live System` status will be a pill-shaped badge (`rounded-full`) with a pulsing green dot (`bg-status-ok animate-pulse`) and `text-status-ok`. The badge itself will have a `bg-status-ok/10` background and `border-status-ok/20`.

### Implementation Guidance
-   Use `motion.header` from Framer Motion for an initial `y: -100` to `y: 0` animation on mount, giving a smooth slide-down effect.
-   Apply the `glass-card` utility class for the header background and border.
-   Implement the animated underline using CSS pseudo-elements (`::after`) and `transition: width` on hover.

## 2. KPI Bento Grid

### Pre-existing Skeleton
-   **Structure**: A `section` containing four `div` elements, each representing a KPI.
-   **Styling**: Basic rectangular cards with `bg-card` and `border-border`, displaying `label`, `value`, and `sub` text.
-   **Interactivity**: No specific animations or enhanced hover states.

### v2.0 Improvements
-   **Aesthetic**: Each KPI card will be a distinct **rounded glassmorphic container** (`rounded-xl` or `rounded-2xl`), giving the appearance of a "bento box" layout. The layout will be responsive, adapting from 4 columns on desktop to fewer on smaller screens.
-   **Visual Emphasis**: Each card will feature an **internal, blurred "aura"** (`kpi-glow` utility) in the top-right corner, matching the card's accent color (e.g., `#0066FF` for primary, `#FF3B3B` for critical). This aura will subtly animate.
-   **Critical Highlighting**: Critical KPI cards will have a more pronounced `ring-2 ring-status-critical/30` and a slightly more intense glow effect.
-   **Typography**: KPI values will be large (`text-5xl`), bold, and use their respective accent colors. Labels will be `font-mono uppercase`.

### Implementation Guidance
-   Utilize `motion.div` for each `KPICard` component, applying `initial={{ y: 20, opacity: 0 }}` and `animate={{ y: 0, opacity: 1 }}` with a staggered `transition.delay`.
-   The `kpi-glow` effect can be achieved with a pseudo-element or an absolutely positioned `div` with `filter: blur()`.
-   On hover, cards should `translateY(-4px)` and expand their `box-shadow` for an "uplifting" effect.

## 3. Alert Feed (Left Panel)

### Pre-existing Skeleton
-   **Structure**: A `div` containing a header and a scrollable list of alert items.
-   **Styling**: Rectangular items with `border-b border-border`, basic text, and small status dots.
-   **Interactivity**: Simple `hover:bg-surface-2` for items.

### v2.0 Improvements
-   **Aesthetic**: The entire alert feed panel will be a **glassmorphic container** (`glass-card`). The items within will form a "card stack" appearance, each with `rounded-2xl` corners.
-   **Alert Items**: Each alert item will be a distinct, interactive card. On hover, it will exhibit a **fluid slide-right animation** (`transform: translateX(10px)`) and a subtle background and border highlight.
-   **Critical Alerts**: Critical alerts will have a **pulsing red dot** (`bg-status-critical animate-pulse`) and a subtle `shimmer` effect to draw immediate attention.
-   **Typography**: High-contrast typography will be used for drain names (`font-semibold group-hover:text-brand-primary`), and `font-mono uppercase` for status labels.

### Implementation Guidance
-   The `AlertFeed` container should slide in from the left on mount using `motion.aside`.
-   Each `AlertItem` should use `motion.div` with `whileHover={{ x: 10 }}` for the slide effect.
-   The `shimmer` effect can be implemented using a CSS `linear-gradient` background that animates its `background-position`.

## 4. Map Container (Main Workspace)

### Pre-existing Skeleton
-   **Structure**: A `div` containing a Leaflet map.
-   **Styling**: Standard dark-themed map tiles.
-   **Interactivity**: Basic map pan and zoom.

### v2.0 Improvements
-   **Aesthetic**: The map container will be a large, **glassmorphic panel** that serves as the central interactive hub. The background will feature a subtle, dark grid pattern (`grid-bg` utility) overlaying a custom-styled map (e.g., Mapbox/Vector tiles).
-   **Ambient Glow**: A large, blurred circular glow (`map-glow` utility) will be centrally positioned over the map, subtly **"breathing"** (scaling and changing opacity) to create a dynamic background effect.
-   **Focused Asset Card**: A `glass-card` will appear in the bottom-left of the map, displaying details of the currently selected drain. This card will have a **gentle floating animation** (`animate-float`).
-   **Drain Markers**: Drain markers will be represented by **3D-like glowing spheres** that pulse more intensely when critical or selected.

### Implementation Guidance
-   The `MapWorkspace` container should scale in from `0.95` to `1` on mount using `motion.main`.
-   The breathing glow can be implemented with a CSS `@keyframes` animation on `transform: scale` and `opacity`.
-   Map interactions (zooming to selected drain) should use Leaflet's `map.flyTo()` method for smooth transitions.
-   The focused card's floating animation can be a simple `translateY` keyframe animation.

## 5. Storm Mode Overlay

### Pre-existing Skeleton
-   **Functionality**: A `SIMULATE STORM` button that toggles a `stormMode` state.
-   **Visuals**: Minimal visual feedback, likely just a state change.

### v2.0 Improvements
-   **Dramatic Transition**: Activating Storm Mode will trigger a full-screen **"glitch" effect** across the entire UI for a brief moment (`0.2s`).
-   **Thematic Shift**: The entire dashboard will transition to a deeper, more ominous dark theme. Animated **rain-streak overlays** will appear, simulating a downpour.
-   **Visual Alerts**: Intermittent **thunderous flash animations** (quick, full-screen white flashes) will occur, synchronized with a potential audio cue (if implemented).
-   **System Alert**: A prominent system alert (`FLASH FLOOD WARNING`) will appear at the top of the screen.

### Implementation Guidance
-   Use a global state variable for `stormMode`.
-   The glitch effect can be a CSS `@keyframes` animation applying `transform: skewX()` and rapid `opacity` changes to a full-screen overlay.
-   Rain streaks can be achieved with animated CSS `background-image` or SVG overlays.
-   Thunder flashes can be triggered by adding/removing a full-screen `div` with `opacity: 1` and a quick `transition`.

## References

-   [1] Framer Motion Documentation: [https://www.framer.com/motion/](https://www.framer.com/motion/)
-   [2] Tailwind CSS Documentation: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
-   [3] Glassmorphism UI Design: [https://uxdesign.cc/glassmorphism-in-user-interfaces-1f39bb13084c](https://uxdesign.cc/glassmorphism-in-user-interfaces-1f39bb13084c)

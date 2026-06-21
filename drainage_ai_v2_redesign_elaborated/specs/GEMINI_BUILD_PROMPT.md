# DrainageAI v2.0 — Full Build Specification for Gemini Model

## Executive Summary

You are tasked with building a **hyper-modern, visually stunning frontend redesign** of the DrainageAI ICCC drainage monitoring dashboard. The design emphasizes **glassmorphism, hyper-focused gradients, extreme rounding, and "crazy" fluid animations**. This is a React 19 + Tailwind CSS 4 + Framer Motion project.

## 1. Design Philosophy: "Hyper-Focused Gradient & Uplift"

### Visual Identity
- **Color Palette**: Electric Blue (`#0066FF`), Neon Cyan (`#00F2FF`), Deep Purple (`#7000FF`), Critical Red (`#FF3B3B`), Warning Orange (`#F5A524`), Success Green (`#17C964`).
- **Shapes**: All components use **extreme rounding** (e.g., `rounded-3xl`, `rounded-[2rem]`, or `rounded-full` for pills). Transition from sharp edges to organic, flowing shapes.
- **Glass Effect**: Use `backdrop-blur-2xl`, `bg-white/5`, and `border-white/10` for a premium glassmorphism aesthetic.
- **Gradients**: Implement **mesh gradients** using radial and conic gradients that animate on focus. Elements should have "auras" that glow when focused or critical.

### Animation Principles
- **Spring Physics**: Use Framer Motion's spring animations with high stiffness (260) and low damping (20) for a "liquid" feel.
- **Stagger Effects**: All list items and cards should stagger in with a 0.1s delay between each.
- **Micro-interactions**: Hover states should trigger scale, glow, and shadow transformations.
- **Breathing Effect**: The entire dashboard should have a subtle "breathing" animation in the background gradients.
- **Storm Mode**: When activated, the UI should "glitch" briefly and transition to a deep dark theme with rain-streak overlays.

## 2. Component Specifications

### A. Header Component
**File**: `Header.tsx`

- **Logo**: A 48px × 48px square with `rounded-2xl`, filled with `#0066FF`, containing a "D" icon. Add a `box-shadow: 0 0 20px rgba(0, 102, 255, 0.4)`.
- **Title**: "DrainageAI v2.0" with the "v2.0" part highlighted in the brand primary color.
- **Navigation**: Four buttons (Dashboard, Map View, Inventory, Dispatch) with animated underlines that expand on hover.
- **Status Badge**: A pill-shaped badge with a pulsing green dot, text "LIVE SYSTEM", and a subtle green glow.

**Animations**:
- Header slides down from top with `y: -100` → `y: 0` on mount.
- Nav buttons have an underline that expands from left on hover.

### B. KPI Bento Grid
**File**: `KPIGrid.tsx`

- **Layout**: 4 columns on desktop, responsive on mobile.
- **Each Card**: 
  - Background: glassmorphic with `bg-white/5` and `backdrop-blur-2xl`.
  - Border: `border-white/10` with a subtle glow on hover.
  - Content: Label (mono, uppercase, small), large value (font-size: 48px), and a sub-description.
  - Glow Element: A 96px × 96px blurred circle positioned absolutely in the top-right, with opacity 0.2, using the card's accent color.
  - Critical cards should have a `border-2 border-red-500/30`.

**Animations**:
- Each card slides up from below with a stagger delay (0.1s, 0.2s, 0.3s, 0.4s).
- On hover: `transform: translateY(-4px)`, shadow expands, glow intensifies.

### C. Alert Feed (Left Panel)
**File**: `AlertFeed.tsx`

- **Container**: Flex column, glassmorphic, with a header and scrollable items area.
- **Header**: 
  - Title: "ACTIVE ALERT FEED" (mono, uppercase, small).
  - Sort Button: A circular button with a down arrow.
- **Alert Items**:
  - Each item is a `rounded-2xl` card with `bg-white/5` and `border-white/5`.
  - Content: Status badge (dot + label), drain name, location, and risk score (right-aligned).
  - Critical items have a pulsing red dot.
  - On hover: `transform: translateX(10px)`, background lightens, border brightens.

**Animations**:
- Alert feed slides in from the left on mount.
- Items have a staggered entrance animation.
- Hover state triggers a smooth slide-right with a 0.3s transition.

### D. Map Container (Main Workspace)
**File**: `MapWorkspace.tsx`

- **Background**: A dark grid pattern (using CSS `background-image` with linear gradients).
- **Glow Overlay**: A large blurred circle in the center that "breathes" (scales from 1 to 1.2 over 6 seconds).
- **Focused Card**: A glassmorphic card in the bottom-left corner that displays the currently selected drain's details (e.g., "MUM-WOR-018", blockage %, etc.).
- **Floating Animation**: The focused card should have a subtle floating animation (translateY from 0 to -10px and back).

**Animations**:
- Map container scales in from 0.95 to 1 on mount.
- The breathing glow cycles through opacity and scale.
- The focused card floats up and down continuously.

## 3. Advanced Animation Specifications

### A. Gradient Rotation (Conic Gradient Border)
Implement a rotating conic gradient border for focused elements:
```css
@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@keyframes rotate-gradient {
  to { --angle: 360deg; }
}

.focused-gradient-border {
  border: 1px solid transparent;
  background: linear-gradient(...) padding-box,
              conic-gradient(from var(--angle), ...) border-box;
  animation: rotate-gradient 4s linear infinite;
}
```

### B. Glitch Effect (Storm Mode)
When "Storm Mode" is activated:
1. The entire dashboard should briefly glitch (use `transform: skewX()` and rapid opacity changes).
2. Transition to a darker theme with rain-streak overlays.
3. Add thunderous flash animations (full-screen white flash at random intervals).

### C. Liquid Wave Effect (KPI Hover)
On KPI card hover, the background gradient should "wave":
```javascript
const waveVariants = {
  animate: {
    backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
    transition: { duration: 3, repeat: Infinity }
  }
};
```

## 4. Technical Stack & Dependencies

- **React**: 19.2.0
- **Tailwind CSS**: 4.2.1
- **Framer Motion**: ^10.0.0 (for animations)
- **Lucide React**: ^0.575.0 (for icons)
- **React Router**: TanStack Router (existing)
- **State Management**: Zustand or React Context (existing simStore)

## 5. File Structure (Expected Output)

```
src/
├── components/
│   ├── RefinedHeader.tsx
│   ├── KPIGrid.tsx
│   ├── AlertFeed.tsx
│   ├── MapWorkspace.tsx
│   ├── FocusedCard.tsx
│   └── StormModeOverlay.tsx
├── hooks/
│   ├── useGlowAnimation.ts
│   ├── useBreathingAnimation.ts
│   └── useStormMode.ts
├── styles/
│   ├── refined-theme.css
│   ├── animations.css
│   └── gradients.css
├── routes/
│   └── index.tsx (updated to use refined components)
└── lib/
    └── animation-config.ts
```

## 6. Interaction Flows

### A. Selecting a Drain
1. User clicks on an alert item in the feed.
2. The map zooms to the drain location (use Leaflet's `map.flyTo()`).
3. The focused card in the map updates with the drain's details.
4. The drain's marker pulses with an intensified glow.

### B. Activating Storm Mode
1. User clicks the "SIMULATE STORM" button.
2. The entire UI glitches briefly (0.2s).
3. The background transitions to a darker, stormier theme.
4. Rain-streak overlays appear and animate downward.
5. All drain markers pulse more intensely.
6. A system alert appears at the top with "FLASH FLOOD WARNING".

### C. Dispatching a Crew
1. User clicks "QUICK DISPATCH" on a focused drain.
2. The card expands with a morphing animation.
3. A crew selection dropdown appears.
4. On selection, the drain's status changes to "DISPATCHED" with a blue glow.

## 7. Performance Considerations

- Use `will-change: transform` on animated elements.
- Implement `requestAnimationFrame` for smooth 60fps animations.
- Lazy-load the map component.
- Memoize components to prevent unnecessary re-renders.
- Use CSS animations for background gradients (more performant than JS).

## 8. Accessibility & Responsiveness

- Ensure all interactive elements have proper focus states.
- Use `aria-labels` for icon buttons.
- Test on mobile, tablet, and desktop viewports.
- Ensure animations can be disabled via `prefers-reduced-motion`.

## 9. Deliverables

1. **Refined Components**: All React components as specified above.
2. **Tailwind Configuration**: Updated `tailwind.config.ts` with custom colors and animations.
3. **CSS Animations**: Separate `animations.css` file with all keyframe definitions.
4. **Updated Routes**: Modified `src/routes/index.tsx` to use the new components.
5. **Framer Motion Configs**: Animation configuration file with reusable variants.
6. **Documentation**: Inline comments and a README explaining the design system.

## 10. Success Criteria

- The dashboard is visually stunning with smooth, fluid animations.
- All components respond to user interactions with "crazy" animations.
- The design maintains the original functionality (showing drains, alerts, map).
- Performance is smooth (60fps) on modern browsers.
- The design is responsive and works on mobile, tablet, and desktop.
- Storm Mode creates a dramatic visual shift.

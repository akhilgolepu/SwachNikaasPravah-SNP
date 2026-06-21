# Design Specification: Hyper-Modern "DrainageAI" ICCC Redesign

## Core Vision
Transform the existing industrial, sharp-edged "DrainageAI" dashboard into a high-end, futuristic, and "crazy" visual experience. The design should feel fluid, organic yet technical, and highly reactive.

## 1. Visual Language: "Hyper-Focused Gradient & Fluidity"
- **Shapes**: Transition from 0px radius to extreme rounding (e.g., `rounded-3xl` or `rounded-[2rem]`). Use glassmorphism for containers.
- **Gradients**: 
    - Use "Hyper-focused" mesh gradients for backgrounds.
    - Component borders should have "Conic" or "Linear" gradient strokes that animate on focus.
    - Highlight colors: Electric Blue (`#0066FF`), Neon Cyan (`#00F2FF`), Deep Purple (`#7000FF`), and Alert Red (`#FF3B3B`).
- **Uplifting/Focus**: Elements that are "Active" or "Critical" should have a "floating" effect using deep multi-layered shadows and a subtle glow (outer-glow).

## 2. Animation Strategy: "Crazy & Fluid"
- **Entry Animations**: Use staggered spring physics for all bento cards.
- **Micro-interactions**: 
    - Hovering over a KPI card should trigger a "liquid" wave effect in the background gradient.
    - The "Active Alert Feed" items should slide in with a "rubber-band" effect.
    - The Map markers should be "pulsating rings" with multi-layered expansion.
- **State Transitions**: 
    - When "Storm Mode" is activated, the entire UI should "glitch" briefly and transition to a deep dark theme with rain-streak overlays and thunderous flash animations in the background.
    - Selection of a drain should "zoom" the map while the side panel "expands" with a fluid morphing transition.

## 3. Component Redesign
### A. KPI Bento (Top)
- **Current**: Sharp rectangles, flat colors.
- **Refined**: Rounded "Pill" containers or organic blobs. Use "Bento Grid" but with varying heights and widths. Each KPI has a background "aura" corresponding to its status.

### B. Alert Feed (Left)
- **Current**: List of items with small dots.
- **Refined**: "Card Stack" appearance. High-risk alerts should have a "shimmer" effect. Text should use high-contrast typography (e.g., "Cal Sans" or "Inter Tight") with variable weights.

### C. Map Workspace (Center/Right)
- **Current**: Standard Leaflet dark map.
- **Refined**: Use a custom Mapbox/Vector style with "Glowing" paths. Drains should be represented by "3D-like" glowing spheres.

## 4. Technical Implementation Details (for Gemini)
- **Framework**: React 19 + Tailwind CSS 4.
- **Animation Library**: Framer Motion (essential for the "crazy" animations).
- **Styling**: Use `backdrop-blur-xl`, `bg-white/5`, and `border-white/10` for the glass effect.
- **Gradients**: Implement using CSS `radial-gradient` and `conic-gradient` with `@keyframes` for movement.

## 5. Interaction Model
- **"The Uplift"**: When a user hovers over a critical drain, the card should scale up slightly, the border-gradient should accelerate, and a subtle "hum" animation (visual) should appear.
- **"The Pulse"**: The entire dashboard should have a subtle "breathing" animation in the background gradients.

# UI/UX Design Specification Document (design.md)

This document establishes the comprehensive design system, token layout, and interactive behaviors for the premium portfolio and interface architecture. It translates structural grid mechanics directly into frontend execution parameters.

---

## 1. System Aesthetic & Core Philosophy

The interface leverages a high-density, minimalist **Bento Grid architecture** heavily inspired by premium, structural grid systems. It relies on microscopic layout precision, generous negative space, high contrast, and tactile interactive responses rather than heavy graphical assets.

---

## 2. Design Tokens & Theme Configuration

### 2.1 Typography Hierarchy

* **Global Font Stack:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `SF Pro Display`, `Neue Haas Grotesk`, sans-serif.
* **Headings Tracking:** `-0.03em` (Tight, editorial feel).
* **Body & Descriptions Tracking:** `-0.01em` (Optimized readability).

### 2.2 Color Tokens & Variables

The system operates on a high-contrast dual-theme configuration.

| Token Type | Dark Baseline Theme (Default) | Light Cream Theme |
| --- | --- | --- |
| **Canvas Background** | `#0A0A0A` | `#FDFBF7` |
| **Card / Surface Background** | `#121212` or `#161616` | `#FFFFFF` |
| **Primary Typography** | `#FFFFFF` (100% Opacity) | `#1A1A1A` |
| **Secondary / Muted Text** | `#8F8F8F` | `#6B6B6B` |
| **Borders & Gridlines** | 1px line using `#1F1F1F` | 1px line using `#E5E2DA` |
| **Interactive Accent** | Premium Tech-Blue (`#0066FF`) | Premium Tech-Blue (`#0066FF`) |
| **Ambient Luminescence** | Radial Overlay: `rgba(255,255,255,0.03)` | Drop Highlight: `rgba(0,102,255,0.02)` |

---

## 3. Grid Architecture & Sizing Constraints

```
+-------------------------------------------------------------+
| Desktop Base Canvas (1440px Viewport)                        |
|   +-----------------------------------------------------+   |
|   | Centered Structural Container (Max-Width: 1200px)   |   |
|   |                                                     |   |
|   |  [Card (Col 1-4)]   [Card (Col 5-8)]   [Card (9-12)]  |   |
|   |  <---- Gap: 24px ---->                              |   |
|   +-----------------------------------------------------+   |
+-------------------------------------------------------------+

```

### 3.1 Structural Constraints

* **Desktop Design Canvas:** `1440px` baseline width.
* **Maximum Structural Containment:** Content must remain centered and bounded within a strict `max-width: 1200px` framework (`margin: 0 auto`).
* **Responsive Adaptation Breakpoints:**
* **Tablet Scale:** `810px`
* **Mobile Fluid Scale:** `390px`



### 3.2 Spacing & Radii Layout Metrics

* **Section Vertical Padding:**
* **Desktop:** `120px` top and bottom.
* **Tablet:** `80px` top and bottom.
* **Mobile:** `60px` top and bottom.


* **Bento Layout Grid Gaps:** Explicit `24px` grid gaps on desktop layout patterns, scaling fluidly to `16px` on mobile screens.
* **Card Internal Content Padding:** `40px` uniform standard padding (`32px` on compressed viewports).
* **Border Radius Matrix:**
* **Structural Cards / Main Blocks:** `16px`
* **Internal UI Mockups / Embedded Components:** `12px`
* **Status Elements / UI Pills:** `100px` (Capsule shape)



---

## 4. Custom Components & Interactive Mechanics

### 4.1 The Half-Screen Backdrop-Blur Navbar

* **Desktop Frame:** Anchored header pinned to viewport top with an explicit `64px` structural height profile, a 1px thin bottom baseline border, and enhanced by a `backdrop-filter: blur(12px)` occlusion layer.
* **Mobile Half-Screen Overlay:** When triggered via mobile hamburger menu, the configuration expands natively into a split overlay masking exactly `50%` of the viewport panel width. Transition must lock body scrolling and animate horizontally with an explicit ease-out matrix curve.

### 4.2 Dynamic Color Interpolation Buttons

* **Default State:** Transparent or theme-matched interior fill, defined by a crisp 1px high-contrast structural boundary matching active color tokens.
* **Hover Interactive Trigger:** Micro-interaction forces a rapid color interpolation filling the entire layer structure with Premium Tech-Blue (`#0066FF`), transitioning text color values to clean `#FFFFFF` simultaneously.

```css
/* Core Interaction Token Transition */
.btn-premium-action {
  border: 1px solid var(--border-token);
  transition: background-color 0.3s cubic-bezier(0.25, 1, 0.5, 1), 
              color 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}
.btn-premium-action:hover {
  background-color: #0066FF;
  color: #FFFFFF;
  border-color: #0066FF;
}

```

---

## 5. Structural App Routing & Page Wireframes

### 5.1 Main Interface View (Home/Dashboard)

* **Hero Section:** High-density minimalist statement piece featuring sharp, structural display headings tracking at `-0.03em`.
* **The Master Bento Grid:** Flexible 12-column masonry grid housing multi-span data items, projects, and active visualization models. Cards maintain an immutable inner padding of `40px` with crisp `16px` outer radiuses.

### 5.2 Support & Communication Workspace (Contact/System Configuration)

* **Layout:** Two-column grid asset execution. Left panel houses immediate direct metadata contact channels; right panel houses a structured validation communication interface designed with clean, high-contrast borders and token-locked focus behaviors.

### 5.3 System Exceptional Outages (404 Error View)

* **Layout:** Centered structural flex layout. Employs large display topography alongside a prominent fallback home router CTA utilizing the standard color interpolation button structure to maintain unified brand continuity.
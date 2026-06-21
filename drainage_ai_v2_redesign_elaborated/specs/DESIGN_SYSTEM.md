# DrainageAI v2.0 Design System

## 1. Color System

### Primary Brand Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Electric Blue | `#0066FF` | Primary actions, focus states, positive indicators |
| Neon Cyan | `#00F2FF` | Secondary highlights, accents, glow effects |
| Deep Purple | `#7000FF` | Tertiary accents, gradient overlays |

### Status Colors
| Status | Hex | Usage |
|--------|-----|-------|
| Critical | `#FF3B3B` | High-risk drains, urgent alerts |
| Warning | `#F5A524` | Medium-risk drains, caution alerts |
| Success | `#17C964` | Dispatched crews, normal status |

### Neutral Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#050505` | Main background |
| Foreground | `#FFFFFF` | Text, primary content |
| Glass | `rgba(255, 255, 255, 0.03)` | Card backgrounds |
| Glass Border | `rgba(255, 255, 255, 0.08)` | Card borders |

## 2. Typography

### Font Families
- **Sans-serif**: "Inter Tight" (primary UI font)
- **Monospace**: "JetBrains Mono" (data, metrics, labels)

### Type Scale
| Size | Usage | Weight |
|------|-------|--------|
| 48px | KPI values | Bold (700) |
| 24px | Section titles | Bold (600) |
| 20px | Card titles | Semibold (600) |
| 14px | Body text | Regular (400) |
| 12px | Secondary text | Regular (400) |
| 10px | Labels, mono | Regular (400) |
| 8px | Micro labels | Regular (400) |

## 3. Spacing System

### Spacing Scale (in pixels)
- `4px` (0.25rem)
- `8px` (0.5rem)
- `12px` (0.75rem)
- `16px` (1rem)
- `24px` (1.5rem)
- `32px` (2rem)
- `48px` (3rem)
- `64px` (4rem)

## 4. Border Radius

| Radius | Size | Usage |
|--------|------|-------|
| `sm` | 12px | Small components, inputs |
| `md` | 18px | Medium cards, containers |
| `lg` | 24px | Large cards, panels |
| `xl` | 32px | Extra-large containers |
| `2xl` | 48px | Full-width sections, pills |

## 5. Shadow System

### Glassmorphism Shadows
- **Subtle**: `0 0 20px 0px rgba(0, 102, 255, 0.2)`
- **Medium**: `0 0 40px 10px rgba(0, 102, 255, 0.3)`
- **Intense**: `0 0 60px 20px rgba(0, 102, 255, 0.4)`

### Elevation Shadows
- **Level 1**: `0 4px 12px rgba(0, 0, 0, 0.1)`
- **Level 2**: `0 8px 24px rgba(0, 0, 0, 0.2)`
- **Level 3**: `0 16px 48px rgba(0, 0, 0, 0.3)`

## 6. Animation System

### Timing Functions
- **Spring**: `stiffness: 260, damping: 20` (primary)
- **Gentle**: `stiffness: 100, damping: 15` (secondary)
- **Liquid**: `stiffness: 400, damping: 10` (micro-interactions)

### Durations
- **Instant**: 0.1s (micro-interactions)
- **Quick**: 0.3s (hover states, transitions)
- **Standard**: 0.6s (component entrance)
- **Slow**: 1s+ (background animations, breathing effects)

### Key Animations
| Animation | Duration | Effect |
|-----------|----------|--------|
| `float` | 6s | Vertical floating motion |
| `breathe` | 6s | Scale and opacity pulsing |
| `pulse-dot` | 1.2s | Dot pulsing for critical items |
| `glitch` | 0.2s | Storm mode glitch effect |
| `shimmer` | 2s | Shimmer effect for highlights |

## 7. Component Specifications

### Glass Card Component
```
Background: rgba(255, 255, 255, 0.03)
Border: 1px solid rgba(255, 255, 255, 0.08)
Backdrop Filter: blur(40px)
Border Radius: 18px
Padding: 24px
Transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1)

Hover State:
  Background: rgba(255, 255, 255, 0.05)
  Border: 1px solid rgba(255, 255, 255, 0.2)
  Shadow: 0 0 40px -10px rgba(0, 102, 255, 0.3)
  Transform: translateY(-4px)
```

### KPI Card Component
```
Layout: Flex column
Content:
  - Label: 10px mono uppercase, color: rgba(255, 255, 255, 0.4)
  - Value: 48px bold, color: status-specific
  - Sub: 12px regular, color: rgba(255, 255, 255, 0.4)

Glow Element:
  - Width: 96px
  - Height: 96px
  - Border Radius: 50%
  - Filter: blur(60px)
  - Opacity: 0.2
  - Position: absolute top-right
```

### Alert Item Component
```
Layout: Flex column
Content:
  - Status: 10px mono uppercase, with pulsing dot
  - Name: 14px semibold
  - Location: 12px regular, muted
  - Risk Score: 18px bold mono, right-aligned

Hover State:
  Transform: translateX(10px)
  Background: rgba(255, 255, 255, 0.1)
  Border: 1px solid rgba(255, 255, 255, 0.2)
  Transition: 0.3s cubic-bezier(0.23, 1, 0.32, 1)
```

## 8. Interaction Patterns

### Focus States
When a component is focused or hovered:
1. Scale up slightly (1.02x to 1.05x)
2. Increase shadow/glow intensity
3. Brighten border color
4. Animate gradient rotation (if applicable)

### Selection States
When a component is selected:
1. Add a 2px border in the accent color
2. Increase glow intensity significantly
3. Highlight background slightly
4. Maintain state until deselected

### Loading States
- Use pulsing animations for skeleton loaders
- Maintain glassmorphism aesthetic
- Use subtle opacity changes (0.5 to 0.8)

## 9. Responsive Design

### Breakpoints
| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 768px | Single column, stacked |
| Tablet | 768px - 1024px | 2-column layout |
| Desktop | > 1024px | Full 3-column layout |

### Responsive Adjustments
- **Mobile**: Reduce padding, simplify animations, stack components
- **Tablet**: Adjust spacing, optimize touch targets
- **Desktop**: Full feature set, complex layouts, all animations

## 10. Accessibility Guidelines

### Color Contrast
- All text must have a contrast ratio of at least 4.5:1
- Interactive elements should have a contrast ratio of at least 3:1

### Motion
- Respect `prefers-reduced-motion` media query
- Provide options to disable animations
- Ensure functionality works without animations

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Focus states must be clearly visible
- Tab order should follow logical flow

### Screen Readers
- Use semantic HTML
- Add `aria-labels` to icon buttons
- Provide alt text for images
- Use `aria-live` regions for dynamic updates

## 11. Performance Optimization

### CSS Animations
- Use `transform` and `opacity` for smooth 60fps animations
- Avoid animating `width`, `height`, or `position`
- Use `will-change` sparingly

### JavaScript Animations
- Use Framer Motion for complex animations
- Implement `requestAnimationFrame` for custom animations
- Memoize components to prevent unnecessary re-renders

### Loading
- Lazy-load the map component
- Implement code splitting for large components
- Use CSS for background gradients (more performant than JS)

## 12. Dark Mode Considerations

The design is optimized for dark mode. Light mode adjustments:
- Invert color values appropriately
- Increase contrast for readability
- Adjust shadow/glow colors to maintain visibility
- Test all animations in both modes

---
name: NEXT VISION Minimalist Design System
description: Swiss Modern Monochrome Minimalist Design System for Luxury Eyewear
colors:
  primary: "#09090b"
  primary-hover: "#18181b"
  neutral-bg: "#ffffff"
  surface-canvas: "#fafafa"
  surface-elevated: "#f4f4f5"
  surface-dark: "#09090b"
  surface-dark-elevated: "#18181b"
  border-subtle: "#e4e4e7"
  border-strong: "#d4d4d8"
  border-dark: "#27272a"
  text-primary: "#09090b"
  text-secondary: "#52525b"
  text-muted: "#71717a"
  text-inverted: "#ffffff"
  text-inverted-muted: "#a1a1aa"
  accent-success: "#10b981"
  accent-danger: "#ef4444"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.08em"
  caption:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.04em"
  badge:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "0.5625rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.05em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-inverted}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-secondary:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.neutral-bg}"
    rounded: "{rounded.xl}"
    padding: "24px"
---

## Overview

The NEXT VISION design system is anchored in **Swiss Modern Monochrome Minimalism** — the world's most widely adopted, durable, and sophisticated aesthetic for high-end luxury products, modern optometry, and architectural fashion.

Rather than relying on ornamental gold gradients, skeuomorphic brass accents, or heavy drop shadows, NEXT VISION achieves supreme luxury through:
- **Absolute Contrast**: Deep jet black (`#09090B`), stark white (`#FFFFFF`), and refined slate-zinc midtones (`#71717A`).
- **Precision Typography**: Editorial serif headlines paired with crisp, high-legibility geometric sans-serif body text.
- **Generous Whitespace**: Spatial hierarchy that lets handcrafted frames and real-time AR face-mesh tracking take center stage.
- **Intentional Micro-interactions**: Smooth state transitions, subtle borders (hairline zinc borders), and tactile feedback.

---

## Colors

The palette is strictly minimal, high-contrast, and neutral. Accent color is reserved exclusively for utility states (emerald for live tracking, verified badges, and affirmative status; ruby/rose for errors and removal actions).

### Palette Architecture

| Role | Token / Hex | Use Case |
| :--- | :--- | :--- |
| **Canvas Light** | `#FFFFFF` | Default page background, modal bodies, clean product card surfaces |
| **Canvas Subtle** | `#FAFAFA` | Neutral background alternation, filter bars, subtle segment trays |
| **Canvas Elevated** | `#F4F4F5` | Secondary button backgrounds, badge containers, input fills |
| **Canvas Dark** | `#09090B` | Announcement bars, hero section, dark footer, primary buttons |
| **Canvas Dark Alt** | `#18181B` | Elevated cards within dark sections, dark modal headers |
| **Text Primary** | `#09090B` | Primary headings, titles, prices, active tabs |
| **Text Secondary** | `#52525B` | Subheadings, feature labels, navigation links |
| **Text Muted** | `#71717A` | Metadata, dimensions, hints, disabled states |
| **Text Inverted** | `#FFFFFF` | Text on dark containers and primary buttons |
| **Border Hairline** | `#E4E4E7` | 1px clean card borders, table dividers, subtle segment lines |
| **Border Dark** | `#27272A` | Subtle separation lines within dark surfaces |
| **State Active / Verified** | `#10B981` | Live AR tracking indicator, optometrist verified status, free shipping |
| **State Destructive** | `#EF4444` | Delete actions, error banners, validation alerts |

---

## Typography

A dual-type system combining editorial luxury with digital clarity:

1. **Serif (Headings & Display)**: `Playfair Display, Georgia, serif`
   - Expresses haute-couture optical craftsmanship and heritage atelier precision.
   - Used for main hero headers (`h1`), section titles (`h2`), and modal titles.
   - Text styling is kept authentic: no artificial gradients. Emphasis is achieved strictly through weight, scale, and italic posture.

2. **Sans-Serif (Body & UI)**: `Plus Jakarta Sans, Inter, system-ui, sans-serif`
   - Ultra-clean geometric letterforms optimized for optical prescriptions, lens coating specifications, dimensions, and transactional interfaces.
   - Used for body copy, buttons, badges, navigation, data tables, and forms.

3. **Monospace (Measurements & Data)**: `JetBrains Mono, ui-monospace, monospace`
   - Used for lens axis degrees, cylinder/sphere values, face-mesh point counters, and order tracking numbers.

---

## Layout

- **Container Scale**: Maximum width constrained to `80rem` (`1280px`, `max-w-7xl`) with responsive gutters (`px-4 sm:px-6 lg:px-8`).
- **Vertical Rhythm**: Generous vertical breathing room (`py-16` to `py-24` on desktop, `py-12` on mobile) avoiding visual clutter.
- **Grid Architecture**: Standard 12-column grid for complex layouts (Hero, Footer); responsive 1-to-4 column grid for catalog cards (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).
- **Z-Index Layering**:
  - Sticky Navigation: `z-40`
  - Side Drawers & Overlays: `z-50`
  - AR Webcam Fullscreen Modal: `z-50`
  - Floating Toast / Concierge: `z-40`

---

## Elevation & Depth

True minimalism relies on **tonal layering and crisp hairline borders** rather than thick, murky drop shadows:
- **Flat Surface**: Default state uses hairline borders (`border border-zinc-200`) on white or light gray backgrounds.
- **Subtle Elevation (`shadow-sm`, `shadow-md`)**: Used on interactive cards on hover, providing tactile lift without muddiness.
- **Backdrop Blur (`backdrop-blur-md`)**: Applied to sticky headers and modal backdrops (`bg-zinc-950/60 backdrop-blur-sm`) to maintain environmental context.

---

## Shapes

- **Corner Radius**:
  - Small pills & badges: `rounded-full`
  - Buttons & Inputs: `rounded-xl` (`12px`) or `rounded-full` (`9999px`)
  - Product & Clinic Cards: `rounded-2xl` (`16px`)
  - Large Modals: `rounded-2xl` or `rounded-3xl`
- **Form Language**: Balanced rounded rectangles that feel friendly yet mathematically precise.

---

## Components

### Buttons
- **Primary Button**: `bg-zinc-950 text-white hover:bg-zinc-800 active:scale-[0.98] font-bold rounded-xl transition-all`
- **Secondary Button**: `bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-100 font-semibold rounded-xl`
- **Inverted Button (on dark surfaces)**: `bg-white text-zinc-950 hover:bg-zinc-200 font-bold rounded-xl`
- **Ghost Button**: `text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg`

### Cards & Containers
- Clean white background (`bg-white`), hairline zinc boundary (`border border-zinc-200`), smooth hover transform (`hover:-translate-y-1 hover:border-zinc-400 hover:shadow-lg transition-all duration-300`).

### Badges & Status Indicators
- Minimal neutral pills: `bg-zinc-100 text-zinc-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-zinc-200`
- Active / Live Indicator: Solid emerald dot (`w-2 h-2 rounded-full bg-emerald-400 animate-pulse`) with zinc label.

### Inputs & Selects
- `bg-white border border-zinc-300 rounded-xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950`

---

## Do's and Don'ts

### Do:
- **Do** maintain high visual contrast between text and background at all times.
- **Do** use pure black (`#09090B`) and white (`#FFFFFF`) as the foundational pillars.
- **Do** rely on font weight, size, and whitespace for visual hierarchy.
- **Do** use Lucide SVG icons with balanced stroke widths (`w-4 h-4 stroke-[1.75]`).
- **Do** keep animations subtle, fast, and purposeful (`150ms` - `300ms` cubic-bezier).

### Don't:
- **Don't** use decorative text gradients or shimmering gold text (`gold-shimmer`).
- **Don't** use emojis (`👑`, `🏛️`) in place of professional icon systems.
- **Don't** use amber, brass, or yellow borders or buttons that degrade the minimalist aesthetic.
- **Don't** add heavy multi-layered drop shadows or low-contrast gray text on dark containers.
- **Don't** clutter screens with unnecessary decorative lines or floating background glows.

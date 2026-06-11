# SiteAudit Agent Design System

This document serves as the single source of truth for styling and UI patterns across the Website Audit Platform. All new pages and components MUST adhere to these rules.

## Core Visual Identity

### Background & Layout
-   **Global Background**: `radial-gradient(circle at top center, rgb(26, 26, 46) 0%, rgb(0, 0, 0) 100%)` (defined in `globals.css`).
-   **Texture**: Subtle grid overlay via `body::before` (linear-gradient white/0.03).
-   **Z-Index Layering**: All page content must be wrapped in a container with the `.content-layer` utility to ensure it sits above the grid background.
-   **Page Container**: Standard wrapper is `<main className="container mx-auto px-4 py-8 content-layer">`.

### Glassmorphism
The platform relies heavily on a "premium glass" aesthetic.
-   **Class**: `.glass` (defined in `globals.css`)
-   **Properties**:
    -   Background: `rgba(255, 255, 255, 0.05)`
    -   Blur: `backdrop-filter: blur(16px)`
    -   Border: `1px solid rgba(255, 255, 255, 0.1)`
-   **Rounded**: Typically `rounded-xl`.

### Typography
-   **Headings**: `font-semibold text-white` (e.g., `text-xl` for section headers).
-   **Body Text**: `text-neutral-400` or `text-neutral-300` for high contrast against dark backgrounds.
-   **Highlight/Accent**: Use specific colors (e.g., `text-green-400`, `text-primary-400`) sparingly for metrics and icons.

### Color Palette (Tailwind)
-   **Primary**: `primary-500` (Blue/Indigo variants), `primary-400` (lighter accent)
-   **Success**: `green-500` (backgrounds/borders), `green-400` (text/icons)
-   **Warning**: `yellow-500` (backgrounds/borders), `yellow-400` (text/icons)
-   **Error**: `red-500` (backgrounds/borders), `red-400` (text/icons)
-   **Neutral**: `neutral-900` (dark cards), `neutral-500` (subtext), `neutral-400` (body), `white` (headings)

## Component Patterns

### 1. Section Headers
Navigate sections with a clear hierarchy.
```tsx
<section>
  <h2 className="mb-4 text-xl font-semibold text-white">
    Section Title
  </h2>
  {/* Content */}
</section>
```

### 2. Cards (Standard & Glass)
Use the `.glass` utility for cards to maintain the premium feel.
```tsx
<div className="glass rounded-xl border border-white/10 p-6 content-layer">
  <div className="flex items-center gap-3">
    {/* Icon Container */}
    <div className="rounded-lg bg-primary-500/20 p-2 border border-primary-500/30">
      <Icon className="h-5 w-5 text-primary-400" />
    </div>
    {/* Content */}
    <div>
      <p className="text-sm text-neutral-400">Label</p>
      <p className="text-2xl font-bold text-white">Value</p>
    </div>
  </div>
</div>
```

### 3. Metric/Score Cards
Consistent pattern for displaying key metrics.
-   Icon on the left, rounded-lg background with matching border.
-   Metric value large (`text-2xl` or `text-3xl`) and bold.
-   Descriptive label in `text-neutral-400`.

### 4. Animations
-   Use `framer-motion` for page transitions and element stagger.
-   Standard container variants: `staggerContainer` (from `@/lib/animations`).
-   Wrap main content in `<motion.div variants={staggerContainer} initial="hidden" animate="visible">`.

## Implementation Rule
**Before finalizing any new UI code:**
1.  Verify the root container uses `content-layer`.
2.  Ensure no raw hex colors are used for layout backgrounds (use `.glass` or standard Tailwind colors).
3.  Check that text contrast is sufficient (`text-white` for headers, `text-neutral-400` for body).
4.  Confirm all cards use the `border-white/10` style for subtle separation.

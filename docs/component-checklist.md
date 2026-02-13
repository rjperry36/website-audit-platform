# Component & Page Checklist

Use this checklist to verify that new UI components and pages adhere to the SiteAudit Agent design system.

## 1. Structure & Layout
- [ ] Root container uses `.content-layer` utility?
- [ ] Page content wrapped in `<main className="container mx-auto px-4 py-8 content-layer">`?
- [ ] Section headers use `text-xl font-semibold text-white`?

## 2. Visual Style
- [ ] Backgrounds use `.glass` utility instead of solid colors?
- [ ] Cards have `border-white/10` and `rounded-xl`?
- [ ] No raw hex codes for colors (use Tailwind classes)?
- [ ] Text contrast sufficient (`text-white` for headers, `text-neutral-400` for body)?

## 3. Typography & Formatting
- [ ] Metrics/Scores are large and bold (`text-2xl font-bold text-white`)?
- [ ] Labels use `text-sm text-neutral-400`?
- [ ] Icons are properly sized (usually `h-5 w-5`) and colored with Tailwind?

## 4. Interactions & Motion
- [ ] Main content enters with `staggerContainer` animation?
- [ ] Hover effects use `glass-hover` or subtle opacity changes?
- [ ] Transitions are smooth (`transition-all duration-300`)?

## 5. Mobile Responsiveness
- [ ] Layouts use grid/flex with responsive breakpoints (`md:grid-cols-2`, `lg:grid-cols-3`)?
- [ ] Padding/Margins adjust for smaller screens (`px-4`)?

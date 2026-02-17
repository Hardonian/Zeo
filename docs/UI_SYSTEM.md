# UI System

## Scope
This UI system applies to the public web surface in `apps/web` for static, marketing, and docs/demo composition. It standardizes tokens and layout primitives without changing product architecture.

## Design tokens (single source)
Tokens are defined in `apps/web/src/components/site/ui-system.tsx`.

- **Typography**
  - Page heading: `text-3xl font-semibold tracking-tight text-slate-900`
  - Lead/body: `text-base|text-lg leading-7 text-slate-600`
  - Section title: `text-xl font-semibold tracking-tight text-slate-900`
- **Spacing**
  - Main container: `max-w-6xl px-6`
  - Page stack rhythm: `space-y-10 md:space-y-12`
  - Section padding: card sections use `p-6` (expanded to `p-8` in CTA band)
- **Radii and shadows**
  - Standard cards: `rounded-2xl` + `shadow-sm`
  - Buttons: `rounded-lg`
- **Colors**
  - Base background: `bg-slate-50`
  - Content surfaces: `bg-white` with `border-slate-200`
  - Accent actions: blue/indigo gradient from `from-blue-600 to-indigo-600`
- **Layout primitives**
  - `uiTokens.container` for shell/header/footer consistency
  - `Section` for normalized boxed content
  - `PageIntro` for title + lead pattern
  - `CTASection` for final conversion band on static pages

## Composition rules
For public/static pages, default composition is:

1. Hero or intro section
2. Supporting content sections (cards/grids)
3. CTA band (`CTASection`)
4. Global footer (`PublicShell`)

## Navigation and footer consistency
`PublicShell` owns shared nav/footer link sets so all public pages inherit one source for menu completeness, active states, and focus-visible behavior.

## Accessibility rules
- Keep one visible page heading (`h1`) per non-hero page; hero pages may use a screen-reader `h1`.
- Use `focus-visible` outlines for nav/actions.
- Preserve meaningful `alt` text for non-decorative images.
- Keep semantic links as `<Link>`/`<a>` and action controls as `<button>`.

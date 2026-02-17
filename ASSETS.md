# Zeo Image Assets

Where each `zeo-images/` source asset is used across the site.

## Source mapping

| Source file                         | Deployed to                            | Used in                                              |
| ----------------------------------- | -------------------------------------- | ---------------------------------------------------- |
| `zeo-images/zeo-favicon.png`        | `apps/web/public/brand/zeo/favicon.png`| Root layout icon, webmanifest, apple-touch-icon       |
| `zeo-images/zeo-whiteborder-1x1.png`| `apps/web/public/brand/zeo/icon.png`   | Structured data logo (`icon.png`)                    |
| `zeo-images/zeo-main.png`           | `apps/web/public/brand/zeo/logo-primary.png` | Brand reference (not directly rendered)        |
| `zeo-images/zeo-white.png`          | `apps/web/public/brand/zeo/logo-white.png`   | Brand reference (not directly rendered)        |
| `zeo-images/zeo-justlogo-16x9.png`  | `apps/web/public/brand/zeo/og-image.png`     | Default OpenGraph / Twitter Card image          |
| `zeo-images/zeo-fullspread-hero.png`| (source only)                          | High-res source; web-sized derivative below          |
| `zeo-images/zeo-landscape-nologo.png`| (source only)                         | High-res source for landscape crops                  |
| `zeo-images/zeo-4x5.png`           | (source only)                          | Portrait-ratio source for future use                 |

## Web-sized derivatives (root level)

| File                          | Deployed to                              | Used in                              |
| ----------------------------- | ---------------------------------------- | ------------------------------------ |
| `zeo_website_hero.png`        | `apps/web/public/brand/zeo/hero.png`     | Platform page hero banner            |
| `zeo_website_governance.png`  | `apps/web/public/brand/zeo/governance.png`| Homepage governance section          |
| `zeo_website_signals.png`     | `apps/web/public/brand/zeo/signals.png`  | Homepage signal tracking section     |
| `zeo_website_governance2.png` | (not deployed)                           | Alternative governance visual        |
| `zeo_website_cli_assist.png`  | (not deployed)                           | CLI assist visual (available)        |

## Generated assets

| File                              | Location                          | Purpose                              |
| --------------------------------- | --------------------------------- | ------------------------------------ |
| `favicon.svg`                     | `apps/web/public/favicon.svg`     | SVG favicon (vector, all sizes)      |
| `site.webmanifest`                | `apps/web/public/site.webmanifest`| PWA manifest with icon references    |

## Panel screenshots

All panel screenshots live under `apps/web/public/panels/<panel-name>/screen.png` and are used on:
- Homepage (`zeo_decision_dashboard`)
- Features page (`decision_branching_view_1`, `sensitivity_&_flip-thresholds_panel`, `option_value_inspector`, `provenance_explorer_panel`)
- About page (`audit_packet_builder`)
- Product/demo pages (all panels)

## SVG illustrations

Located in `apps/web/public/illustrations/`:
- `counterfactual-graph.svg` - Features page (Decision Branching section)
- `regret-envelope.svg` - About page (Robustness principle)
- `flip-threshold.svg`, `engine-block.svg`, `transparency-badges.svg`, `voi-diagram.svg`, `value-policy.svg` - Available for docs/feature pages

## Image sizing conventions

- Panel screenshots: `width={900} height={600}` (3:2 ratio)
- Hero/section images: `width={1200} height={630}` or `width={600} height={400}`
- Illustrations (SVG): explicit `width` and `height` set for CLS prevention
- All non-critical images use `loading="lazy"`
- Hero images on landing use `priority` for LCP

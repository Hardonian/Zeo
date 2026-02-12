# Marketing Site Changelog

## [Unreleased] - 2026-02-12

### Added
- **Stitch Panel Integration**: Added 44 new Stitch panels from `stitch_oss_governance_dashboard.zip`
  - Total panels now available: 78 (34 Decision Intelligence + 44 Governance & Compliance)
  - Categorized panel browsing by: Decision Intelligence, Governance & Compliance
  - All panels accessible via `/stitch/[slug]` routes with iframe sandboxing

- **Enhanced Marketing Pages**:
  - **Homepage (`/`)**: Featured panels grid, capabilities section, category overview
  - **About (`/about`)**: Mission statement, core principles, capability list, explore links
  - **Platform (`/platform`)**: Platform overview with 6 capability cards, technical features, architecture details
  - **Pricing (`/pricing`)**: Two-tier pricing (Community/Enterprise), FAQ section, contact CTAs
  - **Contact (`/contact`)**: Multiple contact channels (GitHub, Security, Sales, Docs), response time expectations
  - **Stitch Gallery (`/stitch`)**: Categorized panel browser with 78 interactive panels

- **Documentation**:
  - `docs/STITCH_INVENTORY.md`: Complete inventory of all 78 Stitch panels with routes and descriptions
  - `docs/GAP_REPORT.md`: Analysis of implementation gaps and recommendations for future work
  - `docs/CHANGELOG_MARKETING.md`: This changelog

### Changed
- **Stitch Discovery System** (`src/lib/stitch.ts`):
  - Enhanced to recursively scan all subdirectories in `src/panels/stitch/`
  - Added category organization (Decision Intelligence, Governance & Compliance)
  - Added `getStitchPagesByCategory()` function for grouped display
  - Improved slug generation for cleaner URLs

- **Stitch Gallery Page** (`src/app/stitch/page.tsx`):
  - Reorganized to show panels by category
  - Added panel count and category headers
  - Improved visual hierarchy with grid layout

### Technical Details
- All marketing pages are static-first with no backend dependencies
- No auth gating on public routes
- Consistent navigation via `PublicShell` component
- Responsive design using Tailwind CSS
- SEO metadata added to all major pages
- TypeScript type checking passes for all new code

### Total Routes
- `/` - Homepage
- `/about` - About Zeo
- `/platform` - Platform capabilities
- `/pricing` - Pricing tiers
- `/contact` - Contact information
- `/stitch` - Panel gallery
- `/stitch/[slug]` - Individual panel viewer (78 panels)

### Assets Added
- `src/panels/stitch/stitch_oss_governance_dashboard/` - 44 new panel folders with HTML/CSS/JS and screenshots

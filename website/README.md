# Zeo Platform Website

A comprehensive, interactive website showcasing all Zeo product features extracted from the Stitch design mockups.

## Features Demonstrated

### 1. **Dashboard Overview** (`#dashboard`)
- Real-time system metrics and KPI cards
- Interactive performance charts using Chart.js
- Quick action buttons for common operations
- Recent activity feed with status indicators

### 2. **Governance Dashboard** (`#governance`)
- OSS compliance monitoring interface
- License verification panel (MIT License display)
- Contribution rules grid (CLA, DCO, CoC)
- Compliance matrix with pass/fail indicators
- Scanline visual effects for technical aesthetic

### 3. **CLI Assist Overlay** (`#cli-assist`)
- Interactive command builder interface
- Warning indicators for production targets
- Missing input detection and validation
- Suggested flags with hover states
- Live command construction preview

### 4. **Signal Discovery Workbench** (`#signals`)
- Business signal search and filtering
- KPI-based signal cards with metrics
- Effect size visualizations
- Stability and confidence risk indicators
- Expandable evidence panels with charts

### 5. **Evidence Planner** (`#evidence`)
- Prioritized action lists with value scoring
- Uncertainty reduction visualizations
- Cost/time/risk indicators per action
- Justification panels with expandable details
- Progress tracking summary

### 6. **Runner Status Popover** (`#runner`)
- Real-time job execution monitoring
- Health status with animated pulse indicators
- Execution history and uptime tracking
- Quick action buttons (Rerun, Pause)
- Log viewer access

### 7. **Merge Confirmation Dialog** (`#merge`)
- PR risk analysis presentation
- Warning cards for uncovered logic paths
- Unverified workflow detection
- Verification action buttons
- Proceed with caution options

### 8. **Causal Study Builder** (`#study`)
- Intervention definition editor with syntax highlighting
- Required assumptions checklist
- DAG and statistical assumption tracking
- Execution gate with acknowledgment
- Progress indicator

## Technical Stack

- **Framework**: Vanilla HTML5 + Tailwind CSS
- **Styling**: Tailwind CSS v3 (via CDN)
- **Icons**: Material Symbols + Lucide Icons
- **Charts**: Chart.js for data visualization
- **Fonts**: Inter, Space Grotesk, JetBrains Mono
- **Theme**: Dark/Light mode support with localStorage persistence

## File Structure

```
website/
├── index.html      # Main single-page application
└── README.md       # This documentation
```

## Usage

### Local Development

1. Navigate to the website directory:
```bash
cd website
```

2. Start a local HTTP server:
```bash
# Python 3
python -m http.server 8080

# Node.js
npx serve .

# PHP
php -S localhost:8080
```

3. Open http://localhost:8080 in your browser

### Navigation

- Use the top navigation bar to switch between different tool demos
- Click on any feature card on the hero page to jump to that tool
- Use the "Back" button in each section to return to the overview
- Toggle dark/light mode using the theme button in the navbar

### Interactive Features

1. **Charts**: Hover over chart points to see detailed metrics
2. **Checkboxes**: In Study Builder, check assumptions to enable execution
3. **Buttons**: Most buttons have hover states and click feedback
4. **Expandable Cards**: Click on signal cards to expand evidence panels
5. **Demo Modal**: Click "Watch Demo" on hero page for introduction

## Design System

### Colors
- Primary: `#2463eb` (Blue)
- Success: `#10b981` (Emerald)
- Warning: `#f59e0b` (Amber)
- Error: `#ef4444` (Red)
- Dark Background: `#0B1120`
- Dark Surface: `#1E293B`

### Typography
- Display: Inter for UI elements
- Technical: Space Grotesk for headers
- Monospace: JetBrains Mono for code

### Animations
- Card hover: translateY(-4px) with shadow
- Pulse indicators for active status
- Smooth transitions between sections
- Scanline effect on governance dashboard

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Single HTML file (~120KB)
- CDN-loaded dependencies (cached)
- Lazy initialization of charts
- Efficient CSS with Tailwind
- No external API calls required

## Credits

Design extracted from Stitch mockups:
- `stitch_zeo_landing_page.zip`
- `stitch_runner_status_popover.zip`
- `stitch_oss_governance_dashboard.zip`
- `stitch_cli_assist_overlay.zip`
- `stitch_merge_confirmation_dialog.zip`

All designs implemented as interactive web demos with full functionality simulation.

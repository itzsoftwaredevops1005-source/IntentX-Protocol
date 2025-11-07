# IntentX Design Guidelines

## Design Approach
**Reference-Based with DeFi Focus**: Drawing inspiration from leading DeFi platforms (Uniswap, Aave, dYdX) combined with futuristic "Speedway" aesthetics. This creates a professional trading interface with bold, modern visual treatment.

## Typography System

**Font Selection**: Use Inter (via Google Fonts CDN) for its excellent readability in data-heavy interfaces
- **Display**: 48px/56px, font-weight 700, tracking tight (-0.02em) for hero headlines
- **H1**: 36px/44px, font-weight 700 for page titles
- **H2**: 24px/32px, font-weight 600 for section headers
- **H3**: 18px/28px, font-weight 600 for card titles
- **Body Large**: 16px/24px, font-weight 400 for primary content
- **Body**: 14px/20px, font-weight 400 for secondary text
- **Caption/Labels**: 12px/16px, font-weight 500, uppercase tracking for input labels
- **Monospace Numbers**: Use tabular-nums for all numerical data (amounts, percentages, addresses)

## Layout System

**Spacing Primitives**: Tailwind units of **2, 3, 4, 6, 8, 12, 16, 24** (e.g., p-4, gap-8, space-y-12)

**Grid Structure**:
- **Max Container Width**: max-w-7xl (1280px) for main content
- **Card Widths**: max-w-md (448px) for swap form, max-w-lg (512px) for intent cards
- **Multi-column**: 2-3 column grids for intent dashboard and analytics (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- **Vertical Rhythm**: py-12 for section spacing on mobile, py-24 on desktop

## Component Library

### Navigation
- **Fixed header**: h-16, full-width with glassmorphism effect (backdrop-blur-lg, opacity variations)
- **Logo placement**: Left aligned with "IntentX" wordmark
- **Primary actions**: Right-aligned wallet connection button with address truncation
- **Mobile**: Hamburger menu collapsing to slide-out panel

### Hero Section
- **Height**: 60vh minimum with centered content
- **Layout**: Single column, centered text with primary CTA
- **Background**: Animated gradient mesh or abstract geometric patterns (SVG-based)
- **Content hierarchy**: Large headline → Description (max-w-2xl) → Dual CTAs (Connect Wallet + Learn More)

### Swap Interface Card
- **Container**: Elevated card with rounded-2xl borders, p-6 spacing
- **Token selectors**: Custom dropdown with token icon + symbol + balance display
- **Input fields**: Large text (text-2xl) for amounts, right-aligned
- **Swap direction button**: Circular button (w-10 h-10) centered between inputs with rotate icon
- **Slippage control**: Collapsible settings panel with preset buttons (0.5%, 1%, 2%) + custom input
- **CTA button**: Full-width, h-14, prominent placement with state variations (enabled/disabled/loading)
- **Info display**: Small text showing estimated output, route, gas estimate below CTA

### Intent Dashboard
- **Grid layout**: Responsive cards (grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-6)
- **Intent cards**: Compact design with status badge (Pending/Executed/Cancelled), token pair, amount, timestamp, action buttons
- **Status indicators**: Pill-shaped badges with icon + text
- **Empty state**: Centered illustration with descriptive text when no intents exist
- **Filters/Tabs**: Horizontal tab navigation for All/Pending/Executed/Cancelled

### Analytics Dashboard
- **Metrics grid**: 3-4 column layout for key stats (Total Intents, Executed Swaps, Total Volume)
- **Stat cards**: Large number display (text-4xl) with label below, icon accent
- **Charts/Graphs**: Use Recharts library for volume charts, success rate displays
- **Time period selector**: Button group for 24h/7d/30d/All time

### Wallet Connection
- **Modal overlay**: Full-screen backdrop with centered modal (max-w-md)
- **Provider grid**: 2-column grid of wallet options with icons + names
- **Connected state**: Condensed address display with jazzicon/blockie avatar + disconnect action

### Typography Hierarchy in Components
- **Card titles**: H3 weight with mb-3
- **Input labels**: Caption style with mb-2
- **Button text**: 16px, font-weight 600
- **Data values**: Body Large with monospace for numbers
- **Timestamps**: Caption size with reduced opacity

## Visual Treatment (Speedway Theme)

**Glassmorphism**: Apply backdrop-blur effects to overlays, modals, and navigation
**Borders**: Use 1px borders with reduced opacity on cards, subtle glow effects on focus/hover
**Elevation**: 3-tier shadow system (subtle, medium, pronounced) for depth
**Gradients**: Apply to backgrounds, accent elements, and button states (linear-gradient patterns)
**Glow Effects**: Subtle outer glow on interactive elements, stronger on active states
**Motion**: Smooth transitions (transition-all duration-300) for state changes, subtle scale transforms on hover (scale-105)

## Icons
**Library**: Heroicons (outline for navigation, solid for status indicators)
**Sizes**: w-5 h-5 for inline icons, w-6 h-6 for buttons, w-8 h-8 for feature icons

## Images
**Hero Background**: Abstract DeFi-themed illustration or animated gradient mesh (full-width, fixed position)
**Token Icons**: Use standard ERC-20 token logos from TokenLists
**Empty States**: Custom illustrations for no intents, connection prompts
**No large hero image required** - focus on animated backgrounds and gradients

## Accessibility
- Maintain 4.5:1 contrast ratios for all text
- Include focus rings on all interactive elements (ring-2 ring-offset-2)
- ARIA labels for icon-only buttons
- Loading states with spinner + descriptive text
- Form validation with inline error messages

## Responsive Breakpoints
- **Mobile**: Single column layouts, full-width cards, stacked navigation
- **Tablet (md:)**: 2-column grids, side-by-side token inputs
- **Desktop (lg:)**: 3-column grids, expanded navigation, larger typography scales
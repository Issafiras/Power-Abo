# CLAUDE.md - AI Assistant Guide for Power Abo Beregner

**Last Updated**: 2025-11-19
**Project Version**: v1.2
**Primary Language**: Danish (UI & Documentation)

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Project Structure](#project-structure)
4. [Code Organization Patterns](#code-organization-patterns)
5. [State Management](#state-management)
6. [Styling System](#styling-system)
7. [Component Patterns](#component-patterns)
8. [Data Management](#data-management)
9. [Testing Strategy](#testing-strategy)
10. [Development Workflow](#development-workflow)
11. [Common Tasks](#common-tasks)
12. [Important Conventions](#important-conventions)
13. [Performance Optimizations](#performance-optimizations)
14. [Accessibility Guidelines](#accessibility-guidelines)
15. [API Integration](#api-integration)
16. [Troubleshooting](#troubleshooting)
17. [Known Issues and Technical Debt](#known-issues-and-technical-debt)

---

## 🎯 Project Overview

**Power Abo Beregner** is a Danish mobile subscription and streaming service calculator built for POWER retail stores. It helps sales advisors quickly calculate the best combination of mobile plans, mobile broadband, and streaming services for customers.

### Key Features
- Multi-provider plan comparison (Telenor, Telmore, CBB)
- Streaming service bundling (Netflix, Disney+, MAX, etc.)
- Intelligent auto-solution finder
- Family discount calculations (Telenor: 50kr/month per extra line)
- Presentation mode for customer meetings
- EAN product search integration with Power.dk API
- Cash discount calculator with auto-adjust
- LocalStorage persistence
- Responsive design with mobile optimization

### Business Logic
- **6-month pricing model**: All calculations based on 6-month totals
- **Intro pricing support**: Plans can have intro prices (e.g., 199kr for 3 months, then 299kr)
- **Family discounts**: Telenor offers 50kr/month discount per additional line (from line 2+)
- **Earnings tracking**: Each plan has associated provision/earnings
- **CBB MIX**: Special bundling for 2-8 streaming services at discounted rates

---

## 🏗️ Architecture & Tech Stack

### Core Technologies
```json
{
  "framework": "React 18.2.0",
  "buildTool": "Vite 5.0.8",
  "language": "JavaScript (JSX) + TypeScript config",
  "stateManagement": "Context API + useReducer",
  "styling": "Modular CSS with CSS Variables",
  "testing": "Vitest 4.0.9 + React Testing Library",
  "icons": "Custom emoji-based Icon component (no external deps)",
  "httpClient": "Axios 1.13.1"
}
```

### Key Dependencies
- **React 18**: Hooks, Context API, Suspense, lazy loading
- **Vite**: Fast dev server, optimized builds, proxy for CORS
- **Axios**: HTTP requests to Power.dk API
- **Vitest**: Test framework with jsdom environment
- **ESLint**: Code quality with react-hooks and react-refresh plugins

### Dependency Notes
- ✅ `lucide-react`: Successfully removed - Icon component uses Unicode emoji replacements
  - Eliminated forwardRef runtime errors and reduced bundle size by ~33%
  - All icons now use custom Unicode emoji mappings in `src/components/common/Icon.jsx`
- ❌ `framer-motion`: Mentioned in README but not in package.json
- ❌ `react-hot-toast`: Mentioned in README but using custom Toast component

---

## 📁 Project Structure

```
Power-Abo/
├── .github/workflows/
│   └── deploy.yml              # GitHub Pages deployment
├── public/
│   └── logos/                  # Streaming service logos
├── src/
│   ├── components/
│   │   ├── common/            # Reusable components
│   │   │   ├── Icon.jsx       # Custom emoji-based icons
│   │   │   ├── Toast.jsx      # Notification system
│   │   │   ├── Tooltip.jsx    # Tooltips
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── AccessibilityHelper.jsx
│   │   │   ├── Breadcrumbs.jsx
│   │   │   ├── NumberDisplay.jsx
│   │   │   ├── ScrollProgress.jsx
│   │   │   └── Skeleton.jsx
│   │   ├── layout/            # Layout components
│   │   │   ├── Header.jsx
│   │   │   └── Footer.jsx
│   │   ├── mobile/            # Mobile-specific
│   │   │   └── BottomSheet.jsx
│   │   ├── results/           # Results display
│   │   │   ├── AnimatedCounter.jsx
│   │   │   ├── ComparisonChart.jsx
│   │   │   └── WhyThisSolution.jsx
│   │   ├── ui/                # Basic UI primitives
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Input.jsx
│   │       └── CBBMixSelector.jsx # Moved to features/streaming/
│   ├── features/              # Feature-based modules
│   │   ├── cart/
│   │   │   ├── Cart.jsx
│   │   │   └── Cart.test.jsx
│   │   ├── comparison/
│   │   │   └── ComparisonPanel.jsx
│   │   ├── plans/
│   │   │   ├── PlanCard.jsx
│   │   │   └── ProviderTabs.jsx
│   │   ├── presentation/
│   │   │   └── PresentationView.jsx
│   │   └── streaming/
│   │       └── StreamingSelector.jsx
│   ├── context/
│   │   └── AppContext.jsx     # Global state management
│   ├── hooks/
│   │   ├── useAppState.js     # State accessor hook
│   │   ├── useAppActions.js   # Actions accessor hook
│   │   └── useKeyboardNavigation.js
│   ├── utils/
│   │   ├── calculations.js    # All pricing/discount logic
│   │   ├── calculations.test.js
│   │   ├── storage.js         # localStorage helpers
│   │   ├── validators.js      # Input validation
│   │   ├── powerApi.js        # Power.dk API integration
│   │   ├── backendApi.js      # Backend integration (if any)
│   │   ├── optimization.js    # Performance utilities
│   │   ├── logger.js          # Logging utilities
│   │   └── logger.test.js
│   ├── data/
│   │   ├── plans.js           # All mobile plans & broadband
│   │   └── streamingServices.js # All streaming services
│   ├── styles/
│   │   ├── variables.css      # CSS custom properties
│   │   ├── main.css           # Global styles
│   │   ├── components.css     # Component styles
│   │   ├── utilities.css      # Utility classes
│   │   ├── animations.css     # Animations & transitions
│   │   ├── cbb-mix.css        # CBB MIX specific
│   │   ├── compact.css        # Compact mode
│   │   └── mobile.css         # Mobile-specific
│   ├── constants/
│   │   └── copy.js            # All UI text/labels
│   ├── test/
│   │   └── setup.js           # Vitest setup
│   ├── App.jsx                # Root component
│   └── main.jsx               # Entry point
├── .eslintrc.cjs              # ESLint config
├── .gitignore
├── vite.config.js             # Vite config with proxy
├── vitest.config.js           # Test config
├── tsconfig.json              # TypeScript config (for IDE)
├── package.json
└── README.md
```

---

## 🧩 Code Organization Patterns

### Feature-Based Structure (New Pattern)
Recent refactoring moved from component-based to **feature-based structure**:

```
features/
  cart/          # Shopping cart feature
  plans/         # Plan selection feature
  streaming/     # Streaming selection feature
  comparison/    # Comparison panel feature
  presentation/  # Presentation mode feature
```

**Each feature module contains**:
- Main component(s)
- Tests (co-located)
- Feature-specific logic

### Component Categories
1. **Features** (`src/features/`): Domain-specific, business logic
2. **Common** (`src/components/common/`): Shared, reusable across app
3. **Layout** (`src/components/layout/`): Structural (Header, Footer)
4. **UI** (`src/components/ui/`): Basic primitives (Button, Card, Input)
5. **Mobile** (`src/components/mobile/`): Mobile-specific patterns

### File Naming Conventions
- **Components**: `PascalCase.jsx` (e.g., `PlanCard.jsx`)
- **Utilities**: `camelCase.js` (e.g., `calculations.js`)
- **Data**: `camelCase.js` (e.g., `plans.js`)
- **Styles**: `kebab-case.css` (e.g., `cbb-mix.css`)
- **Tests**: `*.test.js` or `*.test.jsx` (co-located with source)

---

## 🔄 State Management

### Architecture: Context API + useReducer Pattern

The app uses a **centralized state management** via Context API with a reducer pattern:

```javascript
// State structure
{
  cart: {
    items: [],      // Array of { plan, quantity, cbbMixEnabled, cbbMixCount }
    count: 0        // Total quantity across all items
  },
  customer: {
    mobileCost: 0,          // Current monthly mobile spend
    numberOfLines: 1,       // Number of lines needed
    originalItemPrice: 0,   // Product price (e.g., phone)
    existingBrands: []      // Brands customer already has
  },
  streaming: {
    selected: [],   // Array of streaming service IDs
    total: 0        // Total streaming cost
  },
  settings: {
    theme: 'dark',
    cashDiscount: null,
    cashDiscountLocked: false,
    autoAdjust: false,
    showCashDiscount: false,
    freeSetup: false
  },
  ui: {
    activeProvider: 'all',
    searchQuery: '',
    debouncedSearchQuery: '',
    showPresentation: false,
    cbbMixEnabled: {},      // Map of planId -> boolean
    cbbMixCount: {},        // Map of planId -> count (2-8)
    eanSearchResults: null,
    isSearching: false
  }
}
```

### Using State in Components

```javascript
// Read state
import { useAppState } from '../hooks/useAppState';
const state = useAppState();
const { cartItems, customerMobileCost, selectedStreaming } = state;

// Dispatch actions
import { useAppActions } from '../hooks/useAppActions';
const actions = useAppActions();
actions.addToCart(plan);
actions.setMobileCost(500);
actions.toggleStreaming('netflix');
```

### Available Actions
See `src/context/AppContext.jsx` for full list:
- **Cart**: `addToCart`, `removeFromCart`, `updateQuantity`, `setCart`, `clearCart`
- **Customer**: `setMobileCost`, `setNumberOfLines`, `setOriginalItemPrice`, `setExistingBrands`
- **Streaming**: `toggleStreaming`, `setStreaming`, `clearStreaming`
- **Settings**: `setTheme`, `setCashDiscount`, `setAutoAdjust`, `toggleCashDiscount`, `setFreeSetup`
- **UI**: `setActiveProvider`, `setSearchQuery`, `setShowPresentation`, `togglePresentation`, `setCBBMixEnabled`, `setCBBMixCount`
- **Reset**: `resetAll`

### Persistence
State is automatically persisted to **localStorage** via `src/utils/storage.js`:
- Cart items
- Customer data (mobileCost, numberOfLines, originalItemPrice, existingBrands)
- Selected streaming services
- Settings (theme, cashDiscount, etc.)
- UI state is NOT persisted (transient)

---

## 🎨 Styling System

### Modular CSS Architecture
The app uses **vanilla CSS with CSS variables** (no CSS-in-JS, no Tailwind):

```css
/* variables.css */
--primary: #FF7A50;         /* Orange accent */
--success: #10B981;         /* Teal green */
--text-primary: #E2E8F0;    /* Light text (dark theme) */
--glass-bg: rgba(255, 255, 255, 0.05);
--spacing-sm: 0.5rem;
--radius-md: 12px;
```

### CSS File Organization (Total: ~143KB)
1. **components.css**: Component-specific styles (77KB - largest file)
2. **main.css**: Global resets, base styles, typography (18KB)
3. **utilities.css**: Utility classes `.text-center`, `.flex`, `.grid`, etc. (18KB)
4. **variables.css**: All design tokens - colors, spacing, typography, breakpoints (14KB)
5. **compact.css**: Compact mode overrides (6.5KB)
6. **mobile.css**: Mobile-specific overrides (5KB)
7. **cbb-mix.css**: CBB MIX selector styles (2.9KB)
8. **animations.css**: Keyframes, transitions (1.9KB)

### Theming
Dark/light theme via `data-theme` attribute:

```css
[data-theme="dark"] {
  --bg: #0F172A;
  --text-primary: #E2E8F0;
}

[data-theme="light"] {
  --bg: #FFFFFF;
  --text-primary: #1E293B;
}
```

Toggle theme: `actions.toggleTheme(currentTheme)`

### Common CSS Classes
- **Layout**: `.container`, `.grid`, `.flex`, `.section`, `.section-shell`
- **Cards**: `.glass-card`, `.glass-card-no-hover`, `.card`
- **Typography**: `.text-lg`, `.text-xl`, `.text-secondary`, `.font-semibold`
- **Spacing**: `.p-md`, `.m-lg`, `.gap-sm`
- **Utilities**: `.fade-in-up`, `.skeleton`, `.badge`, `.divider`

### Styling New Components
- **Prefer scoped styles** using `<style>` tag in component
- **Use CSS variables** from `variables.css`
- **Follow BEM-like naming** for component-specific classes
- **Mobile-first approach** with min-width media queries

```javascript
// Example component with scoped styles
function MyComponent() {
  return (
    <div className="my-component glass-card">
      <h2 className="my-component__title">Title</h2>
      <style>{`
        .my-component {
          padding: var(--spacing-lg);
        }
        .my-component__title {
          color: var(--primary);
        }
      `}</style>
    </div>
  );
}
```

---

## 🧱 Component Patterns

### Component Structure Guidelines

```javascript
/**
 * ComponentName - Brief description
 * Additional context about what it does
 */

import React, { useMemo, useCallback } from 'react';
import Icon from '../../components/common/Icon';
import COPY from '../../constants/copy';

const ComponentName = React.memo(function ComponentName({ prop1, prop2, onAction }) {
  // 1. Hooks first
  const memoizedValue = useMemo(() => {
    // expensive calculation
  }, [dependencies]);

  const handleAction = useCallback(() => {
    onAction();
  }, [onAction]);

  // 2. Early returns for empty/loading states
  if (!prop1) {
    return <div>Empty state</div>;
  }

  // 3. Main render
  return (
    <div className="component-name glass-card">
      {/* Content */}

      {/* Scoped styles at bottom */}
      <style>{`
        .component-name {
          /* styles */
        }
      `}</style>
    </div>
  );
});

export default ComponentName;
```

### Performance Optimizations
- **React.memo**: Wrap components that receive same props frequently
- **useMemo**: Expensive calculations (e.g., filtering large arrays)
- **useCallback**: Event handlers passed to child components
- **Lazy loading**: All major components lazy loaded in `App.jsx`
- **Code splitting**: Vite handles automatically

### Icon Usage
Custom Icon component uses Unicode emojis:

```javascript
import Icon from '../components/common/Icon';

<Icon name="smartphone" size={24} className="icon-inline" />
<Icon name="cart" size={20} />
<Icon name="check" size={16} />
```

**Available icons**: See `src/components/common/Icon.jsx` glyphMap for full list.

### Component Size Metrics
Key files by line count (as of 2025-11-19):

| Component | Lines | Notes |
|-----------|-------|-------|
| ComparisonPanel.jsx | 2,151 | Largest component - candidate for refactoring |
| calculations.js | 1,494 | Business logic - well tested |
| StreamingSelector.jsx | 1,338 | Streaming selection UI |
| PlanCard.jsx | 958 | Individual plan display |
| PresentationView.jsx | 846 | Presentation mode |
| powerApi.js | 714 | Power.dk API integration |
| App.jsx | 583 | Root component with lazy loading |

**Total codebase**: ~15,000+ lines of JS/JSX across 30+ components

### Accessibility Patterns
- **Semantic HTML**: Use proper tags (`<main>`, `<section>`, `<nav>`, `<button>`)
- **ARIA labels**: `aria-label`, `aria-labelledby`, `aria-describedby`
- **Keyboard navigation**: All interactive elements accessible via keyboard
- **Focus management**: Visible focus indicators (WCAG AA)
- **Screen reader support**: Proper heading hierarchy, skip links

```javascript
// Good example
<button
  onClick={handleClick}
  aria-label="Add plan to cart"
  className="btn-primary"
>
  <Icon name="plus" aria-hidden="true" />
  Add to Cart
</button>

// Skip link pattern
<a href="#main-content" className="skip-link">
  Spring til hovedindhold
</a>
```

---

## 📊 Data Management

### Plans Data (`src/data/plans.js`)

**Current inventory (as of 2025-11-19)**: 24 plans total
- **Telenor**: 8+ mobile plans (5G, family discounts enabled)
- **Telenor B2B**: 5 business plans (VAT excluded pricing)
- **Telmore**: 6+ mobile plans
- **CBB**: Multiple mobile broadband options
- **Bredbånd**: Standalone broadband category with Telmore and Telenor broadband plans

```javascript
{
  id: 'unique-id',               // Required: Unique identifier
  provider: 'telmore' | 'telenor' | 'telenor-b2b' | 'cbb' | 'broadband',
  name: 'Plan navn',             // Required: Display name
  data: '25 GB',                 // Required: Data amount
  price: 299,                    // Required: Monthly price (kr)
  introPrice: 99,                // Optional: Intro price
  introMonths: 6,                // Optional: Intro duration
  earnings: 1000,                // Required: Commission/provision
  features: ['5G', 'EU Roaming'], // Required: Array of features
  type: 'broadband',             // Optional: 'broadband' for mobile broadband
  business: false,               // Optional: true for B2B plans
  priceVatExcluded: false,       // Optional: true if price excludes VAT
  familyDiscount: true,          // Optional: Telenor family discount eligible
  streaming: [],                 // Optional: Array of included streaming IDs
  streamingCount: 2,             // Optional: For CBB MIX (2-8)
  cbbMixAvailable: true,         // Optional: Supports CBB MIX
  color: '#0207b2',              // Optional: Brand color
  logo: '/path/to/logo.png',     // Optional: Logo URL
  availableFrom: '2025-01-01',   // Optional: ISO date string
  expiresAt: '2025-12-31'        // Optional: ISO date string
}
```

### Streaming Services (`src/data/streamingServices.js`)

**Current inventory (as of 2025-11-19)**: 12 streaming services total
- **Main services** (10): Netflix, Viaplay, MAX, TV2 Play, Saxo, Disney+, SkyShowtime, Prime Video, Musik, Nordisk Film+
  - Prices range: 59-149 kr/month
- **CBB MIX exclusive** (2): Podimo, Mofibo
  - Only available as part of CBB MIX bundles

```javascript
{
  id: 'netflix',                 // Required: Unique ID
  name: 'Netflix',               // Required: Display name
  price: 129,                    // Required: Monthly price (kr)
  logo: '/logos/Netflix.png',    // Required: Logo path
  category: 'streaming'          // Required: Category
}
```

**Logo assets**: 18 image files in `/public/logos/` (streaming services + provider logos)

### Date Filtering
Plans are automatically filtered by `availableFrom` and `expiresAt` dates:
- Plans only shown if current date >= `availableFrom`
- Plans hidden if current date > `expiresAt`
- Date comparison uses midnight (00:00:00) for consistency

**Adding a plan:**
1. Add object to `plans` array in `src/data/plans.js`
2. Ensure logo exists in `public/logos/` if using custom logo
3. Test by selecting provider in UI

**Adding a streaming service:**
1. Add object to `streamingServices` array in `src/data/streamingServices.js`
2. Add logo to `public/logos/`
3. Test by toggling in StreamingSelector

---

## 🧪 Testing Strategy

### Test Framework: Vitest + React Testing Library

```bash
npm test              # Run tests in watch mode
npm test:ui           # Open Vitest UI
npm test:coverage     # Generate coverage report
```

### Test File Locations
- Co-located with source: `Cart.jsx` → `Cart.test.jsx`
- Utilities: `src/utils/calculations.test.js`
- Current test files:
  - `src/components/common/Icon.test.jsx`
  - `src/features/cart/Cart.test.jsx`
  - `src/utils/calculations.test.js`
  - `src/utils/logger.test.js`

### Writing Tests

```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Test Coverage Goals
- **Calculations**: 100% coverage (critical business logic) ✅
- **Components**: Focus on user interactions and edge cases
- **Utilities**: Test all public functions

### Current Test Coverage Status
**Tested** (4 files):
- ✅ `calculations.js` - Comprehensive coverage
- ✅ `Icon.jsx` - Basic component tests
- ✅ `Cart.jsx` - Feature tests
- ✅ `logger.js` - Utility tests

**Untested** (notable gaps):
- ⚠️ `ComparisonPanel.jsx` (2,151 lines) - Largest component, no tests
- ⚠️ `StreamingSelector.jsx` (1,338 lines) - Complex component, no tests
- ⚠️ `PlanCard.jsx` (958 lines) - Core component, no tests
- ⚠️ `PresentationView.jsx` - Feature component, no tests
- ⚠️ No integration or E2E tests

**Recommendation**: Prioritize adding tests for core feature components (PlanCard, StreamingSelector, ComparisonPanel)

### What to Test
✅ Business logic (calculations, discounts, pricing)
✅ User interactions (clicks, form inputs)
✅ Conditional rendering
✅ Error states
✅ Accessibility (ARIA, keyboard nav)

❌ Implementation details
❌ Styles/CSS
❌ Third-party libraries

---

## 🔧 Development Workflow

### Setup
```bash
# Clone repository
git clone <repo-url>
cd Power-Abo

# Install dependencies
npm install

# Start dev server (opens http://localhost:3000)
npm run dev
```

### Available Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests in watch mode |
| `npm test:ui` | Open Vitest UI |
| `npm test:coverage` | Generate coverage report |

### Git Workflow
**Branching**: Feature branches from main
- Main branch: Production-ready code
- Feature branches: `claude/feature-name-session-id`
- Commit format: Clear, descriptive messages in Danish

**Deployment**: Automatic via GitHub Actions
- Push to `main` triggers deployment to GitHub Pages
- Build runs tests and linting
- Deploys to `https://issafiras.github.io/Power-Abo/`

### Environment Variables
Create `.env.local` for local development:

```bash
# CORS Proxy API key (optional, for Power.dk API)
VITE_PROXY_CORS_API_KEY=your-api-key
```

**Important**: All environment variables MUST be prefixed with `VITE_` to be accessible in client code.

### Proxy Configuration
Vite dev server proxies Power.dk API to avoid CORS issues:

```javascript
// vite.config.js
proxy: {
  '/api/power': {
    target: 'https://www.power.dk',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/power/, '/api/v2')
  }
}
```

**Usage**: `fetch('/api/power/productlists?q=iphone')` → `https://www.power.dk/api/v2/productlists?q=iphone`

---

## 🔨 Common Tasks

### Adding a New Provider
1. Add plans to `src/data/plans.js` with new provider ID
2. Add logo to `public/logos/`
3. Update provider tabs in `src/features/plans/ProviderTabs.jsx`
4. Test filtering by provider

### Adding a New Discount Rule
1. Update calculation logic in `src/utils/calculations.js`
2. Add tests in `src/utils/calculations.test.js`
3. Update documentation comments
4. Test with various plan combinations

### Adding a New Feature Component
1. Create directory in `src/features/`
2. Add main component: `FeatureName.jsx`
3. Add tests: `FeatureName.test.jsx`
4. Import and integrate in `App.jsx` with lazy loading
5. Add styles (scoped or in `components.css`)

### Updating UI Text
All text is centralized in `src/constants/copy.js`:

```javascript
// src/constants/copy.js
export default {
  titles: {
    selectPlans: 'Vælg mobilabonnementer',
    // ...
  },
  labels: {
    addToCart: 'Tilføj til kurv',
    // ...
  },
  error: {
    noProductsFound: 'Ingen produkter fundet',
    // ...
  }
}
```

Usage: `import COPY from '../constants/copy';` → `{COPY.titles.selectPlans}`

### Adding Keyboard Shortcuts
1. Add handler in `App.jsx` or relevant component
2. Document in README.md
3. Add ARIA label for screen readers

```javascript
useEffect(() => {
  function handleKeyPress(e) {
    if (e.key === 'r' && e.ctrlKey) {
      e.preventDefault();
      actions.resetAll();
    }
  }
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [actions]);
```

---

## 📏 Important Conventions

### Naming Conventions
- **Variables/Functions**: `camelCase` (e.g., `customerMobileCost`, `calculateTotal`)
- **Components**: `PascalCase` (e.g., `PlanCard`, `StreamingSelector`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_LINES`, `DEFAULT_THEME`)
- **CSS classes**: `kebab-case` (e.g., `plan-card`, `btn-primary`)
- **Files**: Match exported entity (e.g., `PlanCard.jsx` exports `PlanCard`)

### Code Style
- **Indentation**: 2 spaces
- **Quotes**: Single quotes for JS, double for JSX attributes
- **Semicolons**: Required (per ESLint config)
- **Line length**: Max 120 characters (soft limit)
- **Comments**: JSDoc for functions, inline for complex logic

### Documentation Standards
Every module and complex function should have a header comment:

```javascript
/**
 * calculateFamilyDiscount - Beregn Telenor familie-rabat
 *
 * Telenor tilbyder 50 kr/md rabat pr. ekstra linje (fra 2. linje).
 *
 * EKSEMPEL:
 * - 3 linjer: (3-1) × 50 kr = 100 kr rabat/md
 * - Over 6 måneder: 100 kr × 6 = 600 kr total rabat
 *
 * @param {Object} plan - Plan objekt med familyDiscount: true
 * @param {number} quantity - Antal linjer (minimum 1)
 * @returns {number} Total familie-rabat over 6 måneder
 */
```

### Import Order
1. React imports
2. Third-party libraries
3. Local components
4. Utils/hooks
5. Data/constants
6. Styles (if any)

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Icon from '../../components/common/Icon';
import { useAppState } from '../../hooks/useAppState';
import { calculateTotal } from '../../utils/calculations';
import { plans } from '../../data/plans';
import COPY from '../../constants/copy';
```

### Error Handling
- **User-facing errors**: Show via Toast component
- **Console errors**: Use `console.error()` with context
- **Validation**: Use `src/utils/validators.js`
- **Defensive programming**: Check for null/undefined before accessing properties

```javascript
try {
  const result = await fetchData();
  if (!result || !Array.isArray(result.data)) {
    throw new Error('Invalid data format');
  }
  processData(result.data);
} catch (error) {
  console.error('Failed to fetch data:', error);
  toast(COPY.error.fetchFailed, 'error');
}
```

---

## ⚡ Performance Optimizations

### Implemented Optimizations
1. **Lazy loading**: All major components via `React.lazy()` and `<Suspense>`
2. **Code splitting**: Vite automatically splits vendor and app bundles
3. **Memoization**: `React.memo`, `useMemo`, `useCallback` on expensive operations
4. **Debouncing**: Search queries debounced at 300ms (`src/utils/optimization.js`)
5. **LocalStorage caching**: Persistent state reduces API calls
6. **CSS optimization**: Minified, code-split CSS in production

### Bundle Size Optimization
Successfully replaced `lucide-react` with custom Icon component:
- **Result**: Reduced bundle size by ~33% and eliminated forwardRef runtime errors
- **Implementation**: All icons now use Unicode emojis via custom glyph mapping in `src/components/common/Icon.jsx`
- **Status**: ✅ Completed - no lucide-react imports in codebase

### Performance Monitoring
- Use React DevTools Profiler for component render analysis
- Chrome DevTools Performance tab for bundle analysis
- Lighthouse for overall performance scoring

### Tips for Maintaining Performance
- ✅ Use `React.memo` for components that receive same props frequently
- ✅ Memoize expensive calculations with `useMemo`
- ✅ Debounce user input handlers (search, filters)
- ✅ Lazy load images with `loading="lazy"`
- ❌ Avoid inline function definitions in render
- ❌ Avoid creating objects/arrays in render (causes re-renders)
- ❌ Don't over-memoize (adds overhead)

---

## ♿ Accessibility Guidelines

### WCAG Compliance
Target: **WCAG AA** (mentioned WCAG AAA for touch targets in README)

### Key Requirements
1. **Semantic HTML**: Use `<button>`, `<nav>`, `<main>`, `<section>`, etc.
2. **ARIA labels**: All interactive elements have accessible names
3. **Keyboard navigation**: Full functionality via keyboard
4. **Focus management**: Visible focus indicators (`:focus-visible`)
5. **Color contrast**: 4.5:1 for text, 3:1 for UI components
6. **Touch targets**: Minimum 44×44px (WCAG AAA)

### Implementation Checklist
- ✅ Skip links for keyboard users
- ✅ Heading hierarchy (h1 → h2 → h3)
- ✅ Alt text for images/logos
- ✅ `aria-label` for icon-only buttons
- ✅ `aria-live` regions for dynamic content (Toast)
- ✅ Proper form labels and error messages
- ✅ Focus trap in modals (PresentationView)

### Example Patterns

```javascript
// Skip link
<a href="#main-content" className="skip-link">
  Spring til hovedindhold
</a>

// Icon-only button
<button
  onClick={handleClick}
  aria-label="Nulstil beregning"
>
  <Icon name="refresh" aria-hidden="true" />
</button>

// Form input
<label htmlFor="mobile-cost">
  Nuværende mobiludgifter
  <input
    id="mobile-cost"
    type="number"
    value={mobileCost}
    onChange={handleChange}
    aria-describedby="mobile-cost-help"
  />
</label>
<span id="mobile-cost-help" className="help-text">
  Indtast kundens samlede månedlige udgifter
</span>
```

### Testing Accessibility
1. **Keyboard**: Tab through entire app without mouse
2. **Screen reader**: Test with NVDA (Windows) or VoiceOver (Mac)
3. **Color blindness**: Use browser extensions to simulate
4. **Axe DevTools**: Browser extension for automated checks
5. **Lighthouse**: Accessibility audit in Chrome DevTools

---

## 🔌 API Integration

### Power.dk API
Used for EAN product search and pricing.

**Endpoints**:
- `/api/v2/productlists?q=<search>`: Search products
- `/api/v2/products/prices?ids=<ids>`: Get prices by product IDs

**Integration**: `src/utils/powerApi.js`

### CORS Handling
**Development**: Vite proxy (see vite.config.js)
**Production**: External CORS proxy or backend relay (see powerApi.js for fallback logic)

### Request Pattern

```javascript
import { searchProducts } from '../utils/powerApi';

async function handleSearch(query) {
  try {
    const results = await searchProducts(query);
    if (results.products && results.products.length > 0) {
      // Process results
    }
  } catch (error) {
    console.error('Search failed:', error);
    toast(COPY.error.searchFailed, 'error');
  }
}
```

### Backend API (Optional)
`src/utils/backendApi.js` provides integration for custom backend (if implemented).

### API Error Handling
- **Network errors**: Show user-friendly toast message
- **Invalid responses**: Validate data structure before use
- **Retry logic**: Implement for transient failures
- **Fallback data**: Use cached/default data when API fails

---

## 🐛 Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| Server won't start | `rm -rf node_modules && npm install` |
| Port 3000 in use | Change `server.port` in vite.config.js |
| Data not persisting | Check browser localStorage, clear cache |
| API CORS errors | Ensure Vite proxy is running (dev mode) |
| Build fails | Run `npm run lint`, fix errors |
| Tests failing | Check test setup in `src/test/setup.js` |
| Icons not showing | Verify Icon component glyph mapping |
| Styles not updating | Clear Vite cache: `rm -rf node_modules/.vite` |

### Debug Mode
Enable verbose logging:

```javascript
// src/utils/logger.js
export const DEBUG = true; // Set to true for verbose logging
```

### Browser DevTools
- **React DevTools**: Inspect component hierarchy, props, state
- **Console**: Check for errors, warnings
- **Network**: Monitor API calls
- **Application > Local Storage**: Inspect persisted data

### Known Limitations
- **EAN search**: Depends on Power.dk API availability
- **Offline mode**: Not supported (requires localStorage)
- **Internet Explorer**: Not supported (uses modern ES6+)
- **Print mode**: Some CSS may not render perfectly in all browsers

---

## 🎓 Learning Resources

### Internal Documentation
- **README.md**: User-facing documentation
- **src/constants/copy.js**: All UI text/labels
- **src/utils/calculations.js**: Business logic with examples
- This file (CLAUDE.md): AI assistant guide

### External Resources
- [React Docs](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Vitest API](https://vitest.dev/api/)
- [React Testing Library](https://testing-library.com/react)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 🚀 Quick Reference Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Production build
npm run preview                # Preview build
npm run lint                   # Lint code

# Testing
npm test                       # Run tests (watch)
npm test:ui                    # Open test UI
npm test:coverage              # Coverage report

# Git
git status                     # Check status
git add .                      # Stage all changes
git commit -m "message"        # Commit
git push -u origin <branch>    # Push to remote

# Troubleshooting
rm -rf node_modules && npm i   # Reinstall deps
rm -rf node_modules/.vite      # Clear Vite cache
npm run lint -- --fix          # Auto-fix lint errors
```

---

## 📝 Notes for AI Assistants

### Context Understanding
1. **Language**: All UI text is in Danish; code comments are mostly Danish
2. **Domain**: Mobile subscription sales tool for retail environment
3. **Users**: Sales advisors in POWER stores (not end consumers)
4. **Business model**: 6-month pricing, intro offers, family discounts, provision tracking

### When Making Changes
- ✅ Follow feature-based structure for new components
- ✅ Use Context API (not prop drilling)
- ✅ Co-locate tests with source files
- ✅ Use CSS variables from `variables.css`
- ✅ Add JSDoc comments for complex functions
- ✅ Maintain accessibility (ARIA, keyboard nav)
- ✅ Test calculations thoroughly (critical business logic)
- ❌ Don't add new dependencies without discussing
- ❌ Don't change calculation logic without tests
- ❌ Don't break existing localStorage format (data migration needed)
- ❌ Don't remove accessibility features

### Before Committing
1. Run `npm run lint` (fix all errors)
2. Run `npm test` (all tests pass)
3. Test manually in browser (especially calculations)
4. Check accessibility (keyboard nav, screen reader)
5. Verify mobile responsiveness
6. Update this file if adding new patterns/conventions

### Communication Style
- Code comments: Danish or English (match existing file)
- Git commits: Danish (match existing commit history)
- Documentation: English (this file) or Danish (README.md)
- UI text: Always Danish (via `COPY` constant)

---

## 🔍 Known Issues and Technical Debt

### High Priority
1. **✅ lucide-react dependency removed**: Bundle size already optimized
   - Successfully eliminated forwardRef runtime errors
   - ~33% bundle size reduction achieved

2. **Test coverage gaps**: Only 4 test files for 30+ components
   - Missing tests for: ComparisonPanel, StreamingSelector, PlanCard, PresentationView
   - No integration or E2E tests
   - Recommendation: Add tests for core feature components

3. **Large component**: ComparisonPanel.jsx (2,151 lines)
   - Candidate for refactoring into smaller components
   - Would improve maintainability and testability

### Medium Priority
4. **CSS file size**: components.css is 77KB
   - Could benefit from further modularization
   - Consider splitting into feature-specific CSS files

5. **✅ Component organization**: CBBMixSelector.jsx moved to features/streaming/
   - Now follows feature-based structure consistently
   - Improved code organization and maintainability

### Low Priority
6. **TypeScript config present but unused**
   - tsconfig.json exists but project uses .js/.jsx
   - Either adopt TypeScript or remove config
   - Current setup is for IDE intellisense only

### Recent Improvements (Completed)
✅ Refactored to feature-based structure (commit ae967e4)
✅ Removed unused HelpButton component (commit 82f368d)
✅ Cleaned up documentation files (commit bfd2de6)
✅ Replaced lucide-react imports with custom Icon component
✅ Simplified Vite build configuration

### Health Score: 8.5/10
The codebase is well-organized with good patterns and documentation. Main areas for improvement are test coverage and component refactoring.

---

**End of CLAUDE.md** | Last updated: 2025-11-19

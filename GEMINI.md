# POWER ABO BEREGNER - PROJECT CONTEXT & ARCHITECTURE

## 🎯 Project Overview
**Power Abo Beregner** is a specialized sales tool designed for POWER store employees. It calculates the optimal combination of mobile subscriptions, broadband, and streaming services to demonstrate savings and total cost of ownership (TCO) to customers.

**Current Version:** 2.3.0 (Local Standalone)

## 🛠 Tech Stack
- **Framework:** React 18
- **Language:** JavaScript + TypeScript (Calculations)
- **Build Tool:** Vite 5
- **State Management:** React Context API + `useReducer`
- **Animation:** Framer Motion
- **Persistence:** LocalStorage (No backend/database)
- **Styling:** CSS Variables (Theming), Modular CSS, "Clean Retail" Aesthetic
- **Icons:** Lucide React
- **Utilities:** `react-qr-code` (Sharing), `lz-string` (Compression logic ready)

## 🏗 Architecture & Data Flow

### 1. No Backend (Supabase Removed)
- The project previously used Supabase but has been refactored to be **100% client-side**.
- **Data Source:** `src/data/plans.js` contains all subscription plans (Telmore, Telenor, CBB).
- **Persistence:** All user sessions, cart state, and settings are saved in `localStorage` via `src/utils/storage.js`.

### 2. State Management (`AppContext`)
- Centralized state in `src/context/AppContext.jsx`.
- **Key State Slices:**
  - `cart`: Selected plans.
  - `customer`: User inputs (current costs, number of lines, existing brands, **buybackAmount**).
  - `streaming`: Selected streaming services.
  - `ui`: Search queries, modal states.

### 3. Calculation Engine (`src/utils/calculations/`)
- **TypeScript:** Core logic migrated to TypeScript for precision.
- **`pricing.ts`**: Core logic for:
  - 6-month TCO calculations.
  - Intro prices vs. normal prices.
  - Family discounts (Telenor logic: -50kr for lines > 1).
  - **Effective Hardware Price:** `(Hardware Price) - (Savings) - (Buyback)`.
- **`streaming.ts`**: Logic for CBB MIX bundling (2-8 services) and cost optimization.

## 🔑 Key Features

### 🛒 Subscription Calculator
- **ProviderTabs:** Filters plans by provider (Telmore, Telenor, CBB, Broadband).
- **Auto-Bundling:** Automatically enables CBB MIX prices when compatible plans + streaming are selected.
- **Smart Engine:** Prioritizes strongest offers and calculates smart combinations.

### 📱 Hardware TCO & RePOWER
- **Input:** "Varens pris inden rabat" (Original Price).
- **RePOWER:** "Indbytning" input field. This value is treated as an immediate cash discount.
- **Calculation:** Shows the customer the "Real" price of the phone after 6 months of subscription savings + trade-in value.

### 🔗 QR Sharing
- **Mechanism:** State is serialized to JSON -> Base64 encoded -> Appended to URL (`?offer=...`).
- **Component:** `ShareModal.jsx` generates a QR code for the current URL.
- **Loading:** `AppContext` checks for `?offer=` on mount and hydrates state if found.

### 📊 Presentation Mode
- A simplified, high-contrast view (`PresentationView.jsx`) designed for the customer-facing screen/tablet.
- Hides internal tools/complexity.

## 🎨 Design System & UI Guidelines

### "Modern Retail" Aesthetic
- **Variables:** `src/styles/variables.css`.
- **Colors:**
  - Primary: POWER Orange (`#FF6D1F`).
  - Backgrounds: Dark Mode default (`#000000`, `#1C1C1E`).
- **Components:**
  - **Glass Cards:** High saturation backdrop blur.
  - **Buttons:** Pill-shaped, tactile feedback (`scale(0.96)` on click).
  - **Animations:** Fluid transitions with Framer Motion.

### Rules for UI Changes
1.  **Do NOT** introduce new heavy CSS frameworks (Tailwind, Bootstrap). Use existing CSS modules.
2.  **Keep it Fast:** Use `React.memo` on heavy components (`ComparisonPanel`, `StreamingSelector`).
3.  **Mobile First:** Ensure touch targets are >44px.

## 📂 File Structure Highlights

```
src/
├── components/
│   ├── common/       # Generic UI (Icon, Modal, ShareModal)
│   ├── layout/       # Header, Footer
│   └── ui/           # Buttons, Inputs
├── context/          # AppContext, ActionTypes
├── data/             # STATIC DATA (plans.js, streamingServices.js)
├── features/
│   ├── admin/        # Local Admin Dashboard (Edit prices locally)
│   ├── comparison/   # The main calculation view
│   │   └── tabs/     # Overview, Breakdown, Streaming tabs
│   ├── streaming/    # Streaming grid selector
│   └── plans/        # Plan cards and tabs
├── hooks/            # useAppState, useAppActions
├── styles/           # variables.css, main.css, components.css
└── utils/            # calculations/ (TypeScript), storage.js, share.js, powerApi.js
```

## 📝 Recent Changelog (v2.3.0)
1.  **Brain & Beauty Update:** Improved calculation engine and premium design overhaul.
2.  **TypeScript Migration:** Core calculation logic moved to TS.
3.  **Framer Motion:** Added fluid animations and interactive elements.
4.  **Data Update:** CBB earnings and product cleanup.
5.  **Docs:** Added `GEMINI.md` (this file) and `CHANGELOG.js`.

## 🔮 Future Roadmap / Known Limitations
- **Admin Persistence:** Changes made in the Admin Dashboard currently reset on reload (as they modify in-memory variables). A future feature could be "Export/Import JSON config".
- **Hardware API:** The Power.dk API proxy (`powerApi.js`) is implemented but mostly used for EAN search. RePOWER pricing is manual input.

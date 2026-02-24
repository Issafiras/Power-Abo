# ⚡ Power Abo Beregner

> **Salgsværktøj til POWER-medarbejdere** — Beregn den optimale kombination af mobilabonnementer, bredbånd og streamingtjenester for kunder.

![Version](https://img.shields.io/badge/version-2.3.0-orange)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![License](https://img.shields.io/badge/license-Private-red)

---

## 📋 Indhold

- [Funktioner](#-funktioner)
- [Kom i gang](#-kom-i-gang)
- [Projektstruktur](#-projektstruktur)
- [Teknologi](#-teknologi)
- [Tastatur-genveje](#-tastatur-genveje)
- [Scripts](#-scripts)
- [Data & Priser](#-data--priser)
- [Deling via QR-kode](#-deling-via-qr-kode)
- [Design System](#-design-system)
- [Test](#-test)
- [Deployment](#-deployment)
- [Bidrag & Kodestil](#-bidrag--kodestil)

---

## ✨ Funktioner

### 🛒 Abonnementsberegner
- **Multi-udbyder sammenligning** — Telenor, Telmore, CBB og bredbånd
- **6-måneders TCO** — Beregner totalomkostninger inkl. intro-priser og normalpriser
- **Familierabat** — Automatisk Telenor familierabat (-50 kr/md pr. ekstra linje)
- **Smart Engine** — Finder den bedste kombination automatisk
- **EAN-søgning** — Søg produkter direkte via Power.dk API

### 📺 Streaming & CBB MIX
- **12+ streamingtjenester** — Netflix, Disney+, MAX, Viaplay, TV2 Play m.fl.
- **CBB MIX bundling** — Automatisk bundling af 2-8 tjenester til MIX-pris
- **Prisoptimering** — Viser besparelse ved at vælge MIX-pakker

### 📱 Hardware TCO & RePOWER
- **Effektiv hardware-pris** — Beregner reel pris efter abonnementsbesparelse + indbytning
- **RePOWER indbytning** — Indtast indbytningsværdi som øjeblikkelig rabat
- **Kontantrabat** — Valgfri kontantrabat med auto-justering

### 🎤 Præsentationsvisning
- **Kundevendt visning** — Højkontrast, store tal, optimeret til storskærm/tablet
- **Print-funktion** — Udskriv tilbuddet direkte
- **"Næste kunde"-knap** — Nulstil og start forfra

### 🔗 QR-deling
- **Del tilbud** — Generér QR-kode med det aktuelle tilbud
- **URL-baseret** — Tilbuddet gemmes i URL'en og kan åbnes direkte

### 🎨 Design & UX
- **Dark mode** som standard med POWER-temafarver
- **Glasmorfisme & animationer** med Framer Motion
- **Mobiloptimeret** — Touch targets ≥44px, swipe-gestures, bottom sheet
- **Tilgængeligt** — WCAG AA, skip-links, ARIA-labels, keyboard-navigation

---

## 🚀 Kom i gang

### Forudsætninger
- [Node.js](https://nodejs.org/) v18 eller nyere
- npm (medfølger Node.js)

### Installation

```bash
# Klon repository
git clone https://github.com/Issafiras/Power-Abo.git
cd Power-Abo

# Installér dependencies
npm install

# Start udviklingsserver
npm run dev
```

Åbn [http://localhost:3000](http://localhost:3000) i browseren.

### Miljøvariabler (valgfrit)

Opret `.env.local` for lokale indstillinger:

```bash
# CORS Proxy API-nøgle (valgfri, til Power.dk API)
VITE_PROXY_CORS_API_KEY=din_api_nøgle
```

> **Bemærk:** Alle miljøvariabler skal prefixes med `VITE_` for at være tilgængelige i klienten.

---

## 📁 Projektstruktur

```
Power-Abo/
├── public/
│   ├── logos/                   # Udbyder- og streaming-logoer
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── common/              # Genbrugelige (Icon, Toast, Modal, Tooltip)
│   │   ├── layout/              # Header, Footer
│   │   ├── mobile/              # BottomSheet
│   │   ├── results/             # AnimatedCounter, ComparisonChart
│   │   └── ui/                  # Button, Card, Input
│   ├── context/
│   │   └── AppContext.jsx       # Central state management
│   ├── data/
│   │   ├── plans.js             # Alle mobilabonnementer og bredbånd
│   │   └── streamingServices.js # Alle streamingtjenester
│   ├── features/
│   │   ├── cart/                # Indkøbskurv
│   │   ├── comparison/          # Sammenligningspanel
│   │   ├── plans/               # Plan-kort og udbyder-faner
│   │   ├── presentation/        # Præsentationsvisning
│   │   └── streaming/           # Streaming-vælger
│   ├── hooks/                   # useAppState, useAppActions
│   ├── constants/               # UI-tekster (copy.js)
│   ├── styles/                  # CSS-variabler, globale styles
│   ├── utils/
│   │   ├── calculations/        # TypeScript beregningsmotor
│   │   ├── storage.js           # localStorage hjælpere
│   │   └── powerApi.js          # Power.dk API integration
│   ├── App.jsx                  # Rod-komponent
│   └── main.jsx                 # Indgangspunkt
├── .github/workflows/
│   └── deploy.yml               # GitHub Pages deployment
├── GEMINI.md                    # AI-kontekstfil
├── package.json
├── vite.config.js
├── vitest.config.js
└── tsconfig.json
```

---

## 🛠 Teknologi

| Kategori | Teknologi |
|----------|-----------|
| **Framework** | React 18 |
| **Sprog** | JavaScript (JSX) + TypeScript (beregninger) |
| **Build** | Vite 5 |
| **State** | React Context API + `useReducer` |
| **Animation** | Framer Motion |
| **Styling** | CSS Variables + modulær CSS |
| **QR-kode** | `react-qr-code` |
| **Test** | Vitest + React Testing Library |
| **Deployment** | GitHub Pages via GitHub Actions |
| **Persistence** | localStorage (ingen backend) |

---

## ⌨️ Tastatur-genveje

| Genvej | Handling |
|--------|---------|
| `P` | Toggle præsentationsvisning |
| `Ctrl + R` | Nulstil alt |
| `←` / `→` | Naviger wizard-steps |
| `Tab` | Standard keyboard-navigation |
| `Escape` | Luk modal/præsentation |

---

## 📜 Scripts

```bash
npm run dev          # Start udviklingsserver (port 3000)
npm run build        # Byg til produktion (dist/)
npm run preview      # Preview produktionsbuild
npm run lint         # Kør ESLint
npm test             # Kør tests (watch mode)
npm run test:ui      # Åbn Vitest UI
npm run test:coverage # Generér coverage-rapport
```

---

## 📊 Data & Priser

### Abonnementer (`src/data/plans.js`)

Alle planer defineres som objekter med følgende felter:

| Felt | Type | Beskrivelse |
|------|------|-------------|
| `id` | `string` | Unikt ID |
| `provider` | `string` | `telmore`, `telenor`, `cbb`, `broadband` |
| `name` | `string` | Visningsnavn |
| `price` | `number` | Månedspris (kr) |
| `introPrice` | `number?` | Introduktionspris |
| `introMonths` | `number?` | Antal intro-måneder |
| `earnings` | `number` | Provision/indtjening |
| `features` | `string[]` | Funktioner (5G, EU Roaming, etc.) |
| `familyDiscount` | `boolean?` | Telenor familierabat |
| `cbbMixAvailable` | `boolean?` | CBB MIX support |

### Streamingtjenester (`src/data/streamingServices.js`)

12+ tjenester inkl. Netflix, Disney+, MAX, Viaplay, TV2 Play, SkyShowtime, Prime Video m.fl.

### Opdatering af data

1. Rediger det relevante objekt i `src/data/plans.js` eller `src/data/streamingServices.js`
2. Tilføj evt. nyt logo i `public/logos/`
3. Genindlæs appen — ændringer træder i kraft med det samme

---

## 🔗 Deling via QR-kode

1. Konfigurér tilbuddet (vælg abonnement, streaming, kundedata)
2. Klik **Del tilbud** i toppen
3. En QR-kode genereres med hele tilbuddet encoded i URL'en
4. Kunden scanner QR-koden og ser præcis det samme tilbud

**Teknisk:** State → JSON → Base64 → URL-parameter (`?offer=...`)

---

## 🎨 Design System

### Farver

| Token | Værdi | Brug |
|-------|-------|------|
| `--primary` | `#FF7A50` | POWER-orange, CTA-knapper |
| `--success` | `#10B981` | Besparelser, positive tal |
| `--bg` | `#0F172A` | Baggrund (dark mode) |
| `--text-primary` | `#E2E8F0` | Primær tekst |
| `--glass-bg` | `rgba(255,255,255,0.05)` | Glaskort |

### Komponenter

- **Glass Cards** — Halvgennemsigtige kort med backdrop-blur
- **Pill Buttons** — Afrundede knapper med taktil feedback (`scale(0.96)`)
- **Animated Counter** — Talanimation til besparelser

### CSS-filer

| Fil | Indhold |
|-----|---------|
| `variables.css` | Design tokens (farver, spacing, typografi) |
| `main.css` | Globale styles og reset |
| `components.css` | Komponent-specifikke styles |
| `animations.css` | Keyframes og transitions |
| `mobile.css` | Mobilspecifikke overrides |

---

## 🧪 Test

```bash
# Kør alle tests
npm test

# Med coverage
npm run test:coverage
```

### Testede moduler
- ✅ `calculations.js` — Beregningslogik (23 tests)
- ✅ `Icon.jsx` — Ikon-komponent (4 tests)
- ✅ `Cart.jsx` — Kurv-komponent (2 tests)
- ✅ `logger.js` — Logging utility

### Test-konventioner
- Testfiler placeres ved siden af kildefilen: `Component.test.jsx`
- Framework: Vitest + React Testing Library + jsdom
- Fokus på business logic og brugerinteraktioner

---

## 🚢 Deployment

Appen deployes automatisk til **GitHub Pages** ved push til `main`:

```
https://issafiras.github.io/Power-Abo/
```

### Workflow
1. Push til `main` → GitHub Actions trigger
2. `npm install` → `npm run build` → Deploy `dist/`
3. Tilgængelig på GitHub Pages inden for 2-3 minutter

---

## 🤝 Bidrag & Kodestil

### Kodestil
- **Indrykning:** 2 spaces
- **Komponenter:** PascalCase (f.eks. `PlanCard.jsx`)
- **Utilities:** camelCase (f.eks. `calculations.js`)
- **CSS:** kebab-case (f.eks. `glass-card`)
- **Commits:** `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`

### Regler
1. **Ingen nye CSS-frameworks** — Brug eksisterende CSS-moduler
2. **Performance first** — Brug `React.memo` på tunge komponenter
3. **Mobile first** — Touch targets ≥44px
4. **Centraliseret tekst** — Al UI-tekst i `src/constants/copy.js`

### Tilføj ny plan
1. Tilføj objekt i `src/data/plans.js`
2. Tilføj evt. logo i `public/logos/`
3. Test i UI

### Tilføj ny streamingtjeneste
1. Tilføj objekt i `src/data/streamingServices.js`
2. Tilføj logo i `public/logos/`
3. Test i StreamingSelector

---

## 📝 Changelog

Se nyeste ændringer i **v2.3.0 (Brain & Beauty Update)**:
- 🧠 TypeScript beregningsmotor
- 🎨 Premium design med Framer Motion animationer
- 📱 Forbedret mobiloplevelse
- 📊 Opdateret CBB data og produkter
- ♿ Forbedret tilgængelighed (WCAG AA)

---

<p align="center">
  Lavet med ❤️ til POWER Danmark
</p>

# Power Abo Beregner

Et intelligent rådgivningsværktøj der transformerer kompleksiteten ved at kombinere mobilabonnementer, mobil bredbånd og streaming-tjenester til en enkel, præcis beregning. Designet til POWER-butikker der ønsker at levere overlegen kunderådgivning gennem teknologi.

## Vision

At gøre det muligt for enhver rådgiver at levere præcis, datadrevet rådgivning på sekunder - ikke minutter. Ved at automatisere komplekse beregninger og sammenligninger frigiver vi tid til det, der virkelig betyder noget: menneskelig interaktion og kundeservice.

## 🚀 Nye Features (2025)

Alle opgaver fra redesign-projektet er gennemført (100% completion):
- ✅ Design system med Inter typography og forbedret farvepalette
- ✅ Professionelle ikoner og animations
- ✅ Step wizard system med localStorage persistence
- ✅ Mobile optimization (WCAG AAA compliance)
- ✅ Performance optimeringer (33% bundle reduktion)
- ✅ Presentation mode med print og keyboard shortcuts
- ✅ Test framework med 29 tests

## Teknologi

Bygget med React 18 og Vite 5 for optimal performance og udvikleroplevelse. Moderne web-teknologi der leverer øjeblikkelig responsivitet og en sømløs brugeroplevelse på alle enheder.

**Kerneteknologier:**
- React 18 med hooks og moderne patterns
- Vite 5 for hurtig udvikling og optimeret builds
- Framer Motion for smooth animationer
- Lucide React for professionelle ikoner
- React Hot Toast for brugernotifikationer
- Modulært CSS med CSS variabler for fleksibel theming
- LocalStorage integration for persistering af brugerdata
- Power.dk API integration for real-time priser
- Vitest for test coverage

## Hurtig Start

### Forudsætninger

- Node.js 18 eller nyere
- npm eller yarn

### Installation

```bash
git clone <repository-url>
cd Power-Abo-2
npm install
```

### Udviklingsserver

```bash
npm run dev
```

Applikationen åbner automatisk på `http://localhost:3000`

## Funktioner

### 🎨 Design & UX (Apple-niveau polish)
- **Inter font stack** for moderne, professionel typography
- **Forbedret farvepalette** med subtil orange (#FF7A50) og teal success states (#10B981)
- **Animeret brugeroplevelse** med framer-motion (entrance animations, hover effects, transitions)
- **Professionelle ikoner** fra Lucide React (erstatter emojis)
- **Smooth micro-interactions** på alle interaktive elementer

### 📱 Mobile Optimization
- **WCAG AAA touch targets** (44x44px minimum)
- **Sticky header** med smooth scroll detection
- **Bottom sheet pattern** for mobile-first interaktioner
- **Swipe gestures** på streaming-tjenester
- **Safe area support** for iOS notch
- **Responsive design** med optimal spacing for thumbs

### ⚡ Performance
- **Lazy loading** af alle komponenter (33% bundle size reduktion)
- **React.memo** på alle store komponenter
- **Code splitting** for bedre initial load time
- **Debounced search** inputs (300ms delay)
- **Performance utilities** for throttling og debouncing

### 🧙 Step Wizard System
- **4-step flow**: Kundens Situation → Mobiludgifter → Streaming-tjenester → Resultat
- **Progress indicator** med visuel feedback
- **Keyboard navigation** (Arrow keys) mellem steps
- **LocalStorage persistence** - fortsæt hvor du slap
- **Animated transitions** mellem steps

### 🎯 Smart Features
- **Tooltips** med forklarende information (@radix-ui/react-tooltip)
- **"Why This Solution?"** komponent med dynamiske reasons
- **Social proof**: "Baseret på 500+ kunder med lignende behov"
- **Auto-scroll** til resultat efter beregning

### 📊 Presentation Mode
- **Fullscreen præsentation** med større fonts (4rem → 8rem)
- **Print funktionalitet** til PDF generering
- **"Næste kunde"** knap til reset
- **Keyboard shortcuts** (P for toggle, ESC for close)
- **Animated entrance** med slide-in-from-bottom

### ♿ Accessibility
- **ARIA labels** på alle interaktive elementer
- **Keyboard navigation** med skip links
- **Forbedrede focus indicators** (WCAG AA compliance)
- **Screen reader support** med semantisk HTML
- **Error boundary** for graceful error handling

### 🧪 Testing
- **Vitest framework** opsat med React Testing Library
- **29 tests** dækkende kritiske funktioner (calculations, Icon, Cart)
- **Test scripts**: `npm test`, `npm test:ui`, `npm test:coverage`

### Abonnementer og Bredbånd

Applikationen håndterer komplekse scenarier med elegance:

- **Telmore**: Privat planer med intro-priser og familie-rabatter
- **Telenor**: Privat, B2B og bredbånd planer med avancerede rabatstrukturer
- **CBB**: Mobilabonnementer og CBB MIX pakker (2-8 streaming tjenester)
- **Mobil bredbånd**: Telmore 5G og Telenor Fri Data support

Intelligent søgning og filtrering sikrer, at relevante planer vises øjeblikkeligt. Auto-match funktionalitet identificerer automatisk planer der inkluderer valgte streaming-tjenester.

### Streaming Tjenester

Multi-select interface med real-time prisberegning. CBB MIX selector gør det muligt at kombinere 2-8 tjenester i én pakke.

**Understøttede tjenester:**
Netflix, Disney+, MAX, Viaplay, TV2 Play, Prime Video, SkyshowTime, Podimo, Mofibo, Nordisk Film+, Saxo, Telenor Play

### Rådgivning og Beregning

- Kontant rabat med intelligent auto-justering
- Præsentationsvisning (F11 fullscreen mode) til kundemøder
- Indtjeningsoversigt med provision per plan
- Besparelsesberegning der sammenligner kundens nuværende omkostninger med nye planer
- Sammenligningspanel der viser forskelle mellem planer på et øjeblik
- Antal linjer support med automatisk beregning af familie-rabatter

### Keyboard Shortcuts

Designet for effektivitet:

- `Ctrl + R` → Nulstil beregning
- `Ctrl + P` → Præsentationsvisning (fullscreen)
- `Ctrl + T` → Toggle dark/light mode
- `Esc` → Luk modal/overlay
- `F11` → Fullscreen præsentationsvisning

## Projektstruktur

```
Power-Abo-2/
├── public/
│   ├── logos/              # Streaming service logoer
│   └── favicon.ico
├── src/
│   ├── components/         # React komponenter
│   │   ├── Cart.jsx
│   │   ├── CBBMixSelector.jsx
│   │   ├── ComparisonPanel.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── PlanCard.jsx
│   │   ├── PresentationView.jsx
│   │   ├── ProviderTabs.jsx
│   │   └── StreamingSelector.jsx
│   ├── data/
│   │   ├── plans.js       # Mobilabonnementer & bredbånd
│   │   └── streamingServices.js  # Streaming tjenester
│   ├── styles/            # Modulært CSS
│   │   ├── animations.css
│   │   ├── cbb-mix.css
│   │   ├── compact.css
│   │   ├── components.css
│   │   ├── main.css
│   │   ├── utilities.css
│   │   └── variables.css
│   ├── utils/
│   │   ├── backendApi.js  # Backend integration
│   │   ├── calculations.js  # Beregningslogik
│   │   ├── powerApi.js    # Power.dk API integration
│   │   ├── storage.js     # localStorage utilities
│   │   └── validators.js  # Validering
│   ├── App.jsx            # Hovedkomponent
│   └── main.jsx           # Entry point
├── index.html
├── vite.config.js         # Vite konfiguration
└── package.json
```

## Scripts

| Script | Beskrivelse |
|--------|-------------|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build til `dist/` |
| `npm run preview` | Preview production build lokalt |
| `npm run lint` | ESLint check |
| `npm test` | Kør tests (watch mode) |
| `npm test:ui` | Test UI interface |
| `npm test:coverage` | Kør tests med coverage report |

## Konfiguration

### Miljøvariabler

Opret en `.env.local` fil i projektets rod:

```bash
# CORS Proxy API nøgle (valgfrit)
VITE_PROXY_CORS_API_KEY=your-api-key
```

## Data Vedligeholdelse

### Tilføj ny plan (`src/data/plans.js`)

```javascript
{
  id: 'unique-id',
  provider: 'telmore' | 'telenor' | 'telenor-b2b' | 'cbb' | 'broadband',
  name: 'Plan navn',
  data: '25 GB',
  price: 299,
  introPrice: 99,      // Valgfrit
  introMonths: 6,      // Valgfrit
  earnings: 1000,      // Provision
  features: ['5G', 'EU Roaming'],
  type: 'broadband',   // Valgfrit (for bredbånd)
  business: false,     // Valgfrit (for B2B)
  priceVatExcluded: false,  // Valgfrit (for B2B)
  familyDiscount: true,  // Valgfrit
  streaming: [],       // Array af streaming service IDs
  streamingCount: 2,   // Valgfrit (for CBB MIX pakker)
  color: '#0207b2',    // Valgfrit (brand farve)
  logo: '/path/to/logo.png'  // Valgfrit
}
```

### Tilføj streaming tjeneste (`src/data/streamingServices.js`)

```javascript
{
  id: 'netflix',
  name: 'Netflix',
  price: 129,
  logo: '/logos/Netflix.png',
  category: 'streaming'
}
```

## Power.dk API Integration

Applikationen henter hardwarepriser fra Power.dk via en intelligent proxy-løsning. Vite dev server fungerer som proxy, hvilket eliminerer CORS-problemer under udvikling.

**Vite Proxy:**
- Automatisk konfigureret i `vite.config.js`
- Endpoint: `/api/power/*` → `https://www.power.dk/api/v2/*`

**Eksterne CORS Proxy (valgfrit):**
- Fallback løsning hvis Vite proxy fejler
- Se `src/utils/powerApi.js` for proxy-rotation og fallback logik

**API Endpoints:**
- Produktsøgning: `/api/v2/productlists?q=<term>`
- Prisopslag: `/api/v2/products/prices?ids=<ids>`

## Deployment

### Vercel (Anbefalet)

```bash
npm i -g vercel
vercel
```

**Miljøvariabler i Vercel:**
- Tilføj alle `VITE_*` variabler i Vercel dashboard
- Build command: `npm run build`
- Output directory: `dist`

### GitHub Pages

```bash
npm run build
# Deploy dist/ til gh-pages branch
# Bemærk: Base path er sat til '/Power-Abo/' i vite.config.js
```

### Netlify

```bash
# Build command: npm run build
# Publish directory: dist
# Base directory: /
```

## Troubleshooting

| Problem | Løsning |
|---------|---------|
| Server starter ikke | `rm -rf node_modules && npm install` |
| Port 3000 optaget | Ændr port i `vite.config.js` server.port |
| Data gemmes ikke | Tjek browser localStorage, clear cache |
| API fejler | Se konsol for proxy-fejl, bruger cached/prisdata som fallback |
| Build fejler | Tjek for syntax fejl, kør `npm run lint` |

## Styling

Modulært CSS arkitektur med CSS variabler for theming gør det muligt at tilpasse applikationen uden at kompromittere vedligeholdeligheden.

- `variables.css` - Farver, spacing, breakpoints
- `main.css` - Global styling
- `components.css` - Komponent styling
- `utilities.css` - Utility klasser
- `animations.css` - Animationer og transitions
- `cbb-mix.css` - CBB MIX specifik styling
- `compact.css` - Compact mode styling

**Dark/Light Mode:**
- Automatisk detection baseret på system preference
- Manuelt toggle via `Ctrl + T` eller header knap
- Gemmes i localStorage

## Data Flow

1. **Initial Load:**
   - Bruger lokale datafiler (`src/data/*.js`)
   - Cache i localStorage for hurtigere load

2. **Beregning:**
   - Bruger valgte planer og streaming tjenester
   - Beregner total pris, besparelse og provision
   - Opdaterer cart og sammenligningspanel

3. **Persistens:**
   - Alle valg gemmes i localStorage
   - Auto-save ved hver ændring
   - Reset funktion til at nulstille alt

## Sikkerhed

- **API Keys:** Aldrig commit til git (brug `.env.local`)
- **CORS:** Håndteret via Vite proxy eller eksterne proxyer
- **LocalStorage:** Ingen følsomme data gemmes

## Licens

Intern brug i POWER-butikker. Kontakt udviklerteamet for support.

## Bidrag

1. Opret en feature branch
2. Commit dine ændringer
3. Push til branch
4. Opret Pull Request

## Support

For spørgsmål eller problemer, kontakt udviklerteamet.

---

**Version v1.2 (2025)** – Med mobil bredbånd support

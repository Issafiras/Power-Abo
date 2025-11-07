# ⚡ Power Abo Beregner

Rådgivningsværktøj til POWER-butikker der kombinerer mobilabonnementer, **mobil bredbånd** og streaming-tjenester i én samlet beregning.

**Tech stack:** React 18 + Vite 5 • Supabase • Dark/Light mode • Responsiv design

## 🚀 Quick Start

### Forudsætninger
- Node.js 18+ og npm
- (Valgfrit) Supabase projekt til datahåndtering

### Installation

```bash
# Klon repository
git clone <repository-url>
cd Power-Abo-4

# Installer dependencies
npm install

# Opsæt miljøvariabler (valgfrit)
cp .env.example .env.local
# Rediger .env.local og tilføj dine Supabase credentials
```

### Kør udviklingsserver

```bash
npm run dev
```

Åbner automatisk på `http://localhost:3000`

**Admin panel:** `http://localhost:3000/admin` (eller `/VITE_ADMIN_SLUG` hvis sat)

## ✨ Features

### Abonnementer & Bredbånd
- **Telmore**: Privat planer med intro-priser og familie-rabatter
- **Telenor**: Privat, B2B og bredbånd planer
- **CBB**: Mobilabonnementer og CBB MIX pakker (2-8 streaming tjenester)
- **Mobil bredbånd**: Telmore 5G, Telenor Fri Data support
- Smart søgning og filtrering af planer
- Auto-match med inkluderede streamingtjenester

### Streaming Tjenester
- Multi-select grid med real-time priser
- CBB MIX selector (2-8 tjenester)
- Auto-match med inkluderede streamingtjenester i planer
- Understøttede tjenester:
  - Netflix, Disney+, MAX, Viaplay, TV2 Play
  - Prime Video, SkyshowTime, Podimo, Mofibo
  - Nordisk Film+, Saxo, Telenor Play

### Rådgivning & Beregning
- Kontant rabat med auto-justering
- Præsentationsvisning (F11 fullscreen mode)
- Indtjeningsoversigt (provision per plan)
- Besparelsesberegning (kunde vs. nuværende)
- Sammenligningspanel mellem planer
- Antal linjer support (familie-rabatter)

### Keyboard Shortcuts
- `Ctrl + R` → Nulstil hele beregningen
- `Ctrl + P` → Præsentationsvisning (fullscreen)
- `Ctrl + T` → Toggle dark/light mode
- `Esc` → Luk modal/overlay
- `F11` → Fullscreen præsentationsvisning

### Admin Panel
- Administrer planer og streaming tjenester
- Opdater priser og konfiguration
- Se statistik og logs (hvis Supabase er konfigureret)

## 📁 Projektstruktur

```
Power-Abo-4/
├── public/
│   ├── logos/              # Streaming service logoer
│   └── favicon.ico
├── src/
│   ├── components/         # React komponenter
│   │   ├── AdminPanel.jsx
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
│   ├── pages/
│   │   └── AdminPage.jsx
│   ├── styles/            # Modulært CSS
│   │   ├── animations.css
│   │   ├── cbb-mix.css
│   │   ├── compact.css
│   │   ├── components.css
│   │   ├── main.css
│   │   ├── utilities.css
│   │   └── variables.css
│   ├── utils/
│   │   ├── adminApi.js    # Admin API funktioner
│   │   ├── backendApi.js  # Backend/Supabase integration
│   │   ├── calculations.js  # Beregningslogik
│   │   ├── powerApi.js    # Power.dk API integration
│   │   ├── storage.js     # localStorage utilities
│   │   ├── supabaseClient.js  # Supabase klient
│   │   ├── supabaseData.js    # Supabase data håndtering
│   │   └── validators.js  # Validering
│   ├── App.jsx            # Hovedkomponent
│   └── main.jsx           # Entry point
├── scripts/
│   └── seedSupabase.mjs   # Seed script til Supabase
├── supabase/
│   └── schema.sql         # Database skema
├── admin.html             # Admin panel entry point
├── index.html             # Hovedapplikation entry point
├── vite.config.js         # Vite konfiguration
└── package.json
```

## 🔧 Scripts

| Script | Beskrivelse |
|--------|-------------|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build til `dist/` |
| `npm run preview` | Preview production build lokalt |
| `npm run lint` | ESLint check |

## ⚙️ Konfiguration

### Miljøvariabler

Opret en `.env.local` fil i projektets rod:

```bash
# Supabase (valgfrit - appen virker uden)
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Admin panel slug (valgfrit, default: 'admin')
VITE_ADMIN_SLUG=admin

# CORS Proxy API nøgle (valgfrit)
VITE_PROXY_CORS_API_KEY=your-api-key
```

### Supabase Setup

Se `SUPABASE_SETUP.md` for detaljerede instruktioner om database opsætning.

**Hurtig opsætning:**
1. Opret et Supabase projekt
2. Kør SQL fra `supabase/schema.sql` i SQL editor
3. Tilføj credentials til `.env.local`
4. (Valgfrit) Kør `scripts/seedSupabase.mjs` for at seede data

**Bemærk:** Applikationen virker fint uden Supabase - den bruger lokale datafiler som fallback.

## 📝 Data vedligeholdelse

### Tilføj ny plan (`src/data/plans.js`)

```javascript
{
  id: 'unique-id',
  provider: 'telmore' | 'telenor' | 'telenor-b2b' | 'telenor-bredbånd' | 'telmore-bredbånd' | 'cbb',
  name: 'Plan navn',
  data: '25 GB',  // Data mængde
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

## 🔌 Power.dk API Integration

Applikationen henter hardwarepriser fra Power.dk via CORS-proxyer eller direkte proxy gennem Vite dev server.

**Vite Proxy:**
- Automatisk konfigureret i `vite.config.js`
- Endpoint: `/api/power/*` → `https://www.power.dk/api/v2/*`

**Eksterne CORS Proxy (valgfrit):**
- Hvis Vite proxy fejler, bruges eksterne proxyer
- Se `src/utils/powerApi.js` for proxy-rotation og fallback logik

**API Endpoints:**
- Produktsøgning: `/api/v2/productlists?q=<term>`
- Prisopslag: `/api/v2/products/prices?ids=<ids>`

## 🚢 Deployment

### Vercel (Anbefalet)

```bash
npm i -g vercel
vercel
```

**Miljøvariabler i Vercel:**
- Tilføj alle `VITE_*` variabler i Vercel dashboard
- Sæt build command: `npm run build`
- Output directory: `dist`

### GitHub Pages

```bash
# Build projektet
npm run build

# Deploy dist/ til gh-pages branch
# Bemærk: Base path er sat til '/Power-Abo/' i vite.config.js
```

### Netlify

```bash
# Build command
npm run build

# Publish directory
dist

# Base directory
/
```

## 🛠️ Troubleshooting

| Problem | Løsning |
|---------|---------|
| Server starter ikke | `rm -rf node_modules && npm install` |
| Port 3000 optaget | Ændr port i `vite.config.js` server.port |
| Data gemmes ikke | Tjek browser localStorage, clear cache |
| API fejler | Se konsol for proxy-fejl, bruger cached/prisdata som fallback |
| Supabase fejl | Tjek `.env.local` credentials, se `SUPABASE_SETUP.md` |
| Build fejler | Tjek for syntax fejl, kør `npm run lint` |
| Admin panel virker ikke | Tjek `VITE_ADMIN_SLUG` i `.env.local` og `vite.config.js` |

## 🎨 Styling

Applikationen bruger modulært CSS med CSS variabler for theming:

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

## 📊 Data Flow

1. **Initial Load:**
   - Prøver at hente data fra Supabase (hvis konfigureret)
   - Fallback til lokale datafiler (`src/data/*.js`)
   - Cache i localStorage for hurtigere load

2. **Beregning:**
   - Bruger valgte planer og streaming tjenester
   - Beregner total pris, besparelse og provision
   - Opdaterer cart og sammenligningspanel

3. **Persistens:**
   - Alle valg gemmes i localStorage
   - Auto-save ved hver ændring
   - Reset funktion til at nulstille alt

## 🔒 Sikkerhed

- **RLS (Row Level Security):** Aktiveret på Supabase tabeller
- **API Keys:** Aldrig commit til git (brug `.env.local`)
- **CORS:** Håndteret via Vite proxy eller eksterne proxyer
- **LocalStorage:** Ingen følsomme data gemmes

## 📄 Licens

Intern brug i POWER-butikker. Kontakt udvikler for support.

## 🤝 Bidrag

1. Opret en feature branch
2. Commit dine ændringer
3. Push til branch
4. Opret Pull Request

## 📞 Support

For spørgsmål eller problemer, kontakt udviklerteamet.

---

**Version v1.2 (2025)** – Med mobil bredbånd support, Supabase integration og admin panel ⚡

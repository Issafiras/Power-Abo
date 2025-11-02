# ⚡ Power Abo Beregner

Rådgivningsværktøj til POWER-butikker der kombinerer mobilabonnementer, **mobil bredbånd** og streaming-tjenester i én samlet beregning.

**Tech stack:** React 18 + Vite 5 • Dark/Light mode • Responsiv design

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Åbner på `http://localhost:5173`

## ✨ Features

**Abonnementer & Bredbånd:**
- Telmore, Telenor (Privat/B2B/Bredbånd), CBB
- Mobil bredbånd support (Telmore 5G, Telenor Fri Data)
- Intro-priser og familie-rabatter
- Smart søgning og filtrering

**Streaming:**
- Multi-select grid med real-time priser
- CBB MIX selector (2-8 tjenester)
- Auto-match med inkluderede streamingtjenester

**Rådgivning:**
- Kontant rabat med auto-justering
- Præsentationsvisning (F11)
- Indtjeningsoversigt
- Besparelsesberegning

**Keyboard shortcuts:**
- `Ctrl + R` → Nulstil
- `Ctrl + P` → Præsentation
- `Ctrl + T` → Tema toggle
- `Esc` → Luk modal

## 📁 Projektstruktur

```
src/
├── components/        # React komponenter
├── data/
│   ├── plans.js       # Mobilabonnementer & bredbånd
│   └── streamingServices.js
├── utils/
│   ├── calculations.js
│   ├── powerApi.js    # Power.dk API integration
│   ├── storage.js
│   └── validators.js
└── styles/            # Modulært CSS
```

## 🔧 Scripts

| Script | Beskrivelse |
|--------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint check |

## 📝 Data vedligeholdelse

### Tilføj ny plan (`src/data/plans.js`)

```javascript
{
  id: 'unique-id',
  provider: 'telmore' | 'telenor' | 'telenor-b2b' | 'telenor-bredbånd' | 'telmore-bredbånd' | 'cbb',
  name: 'Plan navn',
  price: 299,
  introPrice: 99,      // Valgfrit
  introMonths: 6,      // Valgfrit
  earnings: 1000,      // Provision
  features: ['5G', 'EU Roaming'],
  type: 'broadband',   // Valgfrit (for bredbånd)
  streaming: [],
  streamingCount: 2   // Valgfrit (mix pakker)
}
```

### Tilføj streaming tjeneste (`src/data/streamingServices.js`)

```javascript
{
  id: 'netflix',
  name: 'Netflix',
  price: 129,
  logo: '/logos/netflix.svg',
  category: 'streaming'
}
```

## 🔌 Power.dk API

Applikationen henter hardwarepriser fra Power.dk via CORS-proxyer.

**Miljøvariabel (valgfri):**
```bash
VITE_PROXY_CORS_API_KEY=<din_nøgle>
```

**API endpoints:**
- Produktsøgning: `/api/v2/productlists?q=<term>`
- Prisopslag: `/api/v2/products/prices?ids=<ids>`

Se `src/utils/powerApi.js` for proxy-rotation og fallback logik.

## 🚢 Deployment

**Vercel (anbefalet):**
```bash
npm i -g vercel
vercel
```

**GitHub Pages:**
```bash
npm run build
# Deploy dist/ til gh-pages branch
```

## 🛠️ Troubleshooting

| Problem | Løsning |
|---------|---------|
| Server starter ikke | `rm -rf node_modules && npm install` |
| Data gemmes ikke | Tjek browser localStorage, clear cache |
| API fejler | Se konsol for proxy-fejl, bruger cached/prisdata som fallback |

## 📄 Licens

Intern brug i POWER-butikker. Kontakt udvikler for support.

---

**Version v1.2 (2025)** – Med mobil bredbånd support ⚡
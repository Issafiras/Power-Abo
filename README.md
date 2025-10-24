# ⚡ Power Abo Beregner

Power Abo Beregner er et rådgivningsværktøj til POWER-butikker, som kombinerer mobilabonnementer og streaming-tjenester i én samlet beregning. Applikationen er bygget i React/Vite og er optimeret til hurtig prisberegning, professionel præsentation og fuld kontrol over streaming-tilvalg.

## 🧭 Indholdsfortegnelse
- [Overblik](#-overblik)
- [Feature highlights](#-feature-highlights)
- [Power.dk-integration](#-powerdk-integration)
- [Kom godt i gang](#-kom-godt-i-gang)
- [Tilgængelige scripts](#-tilgængelige-scripts)
- [Projektstruktur](#-projektstruktur)
- [Data vedligeholdelse](#-data-vedligeholdelse)
- [Beregninger og logik](#-beregninger-og-logik)
- [Deployment](#-deployment)
- [Fejlsøgning](#-fejlsøgning)
- [Licens og kontakt](#-licens-og-kontakt)

## 📌 Overblik
- **Formål:** Hjælper butikspersonale med at dokumentere besparelser, indtjening og streaming-dækning for kunder.
- **Tech stack:** React 18, Vite 5, moderne JavaScript (ES2022+), modulært CSS med custom properties og lokale utility-klasser.
- **Data-håndtering:** Lokale JSON-lignende datasæt til abonnementer og streaming-tjenester, suppleret af live opslag mod Power.dk for hardwarepriser.
- **Tema & UI:** Understøtter dark/light-mode, keyboard shortcuts og en fuldskærms præsentationsvisning til kundedialog.

## ✨ Feature highlights
### Kundeoplevelse
- **Streaming Selector:** Grid med multi-select og prisopdatering i realtid.
- **CBB MIX Selector:** Specialiseret workflow til CBB MIX pakker (2–8 tjenester).
- **Mobiludgifter:** Inputfelter til eksisterende månedlige omkostninger og visning af 6-måneders total.
- **Provider filtre:** Hurtig filtrering mellem Telmore, Telenor og CBB-abonnementer.
- **Smart søgning:** Fritekst-søgning på data, funktioner, pris eller produktnavne.
- **Dynamisk kurv:** Antalstyring direkte på abonnementskortene med automatisk total.

### Rådgivningsværktøjer
- **Kontant rabat:** Manuel justering med lås, så rabatten ikke overskrives.
- **Auto-justér:** Sikrer minimum 500 kr. i dokumenteret besparelse.
- **Præsentationsvisning:** Fuldskærm med animeret besparelse og høj læsbarhed.
- **Indtjeningsoversigt:** Viser samlet indtjening baseret på valgte abonnementer.
- **Streaming coverage:** Matcher valgte streamingtjenester med kundens ønsker.

### UX & tilgængelighed
- **Dark/Light-mode toggle** og tilstandslagring i `localStorage`.
- **Keyboard shortcuts:**
  - `Ctrl + R` → Nulstil alle valg
  - `Ctrl + P` → Åbn/luk præsentationsvisning
  - `Ctrl + T` → Skift tema
  - `Escape` → Luk præsentation
- **Responsivt layout** til mobil, tablet og store skærme.

## 🔌 Power.dk-integration
Applikationen henter produkt- og prisdata fra Power.dk for at supplere de lokale datasæt.

- **Produktlister:** `https://www.power.dk/api/v2/productlists?q=<term>&size=10`
- **Prisopslag:** `https://www.power.dk/api/v2/products/prices?ids=<comma-separated-ids>`
- **Proxy-rotation:** `src/utils/powerApi.js` håndterer et sæt CORS-proxyer (CodeTabs, CorsProxy.io, ProxyCors, AllOrigins, ThingProxy, CorsAnywhere) med health-score, caching og retries. ProxyCors kan forsynes med en API-nøgle via `VITE_PROXY_CORS_API_KEY`.

> **Tip:** Opret en `.env`-fil og angiv `VITE_PROXY_CORS_API_KEY=<din_nøgle>` for at udnytte proxy.cors.sh med en personlig nøgle og reducere risikoen for rate limits.
- **Fallbacks:** Hvis alle proxyer fejler, anvendes prisdata fra selve produktlisten for at sikre at beregningen kan gennemføres.
- **Cache:** Resultater caches i fem minutter for at begrænse antal eksterne kald.

### Lokal udvikling
Vite-proxyen i `vite.config.js` mappe `/api/power/*` til Power.dk's REST-API, så udvikling kan ske uden browser-CORS problemer. Alle requests omskrives til `/api/v2/*` og får nødvendige headers for at efterligne en Power.dk-browser-session.

## 🚀 Kom godt i gang
### Forudsætninger
- Node.js **18.x** eller nyere
- npm (følger med Node). Yarn fungerer også, men dokumentationen tager udgangspunkt i npm

### Installation & lokal kørsel
```bash
# Klon repository og gå ind i projektet
cd Power-Abo

# Installer dependencies
npm install

# Start udviklingsserveren (åbner automatisk på http://localhost:3000)
npm run dev
```

### Production build
```bash
# Byg optimeret bundle i /dist
npm run build

# Forhåndsvis produktionsbuild på lokal server
npm run preview
```

## 📜 Tilgængelige scripts
| Script | Beskrivelse |
| --- | --- |
| `npm run dev` | Starter Vite-udviklingsserveren på port 3000 med auto-open |
| `npm run build` | Producerer production build i `dist/` med sourcemaps |
| `npm run preview` | Serverer den byggede app lokalt til validering |
| `npm run lint` | ESLint-check af hele projektet (`.js`/`.jsx`) |

## 🗂️ Projektstruktur
```
Power-Abo/
├── public/
│   ├── favicon.ico
│   └── logos/               # Assets til abonnementer og streaming
├── src/
│   ├── App.jsx              # Hovedkomponent og tilstandshåndtering
│   ├── main.jsx             # Entry point (ReactDOM createRoot)
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── ProviderTabs.jsx
│   │   ├── PlanCard.jsx
│   │   ├── Cart.jsx
│   │   ├── ComparisonPanel.jsx
│   │   ├── StreamingSelector.jsx
│   │   ├── CBBMixSelector.jsx
│   │   ├── PresentationView.jsx
│   │   └── Footer.jsx
│   ├── data/
│   │   ├── plans.js
│   │   └── streamingServices.js
│   ├── styles/
│   │   ├── variables.css    # Design tokens (farver, spacing)
│   │   ├── components.css
│   │   ├── cbb-mix.css
│   │   ├── animations.css
│   │   ├── compact.css
│   │   ├── utilities.css
│   │   └── main.css
│   └── utils/
│       ├── calculations.js
│       ├── powerApi.js
│       ├── storage.js
│       └── validators.js
├── package.json
├── vite.config.js
└── README.md
```

## 🧾 Data vedligeholdelse
### Mobilabonnementer (`src/data/plans.js`)
```javascript
{
  id: 'unique-id',
  provider: 'telmore' | 'telenor' | 'cbb',
  name: 'Abonnement navn',
  data: '100 GB',
  price: 299,
  introPrice: 99,      // Valgfrit (kr./md)
  introMonths: 3,      // Valgfrit (antal måneder)
  earnings: 1000,      // Provision i kr.
  features: ['5G', 'EU Roaming'],
  familyDiscount: true, // Kun Telenor
  color: '#ff6b1a',
  streaming: ['netflix', 'hbo-max'],
  streamingCount: 2,
  cbbMixAvailable: true,
  cbbMixPricing: { 2: 160, 3: 210, 4: 260, 5: 310, 6: 360, 7: 410, 8: 460 }
}
```

### Streaming-tjenester (`src/data/streamingServices.js`)
```javascript
{
  id: 'netflix',
  name: 'Netflix',
  price: 129,
  logo: '/logos/netflix.svg',
  bgColor: '#141414',
  category: 'streaming',
  cbbMixOnly: false
}
```

### Prisreferencer (jan 2025)
- **Telenor:** 20 GB (149 kr/md, 700 kr indtjening) → Fri data (289 kr/md, 1300 kr indtjening) med -50 kr/md familiepris per ekstra linje.
- **Telmore:** Fra 30 GB (129 kr/md) til Ultimate (599 kr/md) inkl. forskellige streamingpakker og intropriser.
- **CBB:** 60 GB (109 kr/md) til 500 GB (149 kr/md) samt World-data og MIX-pakker (2–8 tjenester fra 160–460 kr/md).
- **CBB MIX eksklusiver:** Podimo Premium, Mofibo og Nordisk Film+.

## 🧮 Beregninger og logik
| Beregning | Formel |
| --- | --- |
| 6-måneders pris (med intro) | `(introPrice × introMonths × qty) + (normalPrice × (6 - introMonths) × qty)` |
| 6-måneders pris (uden intro) | `normalPrice × 6 × qty` |
| Telenor familie-rabat pr. måned | `(antalLinjer - 1) × 50` |
| Telenor familie-rabat (6 mdr.) | `månedligRabat × 6` |
| Besparelse | `Kundens 6-måneders total - Vores 6-måneders total` |

Alle beregninger findes i `src/utils/calculations.js`, og validering af input i `src/utils/validators.js`.

## 🚢 Deployment
### Vercel (anbefalet)
1. Installer CLI: `npm i -g vercel`
2. Kør `vercel` og følg prompts (project root = `Power-Abo/`).
3. Vercel understøtter automatisk SPA-routing.

### Netlify
1. `npm run build`
2. Upload `dist/` via Netlify UI eller brug CLI (`netlify deploy --prod`).

### GitHub Pages
1. Sørg for at `base` i `vite.config.js` matcher repository-navn (default: `/Power-Abo/`).
2. `npm run build`
3. Deploy `dist/` til `gh-pages` branch (fx via `gh-pages` npm-pakke eller GitHub Actions).

## 🛠️ Fejlsøgning
| Problem | Løsning |
| --- | --- |
| Udviklingsserver starter ikke | Slet `node_modules`, kør `npm install`, start igen |
| Data gemmes ikke | Kontrollér at browser understøtter `localStorage`, ryd cache, tjek konsollen |
| Styling ser forkert ud | Hard refresh (`Ctrl/Cmd + Shift + R`), bekræft at CSS-filer er importeret |
| Power API fejler | Se browserkonsollen for proxy-fejl. Systemet falder tilbage til cached data eller produktpriser når muligt |

## 📄 Licens og kontakt
- Projektet er udviklet til intern brug i POWER-butikker og må ikke distribueres offentligt.
- Version **v1.1 (2025)** – kontakt den interne udvikler for support og spørgsmål.

**God fornøjelse med Power Abo Beregner!** ⚡


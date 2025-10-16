# ⚡ Power Calculator

En moderne webapplikation til beregning og sammenligning af mobilabonnementer og streaming-tjenester.

## 🎯 Features

### Kundefunktionalitet
- ✅ **Streaming Selector**: Multi-select grid med alle populære streaming-tjenester
- ✅ **CBB MIX Selector**: Dedikeret interface til CBB MIX streaming-pakker
- ✅ **Mobiludgifter Input**: Indtast kundens nuværende mobiludgifter
- ✅ **Provider Filtering**: Filtrer planer fra Telmore, Telenor eller CBB
- ✅ **Smart Søgning**: Søg efter planer baseret på data, features eller pris
- ✅ **Dynamisk Kurv**: Tilføj planer med quantity controls
- ✅ **Live Beregninger**: Realtids beregning af totaler og besparelser

### Avancerede Features
- 💰 **Kontant Rabat**: Justerbar kontant rabat med låsefunktion
- 🔄 **Auto-adjust**: Automatisk justering for minimum 500 kr besparelse
- 📊 **Præsentationsvisning**: Fullscreen view med animeret besparelse
- 🎨 **Dark/Light Mode**: Tema-toggle mellem mørk og lys tilstand
- ⌨️ **Keyboard Shortcuts**: Genveje til hurtigere navigation
- 💾 **Data Persistens**: Automatisk lagring i localStorage
- 📱 **Responsivt Design**: Fungerer perfekt på mobil, tablet og desktop

### Beregninger
- ✅ **Intro-pris håndtering**: Korrekt beregning af intro-perioder
- ✅ **Telenor Familie-rabat**: Automatisk -50 kr/md pr. ekstra linje
- ✅ **Streaming Coverage**: Checker hvilke tjenester er inkluderet
- ✅ **6-måneders analyse**: Viser total besparelse over 6 måneder
- ✅ **Indtjening**: Tracker total indtjening fra valgte planer

## 🚀 Installation

### Forudsætninger
- Node.js 18.x eller nyere
- npm eller yarn

### Setup

1. **Naviger til projekt-mappen:**
   ```bash
   cd power-calculator-app
   ```

2. **Installer dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Åbn browser:**
   - Applikationen åbner automatisk på `http://localhost:3000`

## 📦 Build til Production

### Byg projektet:
```bash
npm run build
```

Build-filerne genereres i `/dist` mappen.

### Preview production build:
```bash
npm run preview
```

## 🌐 Deployment

### Vercel (Anbefalet)
1. Installer Vercel CLI: `npm i -g vercel`
2. Kør: `vercel`
3. Følg instruktionerne

### Netlify
1. Byg projektet: `npm run build`
2. Drag & drop `/dist` mappen til Netlify

### GitHub Pages
```bash
# I vite.config.js, tilføj:
# base: '/repository-name/'

npm run build
# Deploy /dist mappen til gh-pages branch
```

## 📁 Projekt Struktur

```
power-calculator-app/
├── public/
│   ├── index.html          # HTML template
│   └── favicon.ico         # Favicon
├── src/
│   ├── components/
│   │   ├── Header.jsx              # Header med kontroller
│   │   ├── ProviderTabs.jsx        # Provider filter tabs
│   │   ├── PlanCard.jsx            # Plan kort
│   │   ├── StreamingSelector.jsx   # Streaming valg
│   │   ├── CBBMixSelector.jsx      # CBB MIX streaming-pakker
│   │   ├── Cart.jsx                # Kurv
│   │   ├── ComparisonPanel.jsx     # Sammenligning
│   │   └── PresentationView.jsx    # Præsentation
│   ├── data/
│   │   ├── plans.js                # Mobilabonnementer
│   │   └── streamingServices.js    # Streaming-tjenester
│   ├── styles/
│   │   ├── variables.css           # CSS variabler
│   │   ├── components.css          # Komponent styles
│   │   └── main.css                # Global styles
│   ├── utils/
│   │   ├── calculations.js         # Beregningslogik
│   │   ├── storage.js              # LocalStorage
│   │   └── validators.js           # Validering
│   ├── App.jsx                     # Hovedkomponent
│   └── main.jsx                    # Entry point
├── package.json
├── vite.config.js
└── README.md
```

## ⌨️ Keyboard Shortcuts

- **Ctrl + R**: Nulstil alt
- **Ctrl + P**: Åbn/luk præsentation
- **Ctrl + T**: Skift tema (dark/light)
- **Escape**: Luk præsentation

## 🎨 Design System

### Farver
- **Brand Orange**: `#ff6b1a`
- **Telenor Blå**: `#38bdf8`
- **CBB Lilla**: `#a855f7`
- **Success**: `#10b981`
- **Danger**: `#ef4444`

### Spacing
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)
- **3xl**: 4rem (64px)

### Breakpoints
- **Mobile**: < 900px
- **Tablet**: 900px - 1600px
- **Desktop**: > 1600px

## 📊 Mobilabonnementer Database

### Telenor
- 20 GB: 149 kr/md (indtjening: 700 kr)
- 70 GB: 199 kr/md (indtjening: 900 kr)
- 120 GB: 239 kr/md (indtjening: 1200 kr)
- Fri Data: 289 kr/md (indtjening: 1300 kr)
- **Familiepris**: -50 kr/md pr. ekstra linje

### Telmore
- 30 GB: 129 kr/md (indtjening: 400 kr)
- 70 GB: 149 kr/md, intro 74 kr første 3 mdr (indtjening: 700 kr)
- 60 GB: 169 kr/md (indtjening: 700 kr)
- 100 GB + HBO Max: 219 kr/md, intro 99 kr (indtjening: 700 kr)
- Fri Data: 229 kr/md (indtjening: 700 kr)
- 100 GB + 2 streaming: 299 kr/md, intro 99 kr (indtjening: 1000 kr)
- Fri Data + 3 streaming: 399 kr/md, intro 99 kr (indtjening: 1100 kr)
- Fri Data + 4 streaming: 449 kr/md (indtjening: 1100 kr)
- Fri Data + 5 streaming: 499 kr/md (indtjening: 1100 kr)
- Premium (8 streaming): 559 kr/md (indtjening: 1100 kr)
- Ultimate (9 streaming): 599 kr/md (indtjening: 1100 kr)

### CBB
- 60 GB: 109 kr/md (indtjening: 300 kr)
- 200 GB: 129 kr/md (indtjening: 500 kr)
- 500 GB: 149 kr/md (indtjening: 800 kr)
- 100 GB World-data: 199 kr/md (indtjening: 800 kr)

### CBB MIX (Streaming pakker)
- **CBB MIX 2**: 2 streaming-tjenester for 160 kr/md
- **CBB MIX 3**: 3 streaming-tjenester for 210 kr/md
- **CBB MIX 4**: 4 streaming-tjenester for 260 kr/md
- **CBB MIX 5**: 5 streaming-tjenester for 310 kr/md
- **CBB MIX 6**: 6 streaming-tjenester for 360 kr/md
- **CBB MIX 7**: 7 streaming-tjenester for 410 kr/md
- **CBB MIX 8**: 8 streaming-tjenester for 460 kr/md

## 📺 Streaming-tjenester

### Standard tjenester
- Netflix: 129 kr/md (Standard plan)
- Viaplay: 149 kr/md (Standard plan)
- Max (HBO Max): 129 kr/md (Standard plan)
- TV2 Play Basis: 99 kr/md (Basis plan)
- Saxo: 79 kr/md (20 timers plan)
- Disney+: 149 kr/md (Standard plan)
- SkyShowtime: 89 kr/md (Standard plan)
- Prime Video: 59 kr/md (Standalone plan)
- Musik (Spotify/Apple Music): 119 kr/md (Individual plan)

### CBB MIX eksklusive tjenester
- **Podimo Premium**: 79 kr/md (kun via CBB MIX)
- **Mofibo**: 89 kr/md (20 timer, kun via CBB MIX)
- **Nordisk Film+**: 89 kr/md (kun via CBB MIX)

### CBB MIX priser
- 2 tjenester: 160 kr/md
- 3 tjenester: 210 kr/md
- 4 tjenester: 260 kr/md
- 5 tjenester: 310 kr/md
- 6 tjenester: 360 kr/md
- 7 tjenester: 410 kr/md
- 8 tjenester: 460 kr/md

## 🧮 Beregningslogik

### 6-måneders pris
```javascript
// Med intro-pris:
(introPrice × introMonths × qty) + (normalPrice × (6 - introMonths) × qty)

// Uden intro-pris:
normalPrice × 6 × qty
```

### Telenor Familie-rabat
```javascript
// Rabat pr. måned:
(antal_linjer - 1) × 50 kr

// 6-måneders rabat:
månedlig_rabat × 6
```

### Besparelse
```javascript
Kunde 6-md total - Vores 6-md total = Besparelse
```

## 🔧 Teknologi Stack

- **React 18.x**: UI framework
- **Vite**: Build tool og dev server
- **CSS3**: Styling med custom properties
- **LocalStorage API**: Data persistens
- **Modern JavaScript (ES2022+)**: Ingen legacy code

## 🎯 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Development Notes

### Tilføj nye planer
Rediger `/src/data/plans.js`:
```javascript
{
  id: 'unique-id',
  provider: 'telmore|telenor|cbb',
  name: 'Plan navn',
  data: '100 GB',
  price: 299,
  introPrice: 99,        // Valgfri
  introMonths: 3,        // Valgfri
  earnings: 1000,
  features: ['5G', 'EU Roaming'],
  familyDiscount: true,  // Kun Telenor
  color: '#ff6b1a',
  streaming: ['netflix', 'hbo-max'],
  streamingCount: 2      // Hvis streaming inkluderet
}
```

### Tilføj nye streaming-tjenester
Rediger `/src/data/streamingServices.js`:
```javascript
{
  id: 'unique-id',
  name: 'Tjeneste navn',
  price: 99,
  logo: '/Power-Abo/logos/service.png',
  bgColor: '#000000',
  category: 'streaming',
  cbbMixOnly: false // true for CBB MIX eksklusive tjenester
}
```

### CBB MIX funktionalitet
CBB MIX tjenester kan kun tilgås via CBB MIX pakker. Tilføj `cbbMixOnly: true` for eksklusive tjenester som Podimo, Mofibo og Nordisk Film+.

### Styling
Alle CSS-variabler er defineret i `/src/styles/variables.css`. Rediger her for at ændre farver, spacing, etc.

## 🐛 Troubleshooting

### Applikationen starter ikke
```bash
# Slet node_modules og reinstaller
rm -rf node_modules
npm install
npm run dev
```

### Data gemmes ikke
- Check at browser understøtter localStorage
- Se browser console for fejlmeddelelser
- Prøv at rydde browser cache

### Styling ser forkert ud
- Hard refresh: Ctrl+Shift+R (Windows) eller Cmd+Shift+R (Mac)
- Ryd browser cache
- Check at alle CSS-filer er importeret korrekt

## 📄 License

Dette projekt er udviklet til intern brug.

## 👨‍💻 Udviklet af

Power Calculator v1.0 - 2025

---

**God fornøjelse med Power Calculator!** ⚡

For spørgsmål eller support, se dokumentationen eller kontakt udvikleren.


# POWER | 6-måneders familieløsning

En moderne, statisk webapp til beregning af familiens samlede mobil- og streaming-løsning med Telenor samlerabat over 6 måneder.

## ✨ Features

- **6-måneders perspektiv** – Se den samlede omkostning over et halvt år
- **Telenor samlerabat** – Automatisk beregning af rabatter baseret på antal linjer
- **Streaming-vælger** – Vælg mellem 8 populære tjenester med visuel feedback
- **500 kr minimum besparelse** – Automatisk validering og forslag til forbedring
- **Dark/Light mode** – Elegant tema-skifte med CSS-variabler
- **Tastaturgenveje** – Hurtig navigation med 1/2/3, R, S, P
- **Print-venlig** – Pæn A4-output til præsentation
- **Del-funktion** – Generér delbart link med URL-parametre

## 🚀 Lokal kørsel

Projektet er rent statisk og kræver ingen build-process. Du kan køre det på flere måder:

### 1. Python HTTP Server (anbefalet)

```bash
cd "/Users/issafiras/Desktop/Power abo beregner"
python3 -m http.server 5173
```

Åbn derefter [http://localhost:5173](http://localhost:5173) i browseren.

### 2. VSCode Live Server

1. Installer "Live Server" extension i VSCode
2. Højreklik på `index.html`
3. Vælg "Open with Live Server"

### 3. Andre web-servere

```bash
# Node.js http-server
npx http-server -p 5173

# PHP
php -S localhost:5173
```

## 📦 Deployment til GitHub Pages

Projektet er klar til GitHub Pages med GitHub Actions:

### 1. Aktivér GitHub Pages

1. Gå til repository Settings
2. Find "Pages" i sidemenuen
3. Under "Source", vælg **GitHub Actions**

### 2. Push til main branch

```bash
git add .
git commit -m "feat: initial deployment"
git push origin main
```

### 3. Tjek deployment

- Gå til "Actions" tab i dit repository
- Se workflow-kørslen "Deploy to GitHub Pages"
- Når den er færdig, findes dit site på: `https://[username].github.io/[repo-name]/`

## 📁 Projektstruktur

```
/
├── index.html              # Hovedside
├── assets/
│   ├── css/
│   │   └── styles.css      # Styling med CSS-variabler
│   ├── js/
│   │   ├── main.js         # App initialisering & hotkeys
│   │   ├── state.js        # State management
│   │   ├── calc.js         # Beregningsmotor
│   │   ├── providers.js    # Telenor samlerabat-logik
│   │   ├── streams.js      # Streaming-tjenester data
│   │   └── ui.js           # UI rendering
│   └── img/                # Ikoner/assets (optional)
├── .github/
│   └── workflows/
│       └── gh-pages.yml    # GitHub Actions deployment
└── README.md               # Denne fil
```

## ⌨️ Tastaturgenveje

| Tast | Funktion |
|------|----------|
| `1`, `2`, `3` | Spring til trin 1, 2 eller 3 |
| `←`, `→` | Naviger mellem trin |
| `R` | Reset/Nulstil |
| `S` | Gem/Del resultat (kopiér link) |
| `P` | Print resultat |
| `?` | Vis genveje |
| `ESC` | Luk modal |

## 🎨 Konfiguration

### Priser og tjenester

Rediger `/assets/js/streams.js` for at tilføje eller ændre streaming-tjenester:

```javascript
export const STREAMING_SERVICES = [
  {
    id: 'netflix',
    label: 'Netflix',
    monthlyPrice: 119,
    icon: '🎬',
    color: '#e50914'
  },
  // ...
]
```

### Telenor samlerabat

Rediger `/assets/js/providers.js` for at justere rabat-tiers:

```javascript
const TELENOR_DISCOUNT_TIERS = [
  { minLines: 4, monthlyDiscount: 200, label: '4+ linjer' },
  { minLines: 3, monthlyDiscount: 150, label: '3 linjer' },
  { minLines: 2, monthlyDiscount: 100, label: '2 linjer' }
]
```

### Minimum besparelse

Rediger `/assets/js/calc.js` for at ændre kravet:

```javascript
const MIN_SAVINGS = 500 // Ændr til ønsket beløb
```

## 🛠️ Teknisk stack

- **Ingen bundler** – Ren HTML/CSS/ES-modules
- **Ingen frameworks** – Vanilla JavaScript
- **Ingen eksterne dependencies** – Alt er self-contained
- **Moderne CSS** – CSS-variabler, Grid, Flexbox
- **ES Modules** – Modulær JavaScript-struktur
- **GitHub Actions** – Automatisk deployment

## 📚 Dokumentation

Fuld wiki-dokumentation findes i [`docs/wiki/`](docs/wiki/Home.md):

- 🚀 [Quick Start Guide](docs/wiki/Quick-Start.md)
- 📖 [Brugerguide](docs/wiki/Brugerguide.md)
- 🏗️ [Arkitektur](docs/wiki/Arkitektur.md)
- ⚙️ [Konfiguration](docs/wiki/Konfiguration.md)
- ⌨️ [Tastaturgenveje](docs/wiki/Tastaturgenveje.md)
- 🚀 [GitHub Pages Setup](docs/wiki/GitHub-Pages-Setup.md)
- ❓ [FAQ](docs/wiki/FAQ.md)
- 📝 [Changelog](docs/wiki/Changelog.md)

## 📝 Licens

Dette projekt er udviklet til intern brug hos POWER.

## 🤝 Bidrag

For at bidrage til projektet:

1. Fork repository
2. Opret en feature branch (`git checkout -b feature/ny-feature`)
3. Commit dine ændringer (`git commit -m 'feat: tilføj ny feature'`)
4. Push til branch (`git push origin feature/ny-feature`)
5. Åbn en Pull Request

## 🐛 Fejlrapportering

Rapportér fejl ved at oprette et issue i repository med:
- Beskrivelse af problemet
- Trin til at reproducere
- Forventet vs. faktisk adfærd
- Browser og OS information

---

**Version:** 10.0 (Modulær rebuild)  
**Sidste opdatering:** Oktober 2025


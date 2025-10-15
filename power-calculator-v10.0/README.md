# POWER Calculator v10.0

Moderne modulær version af POWER kalkulatoren med separeret HTML, CSS og JavaScript struktur.

## Struktur

```
power-calculator-v10.0/
├── index.html              # Hoved HTML fil
├── css/
│   └── styles.css          # Alle CSS styles
├── js/
│   ├── main.js            # Hoved initialisering
│   ├── app.js             # Hovedapplikations logik
│   ├── database.js        # Database håndtering
│   └── ui.js              # UI event handlers
├── database/
│   ├── plans.json         # Abonnements data
│   └── streaming.json     # Streaming tjenester data
└── assets/                # Eventuelle billeder/ikoner
```

## Funktioner

- **Modulær struktur**: Separeret HTML, CSS og JavaScript
- **ES6 moduler**: Moderne JavaScript import/export
- **Samme funktionalitet**: Alle funktioner fra v9.3 bevaret
- **Responsivt design**: Fungerer på alle enheder
- **Tema support**: Lys/mørk tema
- **Keyboard shortcuts**: Genveje til alle funktioner

## Installation

### Hurtig start
```bash
# Start lokal HTTP server
cd power-calculator-v10.0
python3 -m http.server 8080

# Åbn i browser
open http://localhost:8080
```

### Detaljeret installation
1. **Start HTTP server** (kræves pga. ES6 moduler og CORS)
   ```bash
   python3 -m http.server 8080
   # Eller: npx serve .
   ```

2. **Åbn i browser** via HTTP (ikke file://)
   - `http://localhost:8080`
   - Ikke `file://` - det virker ikke med ES6 moduler

3. **Applikationen indlæser automatisk** database filerne

### Alternativer til Python server
```bash
# Node.js
npx serve .

# PHP
php -S localhost:8080

# Live Server (VS Code extension)
# Right-click index.html → "Open with Live Server"
```

## Udvikling

- **HTML**: Struktureret semantisk markup
- **CSS**: Moderne CSS med custom properties og grid/flexbox
- **JavaScript**: ES6+ moduler med async/await
- **Database**: JSON filer med abonnements og streaming data

## Browser support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

Kræver moderne browser med ES6 modul support.

# POWER Abo Beregner

Et professionelt butiksværktøj til POWER medarbejdere til at præsentere 6-måneders familieløsninger for mobil og streaming tjenester.

## 📋 Oversigt

Dette værktøj hjælper POWER medarbejdere med at:
- Beregne kundens nuværende udgifter
- Vise besparelser med POWER's 6-måneders familieløsning
- Inkludere streaming tjenester og CBB Mix funktioner
- Automatisk justere til minimum 500 kr besparelse
- Præsentere løsningen professionelt

## 🚀 Hurtig start

### Version 10.0 (Anbefalet - Moderne struktur)
```bash
# Åbn v10.0 i browser
open power-calculator-v10.0/index.html
```

### Tidligere versioner
- **v9.3**: Seneste single-file version
- **v9.2**: Med Start Guide + CBB Mix
- **v9.1**: Med CBB Mix funktioner
- **v9.0**: Med Start Guide funktioner

## 📁 Projekt struktur

```
Power abo beregner/
├── power-calculator-v10.0/     # 🆕 Moderne modulær version
│   ├── index.html              # Hoved HTML fil
│   ├── css/styles.css          # Alle styles
│   ├── js/                     # JavaScript moduler
│   │   ├── main.js            # Initialisering
│   │   ├── app.js             # App logik
│   │   ├── database.js        # Database håndtering
│   │   └── ui.js              # UI events
│   ├── database/              # JSON data filer
│   └── README.md              # v10.0 dokumentation
├── power-calculator-v9.3.html # Seneste single-file version
├── power-calculator-v9.2.html # Med Start Guide + CBB Mix
├── power-calculator-v9.1.html # Med CBB Mix funktioner
├── power-calculator-v9.0.html # Med Start Guide funktioner
├── index.html                 # GitHub Pages entry point (v9.2)
└── README.md                  # Denne fil
```

## 🎯 Funktioner

### Kernerfunktioner
- ✅ **Kundens udgifter**: Indtast nuværende mobilregning og streaming
- ✅ **Abonnements valg**: Telenor, Telmore og CBB pakker
- ✅ **Besparelses beregning**: 6-måneders sammenligning
- ✅ **Auto-justering**: Sikrer minimum 500 kr besparelse
- ✅ **Streaming tjenester**: Netflix, Viaplay, HBO Max, osv.
- ✅ **CBB Mix**: Fleksibel streaming pakke

### Avancerede funktioner
- 🚀 **Start Guide**: Interaktiv kundeguide
- 📊 **Præsentationsvisning**: Professionel fremvisning
- 🎨 **Tema support**: Lys/mørk mode
- ⌨️ **Keyboard shortcuts**: Hurtige genveje
- 📱 **Responsivt design**: Fungerer på alle enheder
- 💾 **Lokal storage**: Husker indstillinger

## 🎮 Brug af værktøjet

### 1. Indtast kundens udgifter
- **Månedlig mobilregning**: Hvor meget betaler kunden nu?
- **Streaming tjenester**: Hvilke tjenester bruger kunden?

### 2. Vælg POWER løsning
- **Abonnements type**: Telenor, Telmore eller CBB
- **Data mængde**: Baseret på kundens behov
- **Streaming pakke**: CBB Mix eller individuelle tjenester

### 3. Se besparelsen
- **6-måneders sammenligning**: Kunde vs. POWER løsning
- **Automatisk justering**: Sikrer minimum 500 kr besparelse
- **Rabat muligheder**: Tilpas efter behov

### 4. Præsenter løsningen
- **Start Guide**: Interaktiv demonstration
- **Præsentationsvisning**: Professionel fremvisning
- **Eksport muligheder**: Print eller del resultater

## ⌨️ Keyboard shortcuts

| Genvej | Funktion |
|--------|----------|
| `Ctrl/Cmd + K` | Vis alle genveje |
| `Escape` | Luk alle modaler |
| `Ctrl/Cmd + R` | Nulstil kalkulator |
| `Ctrl/Cmd + Shift + G` | Start Guide |
| `Ctrl/Cmd + Shift + P` | Præsentationsvisning |

## 🎨 Temaer

### Mørk tema (Standard)
- Professionelt udseende
- Orange POWER branding
- Optimeret til skærmpræsentation

### Lys tema
- Ren og moderne
- Perfekt til print
- Høj kontrast

**Skift tema**: Klik på 🌙/☀️ ikonet i header

## 📊 Database struktur

### Plans (Abonnements)
```json
{
  "plans": [
    {
      "id": "ten-70",
      "brand": "Telenor",
      "name": "70 GB",
      "dataGB": 70,
      "price": 199,
      "earnings": 900,
      "features": ["5G", "eSIM", "EU Roaming", "Familie"]
    }
  ]
}
```

### Streaming Services
```json
{
  "services": [
    {
      "id": "netflix",
      "name": "Netflix",
      "price": 139,
      "icon": "<div class='streaming-logo netflix'>N</div>"
    }
  ]
}
```

## 🔧 Tekniske detaljer

### Version 10.0 (Moderne)
- **HTML5**: Semantisk markup
- **CSS3**: Custom properties, Grid, Flexbox
- **ES6+**: Moduler, async/await, destructuring
- **JSON**: Database filer
- **Service Worker**: Offline support (planlagt)

### Browser support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🚀 Deployment

### GitHub Pages (Automatisk)
- **URL**: [https://issafiras.github.io/Power-Abo/](https://issafiras.github.io/Power-Abo/)
- **Branch**: `main`
- **Build**: GitHub Actions automatisk deployment
- **Default**: v10.0 (moderne modulær version)
- **Alternativer**: v9.3, v9.2, v9.1, v9.0 tilgængelige

### GitHub Actions Workflow
```yaml
# Automatisk deployment på push til main
# Validerer filer, bygger optimeret version
# Deployer til GitHub Pages med version selector
```

**Se [DEPLOYMENT.md](DEPLOYMENT.md) for detaljerede instruktioner**

### Lokal udvikling

**⚠️ Vigtigt**: v10.0 kræver en HTTP server pga. ES6 moduler og CORS politikker.

```bash
# Start lokal server (Python 3)
cd power-calculator-v10.0
python3 -m http.server 8080

# Eller med Python 2
python -m SimpleHTTPServer 8080

# Eller med Node.js
npx serve power-calculator-v10.0

# Åbn browser
open http://localhost:8080
```

**CORS problem løsning:**
- ❌ `file://` protokollen virker ikke med ES6 moduler
- ✅ Brug altid HTTP server for v10.0
- ✅ v9.x versioner virker direkte fra filsystem

## 📈 Version historie

### v10.0 (Seneste)
- 🆕 Modulær struktur (HTML/CSS/JS separeret)
- 🆕 ES6 moduler
- 🆕 Bedre vedligeholdelse
- ✅ Samme funktionalitet som v9.3

### v9.3
- ✅ CBB Mix funktioner
- ✅ Start Guide integration
- ✅ Alle streaming tjenester
- ✅ Auto-justering til 500 kr besparelse

### v9.2
- ✅ Kombineret Start Guide + CBB Mix
- ✅ GitHub Pages deployment
- ✅ Forbedret UI/UX

### v9.1
- ✅ CBB Mix streaming pakker
- ✅ Forbedret beregninger
- ✅ Nye streaming tjenester

### v9.0
- ✅ Start Guide funktioner
- ✅ Interaktiv kundeguide
- ✅ Step-by-step process

## 🤝 Bidrag

### Rapporter bugs
1. Åbn en issue på GitHub
2. Beskriv problemet detaljeret
3. Inkluder browser og version
4. Vedhæft skærmbilleder hvis relevant

### Foreslå forbedringer
1. Åbn en issue med "enhancement" label
2. Beskriv forbedringen
3. Forklar fordelene
4. Inkluder mockups hvis muligt

## 📞 Support

### For POWER medarbejdere
- **Internt support**: Kontakt IT afdelingen
- **Training**: Se POWER's interne dokumentation
- **Feedback**: Rapporter via interne kanaler

### Tekniske problemer
- **Browser issues**: Prøv at opdatere browser
- **Performance**: Ryd browser cache
- **Offline**: Sørg for internet forbindelse

## 📄 Licens

Dette værktøj er udviklet til POWER's interne brug. Alle rettigheder forbeholdes.

## 🙏 Tak

Tak til alle POWER medarbejdere der har bidraget med feedback og forbedringer til dette værktøj.

---

**Udviklet med ❤️ for POWER medarbejdere**

*Sidst opdateret: December 2024*

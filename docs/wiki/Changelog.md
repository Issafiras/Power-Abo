# Changelog

Alle væsentlige ændringer til projektet dokumenteres i denne fil.

Formatet er baseret på [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
og projektet følger [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [10.0.0] - 2025-10-15

### 🎉 Ny modulær version - Komplet rebuild

Dette er en fuldstændig ny version bygget fra bunden med fokus på:
- Modulær arkitektur
- Simpel kodebase
- Vedligeholdelig struktur
- Ingen frameworks

### ✨ Added

#### Core Features
- **3-trins flow:** Mobil → Streaming → Resultat
- **Telenor samlerabat:** Automatisk beregning baseret på antal linjer
  - 2 linjer: 100 kr/md
  - 3 linjer: 150 kr/md
  - 4+ linjer: 200 kr/md
- **8 streaming-tjenester:** Netflix, HBO Max, TV2 Play, Viaplay, Disney+, SkyShowtime, Prime, Musik
- **500 kr minimum regel:** Automatisk validering med forslag
- **6-måneders perspektiv:** Total omkostning over halvår

#### UI/UX
- **Dark/Light mode:** Toggle med localStorage persistence
- **Tastaturgenveje:** 1/2/3, R, S, P, piltaster, ?
- **Print-funktion:** A4-venlig output
- **Del-funktion:** URL-parametre til deling
- **Responsiv design:** Mobile-first approach
- **Keyboard shortcuts modal:** Tryk ? for hjælp

#### Technical
- **ES-modules:** Ren JavaScript uden bundler
- **State management:** Centraliseret state med getter/setter
- **Modulær struktur:** 6 separate JS-filer
- **CSS-variabler:** For nem tematilpasning
- **GitHub Actions:** Automatisk deployment til Pages

#### Documentation
- **README.md:** Omfattende projektdokumentation
- **Wiki:** 12+ sider med guides og reference
- **Inline kommentarer:** I alle moduler

### 🏗️ Architecture

#### Module Structure
```
assets/js/
├── main.js       - App initialisering & hotkeys
├── state.js      - State management
├── calc.js       - Beregningsmotor
├── providers.js  - Telenor samlerabat logik
├── streams.js    - Streaming-tjenester data
└── ui.js         - UI rendering
```

#### Data Flow
```
User Input → setState() → render() → calculateAll() → DOM Update
```

### 🎨 Design

#### Color System
- Brand: `#ff6b1a` (POWER orange)
- Telenor: `#0ea5e9` (lyseblå)
- Success: `#10b981` (grøn)
- Error: `#ef4444` (rød)

#### Components
- Step indicator med active states
- Interactive streaming chips
- Result card med status badges
- Glass-morphism effects

### 📦 Deployment

- **GitHub Actions workflow:** `.github/workflows/gh-pages.yml`
- **Automatisk deployment:** Ved push til main
- **Static hosting:** Ingen build-process nødvendig

### 🗑️ Removed

- **v9.x HTML-filer:** Slettet single-file versioner
- **v10.0 mappe:** Fjernet gammel struktur
- **External dependencies:** Ingen frameworks eller libraries
- **Build process:** Ingen bundler nødvendig

### 🔄 Changed

Fra single-file monolitisk HTML til:
- Modulær ES6 struktur
- Separation of concerns
- Data-driven konfiguration
- Vedligeholdelig kodebase

### Migration fra v9.x

**Breaking changes:**
- Komplet ny kodebase - ikke bagudkompatibel
- URL-parametre har ændret format
- Nye CSS-klasser og struktur

**For brugere:**
- Funktionalitet er bevaret
- UI er forbedret og moderniseret
- Nye features tilføjet

**For udviklere:**
- Læs [Arkitektur](Arkitektur.md) for system-oversigt
- Se [Konfiguration](Konfiguration.md) for tilpasning
- Tjek [Modul Reference](Modul-Reference.md) for API

---

## [9.3.0] - 2025-10-XX

### Changed
- Forbedret dark mode styling
- Optimeret beregningslogik

### Fixed
- Bug i samlerabat-beregning ved 3 linjer
- Print-layout på Safari

---

## [9.2.0] - 2025-10-XX

### Added
- Forbedret streaming-vælger UI
- Flere abonnements-typer

### Changed
- Opdateret priser

---

## [9.1.0] - 2025-10-XX

### Added
- Dark mode toggle
- Print stylesheet

### Fixed
- Responsive design på tablets

---

## [9.0.0] - 2025-10-XX

### Added
- Første production-ready version
- Telenor samlerabat
- Streaming-vælger
- 6-måneders beregning

---

## Versioning Guide

### Version Numbers

Format: `MAJOR.MINOR.PATCH`

**MAJOR** (10.x.x):
- Breaking changes
- Arkitektur ændringer
- Nye required dependencies

**MINOR** (x.1.x):
- Nye features
- Nye UI-komponenter
- Backwards compatible

**PATCH** (x.x.1):
- Bug fixes
- Performance forbedringer
- Dokumentation opdateringer

### Change Categories

**✨ Added** - Nye features
**🔄 Changed** - Ændringer i eksisterende funktionalitet
**🗑️ Removed** - Fjernede features
**🐛 Fixed** - Bug fixes
**🔒 Security** - Sikkerhedsopdateringer
**📝 Deprecated** - Features der snart fjernes

### Unreleased

Kommende features under udvikling:

- [ ] TypeScript support (optional)
- [ ] Unit tests for business logic
- [ ] Animerede transitions mellem trin
- [ ] Sammenligning af flere scenarier side-om-side
- [ ] Export til PDF
- [ ] Multiple provider support (ikke kun Telenor)
- [ ] Lokalisering (engelsk version)
- [ ] Dark/light/auto mode
- [ ] Accessibility audit & fixes

### Contributing

Når du laver ændringer:

1. Opdatér denne CHANGELOG
2. Følg formatet ovenfor
3. Gruppér ændringer efter kategori
4. Inkludér breaking changes øverst
5. Link til relevante issues/PRs

---

**Se også:**
- [Quick Start](Quick-Start.md) - Kom i gang
- [GitHub Pages Setup](GitHub-Pages-Setup.md) - Deployment
- [Bidrag](Bidrag.md) - Sådan bidrager du

[← Tilbage til wiki](Home.md)


# Arkitektur

En dybdegående gennemgang af systemets tekniske arkitektur.

## 🏗️ Overordnet struktur

Projektet følger en modulær arkitektur med separation of concerns:

```
┌─────────────────────────────────────┐
│         index.html (View)           │
│   - HTML struktur                   │
│   - Semantisk markup                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       main.js (Controller)          │
│   - App initialisering              │
│   - Event handling (hotkeys)        │
│   - Theme toggle                    │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼─────┐   ┌─────▼──────┐
│   ui.js    │   │  state.js  │
│  (View)    │◄──┤  (Model)   │
│            │   │            │
│ - Render   │   │ - State    │
│ - Update   │   │ - Persist  │
│ - Events   │   │ - Share    │
└──────┬─────┘   └─────▲──────┘
       │               │
       └───────┬───────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────────┐   ┌────────▼──────┐
│  calc.js   │   │  providers.js │
│ (Business) │   │   (Data)      │
│            │   │               │
│ - 500 kr   │   │ - Telenor     │
│ - Total    │   │ - Rabatter    │
└────────────┘   └───────────────┘
                 
    ┌────────────┐
    │ streams.js │
    │  (Data)    │
    │            │
    │ - Services │
    │ - Priser   │
    └────────────┘
```

## 📦 Modul oversigt

### 1. **main.js** - App Bootstrap
- **Rolle:** Entry point og koordinator
- **Ansvar:**
  - Initialiserer app ved page load
  - Opsætter globale event listeners (hotkeys)
  - Håndterer theme toggle
  - Loader state fra URL-parametre
- **Dependencies:** state.js, ui.js

### 2. **state.js** - State Management
- **Rolle:** Single source of truth
- **Ansvar:**
  - Holder app-state (lines, streams, provider)
  - Serialisering til/fra URL-parametre
  - Reset functionality
- **Dependencies:** Ingen
- **Pattern:** Singleton med getter/setter

```javascript
State = {
  provider: 'telenor',
  periodMonths: 6,
  household: { lines: [] },
  streams: {}
}
```

### 3. **ui.js** - View Layer
- **Rolle:** DOM manipulation og rendering
- **Ansvar:**
  - Renderer step-by-step UI
  - Håndterer form inputs
  - Opdaterer DOM ved state-ændringer
  - Navigation mellem trin
- **Dependencies:** state.js, calc.js, streams.js
- **Pattern:** Presenter/View

### 4. **calc.js** - Business Logic
- **Rolle:** Beregningsmotor
- **Ansvar:**
  - Beregner 6-måneders totaler
  - Validerer 500 kr minimum regel
  - Genererer forslag ved ikke-opfyldelse
  - Sammenstiller data fra providers + streams
- **Dependencies:** providers.js, streams.js
- **Output:**
```javascript
{
  baseMonthlyCost: number,
  baseTotal6m: number,
  providerBenefits: object,
  streamsData: object,
  totalAfterDiscount6m: number,
  total6mWithStreams: number,
  savings6m: number,
  meetsMinSavings: boolean,
  suggestions: string[],
  summary: object
}
```

### 5. **providers.js** - Provider Rules
- **Rolle:** Udbyderspecifik logik
- **Ansvar:**
  - Telenor samlerabat tiers
  - Rabatberegning baseret på antal linjer
  - Basis omkostningsberegning
- **Dependencies:** Ingen
- **Data-driven:** Rabat-tiers i datastrukturer

### 6. **streams.js** - Streaming Services
- **Rolle:** Streaming-tjenester database
- **Ansvar:**
  - Liste over tjenester (navn, pris, ikon, farve)
  - Beregning af streaming-totaler
  - Filtrering af valgte tjenester
- **Dependencies:** Ingen
- **Data:**
```javascript
{
  id: 'netflix',
  label: 'Netflix',
  monthlyPrice: 119,
  icon: '🎬',
  color: '#e50914'
}
```

## 🔄 Data Flow

### 1. User Interaction Flow
```
Bruger input
    ↓
ui.js (event handler)
    ↓
setState() i state.js
    ↓
render() i ui.js
    ↓
calculateAll() i calc.js
    ↓
DOM update
```

### 2. Calculation Flow
```
getState()
    ↓
computeBaseMonthlyCost()
    ↓
computeProviderBenefits()
    ↓
computeStreamsTotal()
    ↓
Validate 500 kr regel
    ↓
Return resultat
```

### 3. Share/Load Flow
```
toShareLink()
    ↓
URLSearchParams
    ↓
Clipboard/URL
    
    ↓ (senere)
    
fromShareLink()
    ↓
Parse params
    ↓
setState()
    ↓
render()
```

## 🎨 CSS Architecture

### CSS Custom Properties (Variables)
```css
:root {
  /* Brand */
  --brand: #ff6b1a;
  
  /* Backgrounds */
  --bg: #0a0f1c;
  --bg-glass: rgba(255, 255, 255, 0.06);
  
  /* Text */
  --text-primary: #f8fafc;
  
  /* Status */
  --good: #10b981;
  --bad: #ef4444;
}
```

### Theme System
```
[data-theme="light"] → overskriver variabler
[data-theme="dark"] → standard
```

### Component Structure
- **Layout:** Flexbox + CSS Grid
- **Responsive:** Mobile-first med media queries
- **Print:** Separat @media print stylesheet

## 🔒 Design Patterns

### 1. Module Pattern
Hver fil er et ES-module med eksporterede funktioner:
```javascript
export function calculateAll(state) { ... }
```

### 2. State Management Pattern
Centraliseret state med controlled mutations:
```javascript
// ✅ Korrekt
setState({ streams: newStreams })

// ❌ Undgå
appState.streams = newStreams
```

### 3. Pure Functions
Business logic er pure functions (ingen side effects):
```javascript
// Input → Processing → Output
function computeProviderBenefits(state) {
  return { discount, notes }
}
```

### 4. Data-Driven Configuration
Forretningsregler i data, ikke hardcoded:
```javascript
const TIERS = [
  { minLines: 4, discount: 200 },
  { minLines: 3, discount: 150 }
]
```

## 📱 Responsive Design

### Breakpoints
- **Desktop:** > 768px (default)
- **Mobile:** ≤ 768px

### Mobile Adaptations
- Stack navigation buttons
- Smaller streaming grid (2 kolonner)
- Reduced padding
- Larger touch targets

## 🖨️ Print Optimization

### Print Media Query
```css
@media print {
  /* Skjul navigation */
  header, footer, .nav-buttons { display: none; }
  
  /* Tilpas farver */
  body { background: white; color: black; }
  
  /* A4-optimering */
  .result-card { page-break-inside: avoid; }
}
```

## ⚡ Performance

### Optimizations
1. **Ingen external dependencies** - Alt loads lokalt
2. **CSS-variabler** - Hurtig theme-switching
3. **Event delegation** - Effektiv event handling
4. **Minimal re-renders** - Kun opdater når state ændres
5. **Lazy loading** - Ingen unødvendig pre-loading

### Bundle Size
- **Total:** ~50 KB (unminified)
- **HTML:** ~5 KB
- **CSS:** ~15 KB
- **JavaScript:** ~30 KB

## 🔐 Security

### No External Calls
- Ingen API calls
- Ingen tracking
- Ingen external scripts
- Data forbliver i browseren

### URL Parameters
- Read-only ved load
- Ingen sensitive data
- Client-side only

## 🧪 Testability

### Pure Functions
Business logic er testbar uden DOM:
```javascript
const result = calculateAll(mockState)
expect(result.savings6m).toBe(600)
```

### Decoupled Modules
Hvert modul kan testes isoleret.

## 📈 Skalerbarhed

### Tilføj ny udbyder
1. Tilføj tier-data i `providers.js`
2. Implementer `computeXProviderBenefits()`
3. Switch i `calc.js`

### Tilføj ny streaming-tjeneste
1. Tilføj objekt i `STREAMING_SERVICES` array
2. Appen opdaterer automatisk UI

### Tilføj ny validering
1. Tilføj check i `calculateAll()`
2. Returnér suggestions ved fejl

---

[← Tilbage til wiki](Home.md) | [Næste: Modul Reference →](Modul-Reference.md)


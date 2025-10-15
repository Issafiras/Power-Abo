# Konfigurationsguide

Lær hvordan du tilpasser priser, rabatter og regler i systemet.

## 🎯 Hvad kan konfigureres?

- ✅ Streaming-tjenester (priser, ikoner, farver)
- ✅ Telenor samlerabat tiers
- ✅ Minimum besparelseskrav
- ✅ Mobilabonnementer og priser
- ✅ Periode (standard 6 måneder)
- ✅ Farver og branding

## 📺 Streaming-tjenester

### Fil: `assets/js/streams.js`

### Tilføj ny tjeneste

```javascript
export const STREAMING_SERVICES = [
  // Eksisterende tjenester...
  
  // Tilføj ny:
  {
    id: 'youtubepremium',           // Unikt ID
    label: 'YouTube Premium',       // Visningsnavn
    monthlyPrice: 119,              // Pris pr. måned
    icon: '▶️',                     // Emoji-ikon
    color: '#ff0000'                // Brand-farve (hex)
  }
]
```

### Opdatér priser

Find tjenesten og ændr `monthlyPrice`:

```javascript
{
  id: 'netflix',
  label: 'Netflix',
  monthlyPrice: 129,  // Tidligere: 119
  icon: '🎬',
  color: '#e50914'
}
```

### Fjern tjeneste

Slet hele objektet fra `STREAMING_SERVICES` arrayet.

## 📱 Telenor Samlerabat

### Fil: `assets/js/providers.js`

### Rabat-tiers

```javascript
const TELENOR_DISCOUNT_TIERS = [
  { minLines: 4, monthlyDiscount: 200, label: '4+ linjer' },
  { minLines: 3, monthlyDiscount: 150, label: '3 linjer' },
  { minLines: 2, monthlyDiscount: 100, label: '2 linjer' },
  { minLines: 1, monthlyDiscount: 0, label: '1 linje' }
]
```

### Ændr rabatbeløb

```javascript
// Eksempel: Øg rabat for 4+ linjer til 250 kr/md
{ minLines: 4, monthlyDiscount: 250, label: '4+ linjer' }
```

### Tilføj ny tier

```javascript
// Eksempel: Special rabat for 5+ linjer
const TELENOR_DISCOUNT_TIERS = [
  { minLines: 5, monthlyDiscount: 300, label: '5+ linjer' },  // NY!
  { minLines: 4, monthlyDiscount: 200, label: '4+ linjer' },
  // ... resten
]
```

**Vigtigt:** Tiers skal være sorteret fra højeste til laveste `minLines`!

## 💰 Minimum Besparelse

### Fil: `assets/js/calc.js`

Find linjen:

```javascript
const MIN_SAVINGS = 500 // Minimum besparelse over 6 måneder
```

Ændr til ønsket beløb:

```javascript
const MIN_SAVINGS = 750 // Nu kræves 750 kr
```

## 📅 Periode

### Standard periode

Ændr i `assets/js/state.js`:

```javascript
let appState = {
  provider: 'telenor',
  periodMonths: 12,  // Ændret fra 6 til 12 måneder
  // ...
}
```

**OBS:** Dette påvirker alle beregninger!

## 📞 Mobilabonnementer

### Fil: `assets/js/ui.js`

Find funktionen `renderStep1()` og opdatér `<select>`-optionerne:

```javascript
<select id="line-plan">
  <option value="">Vælg abonnement</option>
  <option value="basic:199">Basic (10 GB) - 199 kr/md</option>
  <option value="standard:299">Standard (50 GB) - 299 kr/md</option>
  <option value="premium:399">Premium (Fri data) - 399 kr/md</option>
  
  <!-- Tilføj ny: -->
  <option value="ultra:499">Ultra (Fri data + 5G) - 499 kr/md</option>
</select>
```

Format: `value="planType:pris"`

## 🎨 Branding & Farver

### Fil: `assets/css/styles.css`

### Brand-farve

```css
:root {
  --brand: #ff6b1a;        /* Primær brand-farve */
  --brand-light: #ff8a4a;  /* Lysere variant */
  --brand-dark: #e55a2b;   /* Mørkere variant */
}
```

### Status-farver

```css
:root {
  --good: #10b981;   /* Succes/Positiv */
  --bad: #ef4444;    /* Fejl/Negativ */
  --telenor: #0ea5e9; /* Telenor brand */
}
```

### Light mode farver

```css
[data-theme="light"] {
  --bg: #fafbfc;           /* Baggrund */
  --text-primary: #0f172a; /* Tekst */
  --muted: #64748b;        /* Dæmpet tekst */
}
```

## 🌐 Sprog & Tekster

### Titel & Beskrivelse

**Fil:** `index.html`

```html
<title>POWER | 6-måneders familieløsning (mobil)</title>
<meta name="description" content="Din beskrivelse her..." />
```

### Trin-labels

**Fil:** `assets/js/ui.js`

```javascript
function renderStepIndicator() {
  container.innerHTML = `
    <div class="step ${currentStep === 1 ? 'active' : ''}">1. Mobil</div>
    <div class="step ${currentStep === 2 ? 'active' : ''}">2. Streaming</div>
    <div class="step ${currentStep === 3 ? 'active' : ''}">3. Resultat</div>
  `
}
```

### Fejlbeskeder

**Fil:** `assets/js/calc.js`

```javascript
if (!meetsMinSavings && household.lines.length > 0) {
  suggestions.push(`Du mangler ${deficit} kr i besparelse`)
  suggestions.push('Tilføj flere linjer for højere samlerabat')
  // ... tilføj flere forslag
}
```

## 🔧 Avanceret Konfiguration

### Tilføj ny udbyder (ikke Telenor)

1. **Tilføj i `providers.js`:**

```javascript
export function computeProviderBenefits(state) {
  const { provider, household, periodMonths } = state
  
  if (provider === 'telenor') {
    // Eksisterende Telenor-logik
  } else if (provider === 'telia') {  // NY!
    return computeTeliaDiscount(household, periodMonths)
  }
}

function computeTeliaDiscount(household, months) {
  // Telia-specifik rabatlogik her
  return {
    monthlyDiscount: 50,
    totalDiscount6m: 50 * months,
    notes: ['Telia basispris rabat']
  }
}
```

2. **Tilføj valgmulighed i UI** (`ui.js`):

```javascript
<select id="provider">
  <option value="telenor">Telenor</option>
  <option value="telia">Telia</option>
</select>
```

### Custom validering

Tilføj i `calc.js` → `calculateAll()`:

```javascript
// Efter eksisterende validering:
if (household.lines.length > 10) {
  suggestions.push('Maksimum 10 linjer tilladt')
}

if (streamsData.total6m > 5000) {
  suggestions.push('Streaming-udgifter er meget høje')
}
```

## 📝 Eksempel: Komplet tilpasning

Lad os sige du vil:
- Ændre til 12 måneders periode
- Øge minimum besparelse til 1000 kr
- Tilføje YouTube Premium
- Ændre brand-farve til blå

### 1. `state.js`
```javascript
periodMonths: 12
```

### 2. `calc.js`
```javascript
const MIN_SAVINGS = 1000
```

### 3. `streams.js`
```javascript
{
  id: 'youtube',
  label: 'YouTube Premium',
  monthlyPrice: 119,
  icon: '▶️',
  color: '#ff0000'
}
```

### 4. `styles.css`
```css
--brand: #0066cc;
```

### Test ændringer

```bash
python3 -m http.server 5173
```

Åbn [http://localhost:5173](http://localhost:5173) og verificér!

## ✅ Checklist efter ændringer

- [ ] Test alle 3 trin i UI
- [ ] Verificér beregninger er korrekte
- [ ] Tjek at 500 kr regel stadig fungerer
- [ ] Test print-visning
- [ ] Test light/dark mode
- [ ] Verificér på mobil
- [ ] Commit ændringer til git

## 🐛 Almindelige fejl

### Syntaks-fejl i JavaScript
```javascript
// ❌ Forkert (mangler komma)
{ id: 'test', price: 100 }
{ id: 'test2', price: 200 }

// ✅ Korrekt
{ id: 'test', price: 100 },
{ id: 'test2', price: 200 }
```

### Tier-sortering
```javascript
// ❌ Forkert rækkefølge
{ minLines: 2, discount: 100 },
{ minLines: 4, discount: 200 }

// ✅ Korrekt (højeste først)
{ minLines: 4, discount: 200 },
{ minLines: 2, discount: 100 }
```

### Farve-format
```css
/* ✅ Korrekt */
--brand: #ff6b1a;

/* ❌ Forkert */
--brand: ff6b1a;  /* Mangler # */
--brand: orange;  /* Brug hex i stedet */
```

---

[← Tilbage til wiki](Home.md) | [Næste: Modul Reference →](Modul-Reference.md)


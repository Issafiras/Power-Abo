# Tastaturgenveje

Komplet oversigt over alle keyboard shortcuts i systemet.

## ⌨️ Hovedgenveje

| Tast | Funktion | Beskrivelse |
|------|----------|-------------|
| `1` | Trin 1 | Spring direkte til Mobil-trin |
| `2` | Trin 2 | Spring direkte til Streaming-trin |
| `3` | Trin 3 | Spring direkte til Resultat-trin |
| `←` | Forrige | Gå til forrige trin |
| `→` | Næste | Gå til næste trin |

## 🎬 Actions

| Tast | Funktion | Beskrivelse |
|------|----------|-------------|
| `R` | Reset | Nulstil alt (kræver bekræftelse) |
| `S` | Share/Del | Kopiér delingslink til clipboard |
| `P` | Print | Åbn print-dialog |
| `?` | Hjælp | Vis genveje-modal |
| `ESC` | Luk | Luk åben modal |

## 📱 Kontekst-afhængig

### I input-felter

Når du har fokus i et input-felt (f.eks. "Tilføj linje"):
- ⚠️ Genveje er **DEAKTIVEREDE**
- Tryk `Tab` for at navigere mellem felter
- Tryk `Enter` for at indsende form (tilføj linje)
- Tryk `ESC` for at fjerne fokus

### På resultat-siden (Trin 3)

Yderligere funktioner tilgængelige:
- `P` - Print resultat
- `S` - Del resultat
- `R` - Start forfra

## 🎯 Power User Tips

### Hurtig beregning

Den hurtigste måde at lave en fuld beregning:

```
1. Tilføj linjer i Trin 1
2. Tryk → (eller 2)
3. Klik på streaming-tjenester
4. Tryk → (eller 3)
5. Se resultat
6. Tryk P for at printe
```

### Sammenligning af scenarier

Vil du sammenligne forskellige setups?

```
1. Lav første beregning
2. Tryk S for at gemme link
3. Tryk R for at nulstille
4. Lav anden beregning
5. Åbn første link i ny tab
```

### Navigation uden mus

Komplet keyboard-only workflow:

```
1. Tab gennem felter i Trin 1
2. Enter for at tilføje linjer
3. → for at gå videre
4. Tab + Space for at vælge streaming
5. → for resultat
6. P for print / S for share
```

## 🔧 Teknisk implementation

### Event Listener

Genveje håndteres i `main.js`:

```javascript
document.addEventListener('keydown', (e) => {
  if (e.target.matches('input, select, textarea')) {
    return // Ignorer når der skrives
  }
  
  const key = e.key.toLowerCase()
  
  if (key === '1') ui.setStep(1)
  else if (key === '2') ui.setStep(2)
  // ...
})
```

### Deaktivering i inputs

For at undgå konflikt med normal tekstindtastning:

```javascript
// Tjek om fokus er i input-felt
if (e.target.matches('input, select, textarea')) {
  return // Ignorer genveje
}
```

## 🌐 Browser-kompatibilitet

### Understøttede browsere

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Fuld support |
| Firefox | 88+ | ✅ Fuld support |
| Safari | 14+ | ✅ Fuld support |
| Edge | 90+ | ✅ Fuld support |

### Kendte begrænsninger

**Safari < 14:**
- Clipboard API muligvis ikke tilgængelig (S-genvej)
- Fallback til prompt-dialog

**Internet Explorer:**
- ❌ Ikke understøttet
- Brug moderne browser

## ⚠️ Konflikt-håndtering

### Standard browser-genveje

Nogle genveje kan konflikte med browser:

| Genvej | Browser-funktion | Status |
|--------|------------------|--------|
| `Ctrl+P` | Print | ✅ Bruger browser-print |
| `Ctrl+S` | Gem side | ⚠️ Vi fanger kun `S` |
| `F1` | Hjælp | Ikke brugt |

**Løsning:** Vi bruger kun simple taster uden modifiers (Ctrl/Cmd).

### OS-specifikke genveje

**macOS:**
- `Cmd` + taster bruges ikke
- Kun simple taster som `1`, `2`, `R`, etc.

**Windows/Linux:**
- `Ctrl` + taster bruges ikke
- Samme simple taster som macOS

## 🎨 Visuel feedback

### Shortcuts modal

Tryk `?` for at se modal med alle genveje:

- 📋 Komplet liste
- 🎯 Grupperet efter funktion
- 💡 Visuelle tastetegn

### Hover-tooltips

Visse knapper viser genveje ved hover:

```html
<button title="Print (P)">🖨️ Print</button>
```

## 📱 Mobile & Touch

### Touch-optimering

På touch-devices (mobil/tablet):
- ⚠️ Genveje fungerer IKKE (ingen fysisk tastatur)
- 👆 Brug touch-navigation i stedet
- 🎯 Større touch-targets

### Software-keyboard

Når software-keyboard er åbent:
- Genveje er deaktiverede i input-felter
- Luk keyboard for at aktivere genveje

## 🧪 Test genveje

### Hurtig test

```
1. Åbn siden
2. Tryk 1, 2, 3 - tjek at trin skifter
3. Tryk → og ← - tjek navigation
4. Tryk ? - tjek at modal åbnes
5. Tryk ESC - tjek at modal lukkes
6. Tryk R - tjek at reset fungerer
```

### Regression testing

Efter kode-ændringer:

- [ ] Test i alle understøttede browsere
- [ ] Test på både desktop og mobil
- [ ] Verificér at input-felter ikke trigger genveje
- [ ] Tjek konflikt med browser-genveje

## 💡 Tilpasning

### Tilføj nye genveje

I `main.js`, tilføj i event listener:

```javascript
else if (key === 'n') {  // Ny genvej
  // Din funktion her
  doSomething()
}
```

### Ændr eksisterende

Find relevant genvej og opdatér:

```javascript
// Før: Tryk R for reset
else if (key === 'r') { reset() }

// Efter: Tryk N for reset
else if (key === 'n') { reset() }
```

### Deaktivér genveje

Kommenter ud eller slet relevant kode:

```javascript
// Deaktivér print-genvej
// else if (key === 'p') { window.print() }
```

## 📋 Checklist for power users

Kender du alle genveje? Test dig selv:

- [ ] Kan springe til alle 3 trin
- [ ] Kan navigere frem/tilbage
- [ ] Ved hvordan man nulstiller
- [ ] Ved hvordan man deler
- [ ] Ved hvordan man printer
- [ ] Kan åbne hjælp-modal
- [ ] Ved hvordan man lukker modal

🏆 Alle checked? Du er en power user!

## 🔗 Relateret

- [Brugerguide](Brugerguide.md) - Fuld brugerguide
- [FAQ](FAQ.md) - Ofte stillede spørgsmål
- [Arkitektur](Arkitektur.md) - Teknisk implementation

---

[← Tilbage til wiki](Home.md)


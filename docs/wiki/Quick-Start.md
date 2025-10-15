# Quick Start Guide

Kom i gang med POWER's 6-måneders familieløsning på under 5 minutter!

## 🎯 Hvad er dette?

Et værktøj til at beregne din families samlede mobil- og streaming-omkostninger over 6 måneder, med automatisk beregning af Telenor samlerabat.

## 🚀 Start lokalt (ingen installation)

### 1. Download projektet

```bash
git clone https://github.com/Issafiras/Power-Abo.git
cd Power-Abo
```

### 2. Start en webserver

**Python (anbefalet):**
```bash
python3 -m http.server 5173
```

**Node.js:**
```bash
npx http-server -p 5173
```

**PHP:**
```bash
php -S localhost:5173
```

### 3. Åbn i browser

Gå til [http://localhost:5173](http://localhost:5173)

## 📝 Brug systemet (3 trin)

### Trin 1: Tilføj mobillinjer

1. Indtast navn (f.eks. "Mor", "Far", "Barn 1")
2. Vælg abonnement (Basic, Standard eller Premium)
3. Klik "Tilføj linje"
4. Gentag for alle familiemedlemmer

💡 **Tip:** Minimum 2 linjer giver Telenor samlerabat!

### Trin 2: Vælg streaming-tjenester

1. Klik på de tjenester familien bruger
2. Klik flere gange for at tilføje flere abonnementer (max 5)
3. Se total opdateres i realtid

### Trin 3: Se resultatet

- ✅ Samlet omkostning over 6 måneder
- 💰 Total besparelse med Telenor samlerabat
- 📊 Detaljeret opdeling
- ⚠️ Advarsler hvis minimum 500 kr besparelse ikke nås

## ⌨️ Hurtige genveje

| Tast | Gør dette |
|------|-----------|
| `1`, `2`, `3` | Spring til trin |
| `→` | Næste trin |
| `←` | Forrige trin |
| `R` | Reset alt |
| `S` | Del resultat |
| `P` | Print |

## 🎨 Skift tema

Klik på 🌙/☀️-ikonet i øverste højre hjørne.

## 📤 Del dit resultat

1. Når du er på trin 3 (Resultat)
2. Tryk `S` eller klik "Del"
3. Link kopieres automatisk
4. Send til kunde/kollega

## 🖨️ Print resultat

1. Gå til trin 3 (Resultat)
2. Tryk `P` eller klik "Print"
3. Vælg printer eller "Gem som PDF"

## ❓ Problemer?

### Siden vises ikke korrekt
- Tjek at du kører en webserver (ikke bare åbner `index.html` direkte)
- Prøv en anden browser (Chrome, Firefox, Safari)

### JavaScript-fejl
- Åbn browser console (F12) og tjek fejlmeddelelser
- Sørg for at alle filer er downloadet korrekt

### Minimum besparelse ikke nået
- Tilføj flere mobillinjer (2+ giver rabat)
- Reducer antal streaming-tjenester
- Vælg billigere mobilabonnementer

## 📚 Næste skridt

- [Fuld brugerguide](Brugerguide.md)
- [Konfigurér priser](Konfiguration.md)
- [Deploy til GitHub Pages](GitHub-Pages-Setup.md)

---

[← Tilbage til wiki](Home.md)


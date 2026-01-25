# Power Abo Beregner 2.2 🚀

**Det ultimative salgsværktøj til POWER-huset.**

Dette værktøj transformerer kompleksiteten ved mobilabonnementer, bredbånd og streaming til en enkel, lynhurtig og visuelt overbevisende beregning. Det er bygget til at lukke salget – direkte på gulvet.

---

## 🔥 Nye Features i v2.2 (Januar 2026)

### 🏗️ TypeScript Motor
Hele beregningsmotoren er nu fuldt migreret til **TypeScript**.
- Sikrer 100% præcision i prisberegninger.
- Fanger fejl i datatyper (f.eks. forkerte prisformater) før de når kunden.
- Gør koden ekstremt robust og nem at vedligeholde.

### 🎨 Flydende Animationer (Framer Motion)
Brugeroplevelsen har fået et stort løft med moderne animationer.
- **Voksende Grafer:** Se besparelsen vokse frem visuelt.
- **Interaktive Kort:** Abonnementskort reagerer på berøring og mus for en premium følelse.
- **Smooth transitions:** Alle overgange mellem streaming-tjenester og kurv-ændringer sker nu flydende.

### 📱 Mobil-optimering & Sticky Summary
Designet specifikt til butikkens tablets og sælgernes telefoner.
- **Sticky Bottom Bar:** Hav altid kundens aktuelle besparelse og din indtjening lige ved hånden, uanset hvor langt du scroller.
- **Swipe-venlige tabeller:** Horisontal scroll på sammenligninger sikrer læsbarhed på alle skærmstørrelser.
- **Touch-optimering:** Alle knapper følger WCAG AAA standarder for touch-størrelse (min. 44px).

---

## 📱 Kernefeatures fra v2.1

- **Effektiv Hardware Pris (TCO):** Trækker 6 måneders besparelse fra hardwareprisen.
- **♻️ RePOWER Indbytning:** Integreret indbytningsberegner.
- **📲 QR Deling:** Lad kunden scanne en kode og tage hele beregningen med hjem.
- **⚡ 100% Offline:** Kører udelukkende i browseren uden brug af database.

---

## ⌨️ Tastaturgenveje

Spar tid med disse pro-genveje:

| Genvej | Funktion |
|--------|----------|
| `Ctrl + R` | **Nulstil alt** (Ny kunde) |
| `Ctrl + P` | Toggle **Præsentations-mode** |
| `F8` | Vis/Skjul **Indtjening** (Provision) |
| `Ctrl + T` | Skift Tema (Lys/Mørk) |
| `Esc` | Luk vinduer/modals |

---

## 👨‍💻 Teknisk Info (For Udviklere)

Applikationen er en moderne **Single Page Application (SPA)** bygget på React 18 og TypeScript.

- **Stack:** React, Vite 5, TypeScript, Framer Motion.
- **State:** React Context + useReducer.
- **Persistence:** LocalStorage.
- **Testing:** Vitest (67+ unit tests validerer alle beregninger).

### Installation

```bash
# 1. Klon repo
git clone https://github.com/Issafiras/Power-Abo.git

# 2. Installer dependencies
npm install

# 3. Start udviklingsserver
npm run dev
```

---

*Udviklet internt til POWER. Må ikke distribueres eksternt.*

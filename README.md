# Power Abo Beregner 2.1 🚀

**Det ultimative salgsværktøj til POWER-huset.**

Dette værktøj transformerer kompleksiteten ved mobilabonnementer, bredbånd og streaming til en enkel, lynhurtig og visuelt overbevisende beregning. Det er bygget til at lukke salget – direkte på gulvet.

---

## 🔥 Nye Features i v2.1

### 📱 Effektiv Hardware Pris (TCO)
Vis kunden den *reelle* pris på deres nye iPhone eller Samsung.
- Beregneren trækker automatisk 6 måneders besparelse fra telefonens pris.
- Resultat: En markant lavere pris, der gør det nemmere at lukke hardware-salget.

### ♻️ RePOWER Indbytning
Integreret indbytningsberegner.
- Indtast værdien af kundens gamle enhed direkte i flowet.
- Beløbet modregnes med det samme i totalprisen som en kontant rabat.

### 📲 QR Deling ("Tag tilbuddet med hjem")
Kunden skal lige tænke over det? Intet problem.
- Klik på **Del** ikonet i toppen.
- Kunden scanner QR-koden.
- Hele beregningen åbner på kundens egen telefon – præcis som den ser ud på din skærm.
- Ingen installation, ingen login, ingen server. Ren magi.

### ⚡ Lynhurtig & Offline
- **Ingen ventetid:** Vi har fjernet den gamle database-backend.
- **Lokal:** Alt kører 100% i browseren.
- **PWA:** Kan installeres som en app på iPad/PC og virker uden internet.

---

## 🛠️ Funktioner

### For Sælgeren
- **EAN Søgning:** Lynhurtigt opslag af produkter via Power.dk integration.
- **Indtjenings-overblik:** Tryk `F8` for at se din provision på den valgte løsning (skjult for kunden).
- **Auto-Match:** Systemet foreslår automatisk den bedste pakke baseret på kundens nuværende forbrug.
- **CBB MIX:** Automatisk håndtering af komplekse streaming-regler (2-8 tjenester).
- **Familierabat:** Telenors samlerabat beregnes automatisk.

### For Kunden
- **Visuelt Overblik:** Grafer og simple tal, der er til at forstå.
- **Præsentations-mode (`Ctrl + P`):** Skjuler alt "sælger-støj" og viser kun det, kunden skal forholde sig til.
- **Besparelse:** Krystalklar visning af besparelse over 6 måneder.

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

Applikationen er en moderne **Single Page Application (SPA)** bygget på React 18.

- **Stack:** React, Vite 5, CSS Modules.
- **State:** React Context + useReducer (Redux-like pattern uden boilerplate).
- **Persistence:** LocalStorage (Ingen backend/database kræves).
- **Sharing:** URL-baseret state encoding (LZ-string/Base64) via `src/utils/share.js`.

### Installation

```bash
# 1. Klon repo
git clone https://github.com/Issafiras/Power-Abo.git

# 2. Installer dependencies
npm install

# 3. Start udviklingsserver
npm run dev
```

### Projektstruktur

- `src/data/plans.js`: Her ligger alle abonnementer og priser. Ret her for at opdatere priser.
- `src/utils/calculations/`: Al forretningslogik (rabatter, TCO, provision).
- `src/components/`: Genbrugelige UI-komponenter.
- `GEMINI.md`: Detaljeret arkitekturbeskrivelse for AI-assistenter.

---

## 🔒 Privatliv & Sikkerhed

- **Ingen Tracking:** Vi gemmer ingen data om kunden på nogen server.
- **Lokalt:** Alt bliver i browserens `localStorage`.
- **Sletning:** Data slettes automatisk, når du trykker "Nulstil alt" eller rydder browserdata.

---

*Udviklet internt til POWER. Må ikke distribueres eksternt.*
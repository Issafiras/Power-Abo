# FAQ - Ofte stillede spørgsmål

## 📋 Generelt

### Hvad er dette projekt?
En webapp til at beregne familiens samlede mobil- og streaming-omkostninger over 6 måneder, med automatisk beregning af Telenor samlerabat.

### Koster det noget at bruge?
Nej, projektet er gratis og open source.

### Fungerer det offline?
Ja, efter første load. Alle filer er lokale og der er ingen eksterne afhængigheder.

### Hvilke browsere understøttes?
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🔧 Teknisk

### Hvorfor ingen framework?
For at holde projektet simpelt, hurtigt og let at vedligeholde. Ingen build-process, ingen dependencies.

### Kan jeg bruge dette i produktion?
Ja! Projektet er produktionsklar og kan deployes til GitHub Pages eller enhver static hosting.

### Hvordan opdaterer jeg?
```bash
git pull origin main
```

### Kan jeg lave en fork?
Ja, projektet er open source. Fork og tilpas efter behov.

## 💰 Beregninger

### Hvordan beregnes Telenor samlerabat?
Baseret på antal linjer:
- 2 linjer: 100 kr/md rabat
- 3 linjer: 150 kr/md rabat
- 4+ linjer: 200 kr/md rabat

### Hvad er "minimum 500 kr besparelse"?
En regel der sikrer at den samlede besparelse over 6 måneder er mindst 500 kr. Hvis ikke, vises forslag til forbedring.

### Hvorfor 6 måneder?
Det giver et realistisk perspektiv på samlede omkostninger. Perioden kan ændres i `state.js`.

### Inkluderer priserne moms?
Ja, alle priser er inklusiv moms.

## 🎨 Design & UI

### Hvordan skifter jeg tema?
Klik på 🌙/☀️-ikonet i øverste højre hjørne, eller tryk tema-knappen.

### Kan jeg ændre farverne?
Ja! Rediger CSS-variabler i `assets/css/styles.css`. Se [Konfigurationsguide](Konfiguration.md).

### Virker det på mobil?
Ja, designet er fully responsive og fungerer på alle skærmstørrelser.

### Kan jeg printe resultatet?
Ja, tryk `P` eller klik "Print". Du får en pæn A4-formateret udskrift.

## 📱 Mobillinjer

### Hvor mange linjer kan jeg tilføje?
Teknisk ingen grænse, men Telenor samlerabat maksimeres ved 4+ linjer.

### Kan jeg redigere en linje?
Ikke direkte. Fjern den (×) og tilføj den igen med nye oplysninger.

### Hvad hvis jeg ikke husker priserne?
Du kan vælge mellem de mest almindelige abonnementer i dropdown-menuen.

## 📺 Streaming

### Hvilke tjenester understøttes?
- Netflix
- HBO Max
- TV2 Play
- Viaplay
- Disney+
- SkyShowtime
- Prime Video
- Musik (Spotify/etc)

### Kan jeg tilføje flere?
Ja! Se [Konfigurationsguide](Konfiguration.md) for hvordan.

### Hvorfor kan jeg klikke flere gange på samme tjeneste?
For at tillade flere abonnementer af samme type (f.eks. hvis både forældre og børn har hver deres Netflix).

### Hvad er maksimum pr. tjeneste?
5 abonnementer af samme tjeneste.

## 🔗 Deling

### Hvordan deler jeg mit resultat?
1. Tryk `S` eller klik "Del"
2. Link kopieres automatisk
3. Send linket til modtageren

### Hvad indeholder linket?
URL-parametre med:
- Antal og type mobillinjer
- Valgte streaming-tjenester
- Udbyder (Telenor)

### Er data sikkert?
Ja, alt håndteres client-side. Ingen data sendes til servere.

### Kan andre ændre mit link?
Modtageren kan se dine valg og ændre dem lokalt, men det påvirker ikke dit originale link.

## ⌨️ Keyboard Shortcuts

### Hvilke genveje findes?
| Tast | Funktion |
|------|----------|
| `1`, `2`, `3` | Spring til trin |
| `←`, `→` | Naviger mellem trin |
| `R` | Reset alt |
| `S` | Del resultat |
| `P` | Print |
| `?` | Vis genveje |
| `ESC` | Luk modal |

### Virker genveje når jeg skriver?
Nej, de er deaktiveret når du har fokus i input-felter.

## 🚀 Deployment

### Hvordan deployer jeg til GitHub Pages?
Se [GitHub Pages Setup Guide](GitHub-Pages-Setup.md).

### Kan jeg bruge anden hosting?
Ja! Projektet er rent statisk og kan hostes hvor som helst:
- Netlify
- Vercel
- Cloudflare Pages
- AWS S3
- Egen server

### Kræver det HTTPS?
Nej, men anbefales for clipboard API (del-funktion).

## 🐛 Fejlfinding

### Siden er blank
- Tjek at du kører en webserver (ikke bare åbner `index.html`)
- Åbn browser console (F12) og tjek for fejl
- Verificér at alle filer er downloadet

### JavaScript-fejl
```
Uncaught SyntaxError: Unexpected token
```
**Løsning:** Tjek for syntaks-fejl i nylige ændringer. Brug VSCode eller linting.

### Beregninger ser forkerte ud
- Verificér priser i `streams.js` og `providers.js`
- Tjek at tiers er sorteret korrekt
- Kontrollér at periode matcher forventning (6 vs 12 mdr)

### Tema skifter ikke
- Tjek browser console for fejl
- Verificér at `theme-toggle` knappen findes
- Clear browser cache

### Del-funktion virker ikke
- Kræver HTTPS for clipboard API
- På HTTP får du en prompt i stedet
- Tjek at browser understøtter Clipboard API

## 📊 Data & Priser

### Hvor kommer priserne fra?
De er konfigureret i `streams.js` og kan opdateres efter behov.

### Er priserne aktuelle?
Priserne skal opdateres manuelt. Tjek leverandørers hjemmesider for aktuelle priser.

### Kan jeg ændre priserne?
Ja! Se [Konfigurationsguide](Konfiguration.md).

## 🔄 Opdateringer

### Hvordan får jeg nye features?
```bash
git pull origin main
```

### Hvordan ser jeg ændringer?
Tjek [Changelog](Changelog.md) for versionshistorik.

### Kan jeg foreslå features?
Ja! Opret et GitHub Issue med din idé.

## 💻 Udvikling

### Hvordan bidrager jeg?
Se [Bidrag til projektet](Bidrag.md).

### Kræver det Node.js eller npm?
Nej! Projektet bruger rent ES-modules uden build-process.

### Findes der tests?
Ikke endnu. Business logic (calc.js, providers.js) er pure functions der let kan testes.

### Kan jeg tilføje TypeScript?
Ja, men det ville kræve en build-process. Projektet er designet til at være bundle-free.

## 🎯 Best Practices

### Hvad er den anbefalede workflow?
1. Fork projektet
2. Clone lokalt
3. Lav ændringer
4. Test grundigt
5. Commit med beskrivende message
6. Push og opret Pull Request

### Hvordan håndterer jeg merge conflicts?
```bash
git pull --rebase origin main
# Løs konflikter
git rebase --continue
git push
```

### Skal jeg minificere koden?
Ikke nødvendigt for små projekter. For produktion kan du overveje det.

## 📞 Support

### Hvor får jeg hjælp?
1. Tjek denne FAQ
2. Læs [Troubleshooting](Troubleshooting.md)
3. Søg i GitHub Issues
4. Opret et nyt Issue

### Er der en Discord/Slack?
Ikke endnu. Brug GitHub Discussions for spørgsmål.

### Hvem vedligeholder projektet?
Se CONTRIBUTING.md for maintainers.

---

**Fandt du ikke svar?** [Opret et GitHub Issue](https://github.com/Issafiras/Power-Abo/issues) →

[← Tilbage til wiki](Home.md)


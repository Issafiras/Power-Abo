# GitHub Pages Deployment Guide

Komplet guide til at deploye dit projekt på GitHub Pages med GitHub Actions.

## 🎯 Forudsætninger

- ✅ Git installeret
- ✅ GitHub konto
- ✅ Repository oprettet
- ✅ Projektet pushed til main branch

## 🚀 Quick Setup (5 minutter)

### Trin 1: Verificér repository

Tjek at dit repo indeholder:
```
✅ index.html
✅ assets/css/styles.css
✅ assets/js/*.js
✅ .github/workflows/gh-pages.yml
```

### Trin 2: Aktivér GitHub Pages

1. Gå til dit repository på GitHub
2. Klik på **Settings** (øverst til højre)
3. Scroll ned til **Pages** i venstre menu
4. Under **Source**, vælg **GitHub Actions**
5. Gem ændringerne

![GitHub Pages Settings](https://docs.github.com/assets/cb-47267/images/help/pages/publishing-source-drop-down.png)

### Trin 3: Push til main

Workflow kører automatisk ved push til main:

```bash
git add .
git commit -m "feat: klar til deployment"
git push origin main
```

### Trin 4: Overvåg deployment

1. Gå til **Actions** tab i dit repository
2. Se workflow "Deploy to GitHub Pages" køre
3. Vent på grøn ✅ checkmark

### Trin 5: Besøg dit site!

Dit site er nu live på:
```
https://[username].github.io/[repo-name]/
```

For dette projekt:
```
https://issafiras.github.io/Power-Abo/
```

## 📋 Detaljeret Setup

### GitHub Actions Workflow

Filen `.github/workflows/gh-pages.yml` håndterer deployment automatisk:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: .

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Hvad sker der?

1. **Trigger:** Kører ved push til main eller manuel trigger
2. **Checkout:** Downloader koden
3. **Setup Pages:** Konfigurerer Pages miljø
4. **Upload:** Uploader alle filer som artifact
5. **Deploy:** Deployer til GitHub Pages

## 🔧 Konfiguration

### Custom Domain

Vil du bruge eget domæne? (f.eks. `power.example.com`)

1. Tilføj `CNAME` fil i roden:
```bash
echo "power.example.com" > CNAME
git add CNAME
git commit -m "feat: tilføj custom domain"
git push
```

2. Gå til repo **Settings** → **Pages**
3. Indtast dit custom domain
4. Konfigurér DNS hos din udbyder:
   ```
   Type: CNAME
   Name: power (eller @)
   Value: [username].github.io
   ```

### Base URL i kode

Hvis dit repo IKKE hedder dit brugernavn:
```
https://issafiras.github.io/Power-Abo/
                                ↑ dette er base path
```

Du skal muligvis tilpasse links:
```javascript
// I toShareLink()
return `${window.location.origin}${window.location.pathname}?${params}`
```

Dette håndteres automatisk i vores implementering! ✅

### HTTPS Enforcement

GitHub Pages serverer automatisk via HTTPS. For at tvinge HTTPS:

1. Gå til **Settings** → **Pages**
2. Enable **Enforce HTTPS** ✅

## 🐛 Troubleshooting

### Deployment fejler

**Problem:** Workflow fejler med permissions-fejl

**Løsning:**
1. Gå til **Settings** → **Actions** → **General**
2. Under "Workflow permissions"
3. Vælg **Read and write permissions**
4. Gem og re-run workflow

### 404 Not Found

**Problem:** GitHub Pages viser 404

**Løsning:**
1. Verificér at `index.html` findes i roden
2. Tjek at Pages er aktiveret
3. Vent 2-5 minutter efter deployment
4. Clear browser cache

### Assets loader ikke

**Problem:** CSS/JS filer 404'er

**Løsning:**
Tjek at stier er relative:
```html
<!-- ✅ Korrekt -->
<link rel="stylesheet" href="assets/css/styles.css">

<!-- ❌ Forkert -->
<link rel="stylesheet" href="/assets/css/styles.css">
```

### Workflow køres ikke

**Problem:** Ingen action ved push

**Løsning:**
1. Tjek at `.github/workflows/gh-pages.yml` findes
2. Verificér at du pusher til `main` branch
3. Tjek Actions er enabled i Settings

### Build tager lang tid

**Problem:** Deployment er langsom

**Løsning:**
- Første deployment tager 2-5 minutter
- Efterfølgende deployments er hurtigere (~1 min)
- Tjek Actions tab for detaljer

## 📊 Monitoring

### Tjek deployment status

**Via GitHub UI:**
```
Repository → Actions → Seneste workflow run
```

**Via commit:**
```
Repository → Commits → Se ✅/❌ ved sidste commit
```

### Logs

Klik på workflow run for at se:
- Checkout logs
- Upload logs
- Deployment logs
- Eventuelle fejl

## 🔄 Updates & Redeploy

### Automatisk deployment

Hver gang du pusher til main:
```bash
git add .
git commit -m "fix: opdatér priser"
git push origin main
```

### Manuel deployment

Trigger deployment uden at pushe:

1. Gå til **Actions** tab
2. Vælg "Deploy to GitHub Pages"
3. Klik **Run workflow**
4. Vælg branch (main)
5. Klik **Run workflow** (grøn knap)

## 🔒 Security

### Branch Protection

Beskyt main branch:

1. **Settings** → **Branches**
2. Add rule for `main`
3. Enable:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require deployments to succeed

### Environment Secrets

Har du brug for secrets? (API keys osv.)

1. **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
3. Brug i workflow:
```yaml
- name: Deploy
  env:
    API_KEY: ${{ secrets.API_KEY }}
```

**OBS:** Dette projekt har INGEN secrets - alt er client-side!

## 📈 Performance

### Caching

GitHub Pages cacher automatisk statiske assets:
- HTML: 10 min cache
- CSS/JS: 24 timer cache
- Images: 7 dage cache

### Invalidate Cache

Force reload hos brugere:
```html
<!-- Tilføj version til assets -->
<link rel="stylesheet" href="assets/css/styles.css?v=1.0.1">
<script type="module" src="assets/js/main.js?v=1.0.1"></script>
```

### Optimering

- ✅ Minificér CSS/JS for produktion
- ✅ Optimér billeder
- ✅ Enable Gzip (automatisk på GitHub Pages)

## 📱 Testing Production

### Før deployment
```bash
# Test lokalt først
python3 -m http.server 5173
```

### Efter deployment
- ✅ Test alle 3 trin
- ✅ Test på mobil
- ✅ Test dark/light mode
- ✅ Test print-funktion
- ✅ Test del-funktion
- ✅ Test keyboard shortcuts

## 🌐 Alternative Deployment

### Netlify

```bash
# Drag & drop projektet til Netlify
# Eller via CLI:
npm install -g netlify-cli
netlify deploy --prod --dir .
```

### Vercel

```bash
npm install -g vercel
vercel --prod
```

### Cloudflare Pages

1. Gå til Cloudflare Pages
2. Connect GitHub repository
3. Build settings:
   - Build command: `echo "No build needed"`
   - Output directory: `/`
4. Deploy!

## ✅ Checklist

Efter deployment, tjek:

- [ ] Site loader korrekt
- [ ] Alle assets (CSS/JS) loader
- [ ] Ingen console errors
- [ ] Responsive design fungerer
- [ ] Dark/light mode virker
- [ ] Print-funktion virker
- [ ] Del-funktion virker (HTTPS krævet)
- [ ] Keyboard shortcuts virker
- [ ] Alle 3 trin fungerer
- [ ] Beregninger er korrekte

## 📞 Hjælp

**Deployment fejler?**
1. Tjek [Troubleshooting](#-troubleshooting)
2. Tjek GitHub Actions logs
3. Søg i GitHub Issues
4. Opret nyt Issue

**Performance problemer?**
- Test med Lighthouse
- Tjek Network tab i DevTools
- Verificér caching headers

---

[← Tilbage til wiki](Home.md) | [Næste: Troubleshooting →](Troubleshooting.md)


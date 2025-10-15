# GitHub Pages Deployment Guide

## 🚀 Automatisk Deployment Setup

Dette repository er konfigureret til automatisk deployment via GitHub Actions.

### 📋 Forudsætninger

1. **Repository permissions**
   - GitHub Pages skal være aktiveret
   - Actions skal have write permissions
   - Pages source skal være "GitHub Actions"

2. **Branch protection**
   - Main branch skal være beskyttet
   - Require status checks skal være aktiveret

### 🔧 Setup Steps

#### 1. Aktiver GitHub Pages
```bash
# Gå til repository settings
# Settings → Pages → Source: GitHub Actions
```

#### 2. Konfigurer permissions
```bash
# Settings → Actions → General
# Workflow permissions: Read and write permissions
# Allow GitHub Actions to create and approve pull requests: ✅
```

#### 3. Push kode til main branch
```bash
git add .
git commit -m "feat: setup GitHub Pages with v10.0"
git push origin main
```

### 🏗️ Build Process

GitHub Actions workflow (`pages.yml`) kører automatisk og:

1. **Validerer struktur**
   - Tjekker at alle v10.0 filer eksisterer
   - Validerer JSON database filer
   - Verificerer HTML struktur

2. **Bygger optimeret version**
   - Kopierer v10.0 til build mappe
   - Tilføjer alle versioner for sammenligning
   - Opretter ny index.html med version selector

3. **Deployer til GitHub Pages**
   - Uploader build artifact
   - Deployer til Pages environment
   - Giver URL til deployment

### 📁 Build Struktur

```
build/
├── index.html              # Version selector landing page
├── power-calculator-v10.0/ # Moderne modulær version
│   ├── index.html
│   ├── css/styles.css
│   ├── js/
│   └── database/
├── power-calculator-v9.3.html
├── power-calculator-v9.2.html
├── power-calculator-v9.1.html
└── power-calculator-v9.0.html
```

### 🌐 Deployment URL

Efter deployment vil POWER Calculator være tilgængelig på:
```
https://issafiras.github.io/Power-Abo/
```

### 🔄 Workflow Triggers

Workflow kører automatisk på:
- ✅ Push til main branch
- ✅ Manuel trigger via GitHub UI
- ✅ Pull request merge til main

### 📊 Monitoring

Overvåg deployment status:
1. **Actions tab** - Se workflow status
2. **Pages tab** - Se deployment history
3. **Environment** - Se deployment logs

### 🐛 Troubleshooting

#### Deployment fejler
```bash
# Tjek workflow logs
# Actions → Deploy POWER Calculator → View logs

# Almindelige problemer:
# - Manglende filer
# - JSON syntax errors
# - Permission issues
```

#### Pages ikke opdateret
```bash
# Tjek environment status
# Settings → Pages → Environment

# Mulige løsninger:
# - Genkør workflow
# - Tjek branch protection rules
# - Verificer permissions
```

### 🔒 Security

- **Environment protection**: Pages environment er beskyttet
- **Branch protection**: Main branch kræver review
- **Secrets**: Ingen secrets nødvendige for denne deployment

### 📈 Performance

- **Build time**: ~2-3 minutter
- **Deployment time**: ~1-2 minutter
- **Cache**: GitHub Actions cacher dependencies
- **CDN**: GitHub Pages leverer via global CDN

### 🔄 Updates

For at opdatere POWER Calculator:

1. **Lokal udvikling**
   ```bash
   # Test lokalt først
   cd power-calculator-v10.0
   python3 -m http.server 8080
   ```

2. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: beskriv ændringer"
   git push origin main
   ```

3. **Automatisk deployment**
   - Workflow kører automatisk
   - Tjek Actions tab for status
   - Pages opdateres automatisk

### 📞 Support

Ved problemer:
1. Tjek workflow logs i Actions tab
2. Verificer repository permissions
3. Kontakt repository administrator
4. Opret issue med deployment logs

---

**Sidst opdateret**: December 2024

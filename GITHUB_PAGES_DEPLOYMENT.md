# GitHub Pages Deployment Guide

## ✅ Konfiguration Færdig

GitHub Actions workflow er nu konfigureret til at bruge Supabase environment variables under build.

## 📋 Hvad er allerede sat op

1. **Workflow fil** (`.github/workflows/deploy.yml`) er opdateret
2. **Environment variables** bliver brugt under build step
3. **Automatisk deployment** når du pusher til `main` branch

## 🔧 GitHub Secrets Setup

Du skal tilføje disse secrets i dit GitHub repository:

### Trin-for-trin:

1. Gå til dit GitHub repository på GitHub.com
2. Klik på **Settings** (øverst i repository)
3. I venstre menu, klik på **Secrets and variables** → **Actions**
4. Klik på **New repository secret**

**Secret 1:**
- **Name:** `VITE_SUPABASE_URL`
- **Value:** Din Supabase URL (f.eks. `https://eodhqyhawxdrfrbbikjv.supabase.co`)
- Klik **Add secret**

**Secret 2:**
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** Din Supabase anon key
- Klik **Add secret**

## 🚀 Deployment

Når secrets er tilføjet:

1. **Push til main branch:**
   ```bash
   git add .
   git commit -m "Configure Supabase for GitHub Pages"
   git push origin main
   ```

2. **Workflow kører automatisk:**
   - Gå til **Actions** tab i GitHub
   - Se workflow køre
   - Vent på deployment (ca. 2-3 minutter)

3. **Verificer deployment:**
   - Gå til din GitHub Pages URL (f.eks. `https://issafiras.github.io/Power-Abo/`)
   - Åbn browser console (F12)
   - Tjek at der ikke er Supabase warnings

## ✅ Verificering

### Test i Browser Console

Åbn browser console på din deployed side og tjek:

```javascript
// Tjek at Supabase er tilgængelig
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
// Skal vise din Supabase URL (ikke undefined)

// Tjek at app kan fetche planer
// Planer skal hentes fra Supabase, ikke fallback
```

### Forventet Adfærd

- ✅ Ingen warnings om manglende Supabase config
- ✅ Planer hentes fra Supabase database
- ✅ App virker normalt med alle features

### Hvis noget fejler

1. **Tjek GitHub Secrets:**
   - Gå til Settings → Secrets and variables → Actions
   - Verificer at begge secrets er tilføjet korrekt

2. **Tjek Workflow Logs:**
   - Gå til Actions tab
   - Klik på seneste workflow run
   - Tjek build step for fejl

3. **Tjek Browser Console:**
   - Åbn deployed side
   - Tjek for errors eller warnings
   - App vil falde tilbage til lokal data hvis Supabase fejler

## 📝 Noter

- Environment variables bliver indlejret i build ved build-tid
- De er ikke tilgængelige runtime (kun ved build)
- Vite indlejrer `VITE_*` variabler direkte i koden
- Secrets er sikre og bliver ikke eksponeret i koden

## 🔒 Sikkerhed

- ✅ Secrets er kun tilgængelige i GitHub Actions
- ✅ De bliver ikke committet til git
- ✅ Anon key er designet til at være public (RLS beskytter data)
- ✅ Supabase RLS sikrer at kun aktive planer kan læses

## 🎉 Klar!

Når secrets er tilføjet og du pusher til main, vil din app automatisk:
- Bygge med Supabase credentials
- Deploye til GitHub Pages
- Hente planer fra Supabase i produktion

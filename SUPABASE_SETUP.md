# Supabase Setup Guide

Denne guide forklarer hvordan du sætter Supabase op og migrerer mobile plan data til databasen.

## 1. Installer Dependencies

Først skal du installere de nye dependencies:

```bash
npm install
```

Dette installerer `@supabase/supabase-js` som er tilføjet til `package.json`.

## 2. Opret Supabase Projekt

1. Gå til [supabase.com](https://supabase.com) og opret en konto
2. Opret et nyt projekt
3. Noter din **Project URL** og **anon/public key**

## 3. Konfigurer Environment Variables

Opret en `.env` fil i projektets root (eller tilføj til eksisterende `.env` fil):

```env
VITE_SUPABASE_URL=din-project-url-her
VITE_SUPABASE_ANON_KEY=din-anon-key-her
```

**Vigtigt:** Sørg for at `.env` er i `.gitignore` så du ikke committer dine credentials.

## 4. Opret Database Schema

Kør SQL scriptet i Supabase SQL Editor:

1. Gå til din Supabase dashboard
2. Klik på "SQL Editor" i venstre menu
3. Åbn filen `supabase/schema.sql`
4. Kopier hele indholdet og kør det i SQL Editor

Dette opretter:
- `mobile_plans` tabellen med alle nødvendige felter
- Indexes for bedre performance
- Row Level Security (RLS) policies
- Automatisk `updated_at` trigger

## 5. Seed Database med Data

Når databasen er oprettet, kan du importere alle planer fra `src/data/plans.js`:

```bash
npm run seed
```

Dette kører `scripts/seed.js` som importerer alle planer til Supabase databasen.

**Hvis du får RLS (Row Level Security) fejl ved seeding:**
1. Kør SQL'en fra `supabase/migration-fix-insert.sql` i Supabase SQL Editor
2. Prøv at køre `npm run seed` igen

Scriptet vil:
- Læse alle planer fra `src/data/plans.js`
- Konvertere dem til database format
- Upserte dem i `mobile_plans` tabellen
- Vise status for hver plan

## 6. Verificer Data

Gå til Supabase dashboard → Table Editor → `mobile_plans` og verificer at alle planer er importeret korrekt.

## 7. Brug i Applikationen

### Hent Planer

I stedet for at importere direkte fra `plans.js`, brug nu `usePlans` hook:

```javascript
import { usePlans } from './hooks/usePlans';

function MyComponent() {
  const { plans, loading, error, usingFallback } = usePlans();
  
  if (loading) return <div>Indlæser...</div>;
  if (error) return <div>Fejl: {error}</div>;
  
  // plans er nu hentet fra Supabase (eller fallback til lokal data)
  return <div>{/* Brug plans her */}</div>;
}
```

### Admin Funktioner

Brug admin API funktioner til at administrere planer:

```javascript
import { 
  updatePlanPrice, 
  setCampaign, 
  togglePlanStatus 
} from './utils/adminApi';

// Opdater pris
await updatePlanPrice('telenor-30gb', 179, 800);

// Sæt kampagne
await setCampaign('telmore-unlimited-basic', 149, '2025-12-31');

// Deaktiver plan
await togglePlanStatus('telenor-170kr', false);
```

## 8. Row Level Security (RLS)

RLS er konfigureret så:
- **Alle** kan læse aktive planer (`is_active = true`)
- **Kun authenticated brugere** kan opdatere/indsætte planer

For at bruge admin funktioner skal du:
1. Implementere Supabase authentication i din app
2. Logge ind som authenticated bruger
3. Admin funktioner vil automatisk bruge den authenticated session

## 9. Fallback Mekanisme

Hvis Supabase ikke er konfigureret eller connection fejler, vil `usePlans` hook automatisk falde tilbage til lokal data fra `src/data/plans.js`. Dette sikrer at applikationen altid virker, selv uden database connection.

## Troubleshooting

### "Supabase client er ikke initialiseret"
- Tjek at `.env` filen indeholder `VITE_SUPABASE_URL` og `VITE_SUPABASE_ANON_KEY`
- Genstart dev serveren efter at have tilføjet environment variables

### "Permission denied" ved admin funktioner
- Sørg for at du er logged ind som authenticated bruger
- Tjek RLS policies i Supabase dashboard

### Seeding fejler
- Tjek at database schema er kørt korrekt
- Verificer at environment variables er sat korrekt
- Tjek Supabase logs for detaljerede fejlbeskeder

## 10. GitHub Pages Deployment

For at deploye til GitHub Pages med Supabase environment variables:

### Tilføj GitHub Secrets

1. Gå til dit GitHub repository
2. Settings → Secrets and variables → Actions
3. Tilføj to secrets:
   - `VITE_SUPABASE_URL` - Din Supabase projekt URL
   - `VITE_SUPABASE_ANON_KEY` - Din Supabase anon key

### Workflow er allerede konfigureret

`.github/workflows/deploy.yml` er allerede opdateret til at bruge secrets under build. Når du pusher til `main` branch, vil workflow automatisk:
- Bruge secrets som environment variables under build
- Indlejre Supabase credentials i den buildede app
- Deploye til GitHub Pages

### Verificer Deployment

Efter deployment:
1. Åbn din GitHub Pages URL
2. Åbn browser console (F12)
3. Tjek at Supabase client initialiseres uden warnings
4. Verificer at planer hentes fra Supabase (ikke fallback)

## Næste Skridt

1. Opdater eksisterende komponenter til at bruge `usePlans` hook i stedet for direkte import fra `plans.js`
2. Implementer Supabase authentication for admin dashboard
3. Opret admin dashboard UI til at administrere planer
4. Overvej at tilføje real-time subscriptions for at opdatere planer automatisk

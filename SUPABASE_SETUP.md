## Supabase opsætning

Tilføj følgende miljøvariabler i en `.env.local` (Vite loader `VITE_`-prefiks i browseren):

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Foreslået skema (SQL)

Kør i Supabase SQL editor:

```sql
create table if not exists public.search_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  query text not null,
  results_count int,
  meta jsonb default '{}'::jsonb
);

create table if not exists public.product_snapshots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  product_id text not null,
  data jsonb not null
);

create table if not exists public.app_config (
  key text primary key,
  value jsonb not null
);

alter table public.search_logs enable row level security;
alter table public.product_snapshots enable row level security;
alter table public.app_config enable row level security;

-- Simpel RLS: tillad anonyme læse/skrivetilladelser for demo. Justér efter behov.
create policy "allow anon insert search_logs" on public.search_logs
  for insert to anon using (true) with check (true);

create policy "allow anon insert product_snapshots" on public.product_snapshots
  for insert to anon using (true) with check (true);

create policy "allow anon select app_config" on public.app_config
  for select to anon using (true);
```

Bemærk: Justér RLS-politikker til jeres sikkerhedsbehov.

### Brug i kode

- `src/utils/supabaseClient.js` initialiserer klienten.
- `src/utils/backendApi.js` eksporterer funktioner til logging og config uden at ændre eksisterende søgning.



-- Supabase schema og RLS-politikker

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

do $$ begin
  create policy "allow anon insert search_logs" on public.search_logs
    for insert to anon using (true) with check (true);
exception when others then null; end $$;

do $$ begin
  create policy "allow anon insert product_snapshots" on public.product_snapshots
    for insert to anon using (true) with check (true);
exception when others then null; end $$;

do $$ begin
  create policy "allow anon select app_config" on public.app_config
    for select to anon using (true);
exception when others then null; end $$;

-- Datatabeller til appens indhold
create table if not exists public.plans (
  id text primary key,
  provider text not null,
  name text not null,
  data text,
  price numeric not null,
  intro_price numeric,
  intro_months int,
  earnings int,
  features jsonb,
  color text,
  logo text,
  streaming jsonb,
  streaming_count int,
  business boolean default false,
  price_vat_excluded boolean default false,
  type text,
  available_from date,
  expires_at date,
  cbb_mix_available boolean default false,
  cbb_mix_pricing jsonb,
  most_popular boolean default false
);

create table if not exists public.streaming_services (
  id text primary key,
  name text not null,
  price numeric not null,
  logo text,
  bg_color text,
  color text,
  category text default 'streaming',
  cbb_mix_only boolean default false
);

alter table public.plans enable row level security;
alter table public.streaming_services enable row level security;

do $$ begin
  create policy "allow anon select plans" on public.plans
    for select to anon using (true);
exception when others then null; end $$;

do $$ begin
  create policy "allow anon select streaming_services" on public.streaming_services
    for select to anon using (true);
exception when others then null; end $$;



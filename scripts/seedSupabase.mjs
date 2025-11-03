// Seed lokale data (plans & streaming services) til Supabase
// Kræver .env.local med VITE_SUPABASE_URL og VITE_SUPABASE_ANON_KEY

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Indlæs .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error('Mangler VITE_SUPABASE_URL eller VITE_SUPABASE_ANON_KEY i .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, { auth: { persistSession: false } });

// Importer lokale data
const plansModule = await import('../src/data/plans.js');
const streamingModule = await import('../src/data/streamingServices.js');

const localPlans = plansModule.plans || [];
const localStreaming = streamingModule.streamingServices || [];

function mapPlan(row) {
  return {
    id: row.id,
    provider: row.provider,
    name: row.name,
    data: row.data,
    price: row.price,
    intro_price: row.introPrice ?? null,
    intro_months: row.introMonths ?? null,
    earnings: row.earnings ?? null,
    features: Array.isArray(row.features) ? row.features : null,
    color: row.color ?? null,
    logo: row.logo ?? null,
    streaming: Array.isArray(row.streaming) ? row.streaming : null,
    streaming_count: row.streamingCount ?? null,
    business: row.business ?? false,
    price_vat_excluded: row.priceVatExcluded ?? false,
    type: row.type ?? null,
    available_from: row.availableFrom ?? null,
    expires_at: row.expiresAt ?? null,
    cbb_mix_available: row.cbbMixAvailable ?? false,
    cbb_mix_pricing: row.cbbMixPricing ?? null,
    most_popular: row.mostPopular ?? false,
  };
}

function mapService(s) {
  return {
    id: s.id,
    name: s.name,
    price: s.price,
    logo: s.logo ?? null,
    bg_color: s.bgColor ?? null,
    color: s.color ?? null,
    category: s.category ?? 'streaming',
    cbb_mix_only: s.cbbMixOnly ?? false,
  };
}

async function upsert(table, rows, conflict) {
  if (!rows.length) return { count: 0 };
  const { error } = await supabase.from(table).upsert(rows, { onConflict: conflict });
  if (error) throw error;
  return { count: rows.length };
}

async function main() {
  console.log('Seeding Supabase ...');
  console.log(`- Plans: ${localPlans.length}`);
  console.log(`- Streaming services: ${localStreaming.length}`);

  const planRows = localPlans.map(mapPlan);
  const serviceRows = localStreaming.map(mapService);

  await upsert('plans', planRows, 'id');
  console.log('✓ Plans upserted');

  await upsert('streaming_services', serviceRows, 'id');
  console.log('✓ Streaming services upserted');

  console.log('Done.');
}

main().catch((e) => {
  console.error('Fejl ved seeding:', e);
  process.exit(1);
});



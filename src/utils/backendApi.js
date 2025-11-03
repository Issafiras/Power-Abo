// Backend-API lag via Supabase. Denne fil introducerer backend-funktioner
// uden at ændre eksisterende søgefunktionalitet.

import { getSupabase, isSupabaseEnabled } from './supabaseClient';

function safeClient() {
  const client = getSupabase();
  if (!client) return null;
  return client;
}

export async function saveSearchLog({ query, resultsCount, meta = {} }) {
  const client = safeClient();
  if (!client) return { ok: false, skipped: true };

  const payload = {
    query,
    results_count: resultsCount ?? null,
    meta,
  };

  const { error } = await client.from('search_logs').insert(payload);
  if (error) return { ok: false, error };
  return { ok: true };
}

export async function saveProductSnapshot({ productId, data }) {
  const client = safeClient();
  if (!client) return { ok: false, skipped: true };

  const payload = {
    product_id: productId,
    data,
  };

  const { error } = await client.from('product_snapshots').insert(payload);
  if (error) return { ok: false, error };
  return { ok: true };
}

export async function getAppConfig() {
  const client = safeClient();
  if (!client) return { ok: true, data: {} };

  const { data, error } = await client
    .from('app_config')
    .select('key, value');

  if (error) return { ok: false, error };

  const map = {};
  (data || []).forEach((row) => {
    map[row.key] = row.value;
  });
  return { ok: true, data: map };
}

export function supabaseActive() {
  return isSupabaseEnabled();
}



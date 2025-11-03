import { getSupabase, isSupabaseEnabled } from './supabaseClient';

let cachedPlans = null;
let cachedStreaming = null;

export function canUseSupabase() {
  return isSupabaseEnabled();
}

export async function fetchPlansFromSupabase() {
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('plans')
    .select('*')
    .eq('status', 'published')
    .order('provider', { ascending: true });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    provider: row.provider,
    name: row.name,
    data: row.data,
    price: row.price,
    introPrice: row.intro_price || null,
    introMonths: row.intro_months || null,
    earnings: row.earnings || null,
    features: Array.isArray(row.features) ? row.features : (row.features ? Object.values(row.features) : []),
    color: row.color || undefined,
    logo: row.logo || undefined,
    streaming: Array.isArray(row.streaming) ? row.streaming : [],
    streamingCount: row.streaming_count || undefined,
    business: row.business || false,
    priceVatExcluded: row.price_vat_excluded || false,
    type: row.type || undefined,
    availableFrom: row.available_from || undefined,
    expiresAt: row.expires_at || undefined,
    cbbMixAvailable: row.cbb_mix_available || false,
    cbbMixPricing: row.cbb_mix_pricing || undefined,
    mostPopular: row.most_popular || false,
  }));
}

export async function getPlansCached() {
  if (cachedPlans) return cachedPlans;
  const list = await fetchPlansFromSupabase();
  cachedPlans = list;
  return list;
}

export async function fetchStreamingServicesFromSupabase() {
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('streaming_services')
    .select('*')
    .eq('status', 'published')
    .order('name', { ascending: true });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    price: row.price,
    logo: row.logo || undefined,
    bgColor: row.bg_color || undefined,
    color: row.color || undefined,
    category: row.category || 'streaming',
    cbbMixOnly: row.cbb_mix_only || false,
  }));
}

export async function getStreamingCached() {
  if (cachedStreaming) return cachedStreaming;
  const list = await fetchStreamingServicesFromSupabase();
  cachedStreaming = list;
  return list;
}



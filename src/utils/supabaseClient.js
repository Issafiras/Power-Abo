// Minimal Supabase klient-initialisering til brug i hele appen
// Kræver Vite env variabler: VITE_SUPABASE_URL og VITE_SUPABASE_ANON_KEY

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL)
  ? import.meta.env.VITE_SUPABASE_URL
  : undefined;

const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY)
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : undefined;

// Lazy init for at undgå fejl i build-miljøer uden envs
let supabaseInstance = null;

export function getSupabase() {
  if (supabaseInstance) return supabaseInstance;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase ikke konfigureret (mangler VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
    return null;
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false
    }
  });

  return supabaseInstance;
}

export function isSupabaseEnabled() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}



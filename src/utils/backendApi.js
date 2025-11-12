// Backend-API lag - tom fil da Supabase er fjernet
// Funktionerne er fjernet da de kun brugte Supabase

export async function saveSearchLog() {
  return { ok: false, skipped: true };
}

export async function saveProductSnapshot() {
  return { ok: false, skipped: true };
}

export async function getAppConfig() {
  return { ok: true, data: {} };
}

export function supabaseActive() {
  return false;
}



import { getSupabase } from './supabaseClient';

function clientOrThrow() {
  const c = getSupabase();
  if (!c) throw new Error('Supabase ikke konfigureret');
  return c;
}

// Auth (email + password)
export async function signInWithPassword(email, password) {
  const c = clientOrThrow();
  const { data, error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session || null;
}

export async function signUpEmailPassword(email, password) {
  const c = clientOrThrow();
  const { data, error } = await c.auth.signUp({ email, password });
  if (error) throw error;
  return data.user || null;
}

export async function getSession() {
  const c = clientOrThrow();
  const { data } = await c.auth.getSession();
  return data.session || null;
}

export async function signOut() {
  const c = clientOrThrow();
  await c.auth.signOut();
}

// Plans CRUD
export async function listPlans() {
  const c = clientOrThrow();
  const { data, error } = await c.from('plans').select('*').order('provider');
  if (error) throw error;
  return data || [];
}

export async function upsertPlan(row) {
  const c = clientOrThrow();
  const { error } = await c.from('plans').upsert(row, { onConflict: 'id' });
  if (error) throw error;
}

export async function deletePlan(id) {
  const c = clientOrThrow();
  const { error } = await c.from('plans').delete().eq('id', id);
  if (error) throw error;
}

// Streaming services CRUD
export async function listServices() {
  const c = clientOrThrow();
  const { data, error } = await c.from('streaming_services').select('*').order('name');
  if (error) throw error;
  return data || [];
}

export async function upsertService(row) {
  const c = clientOrThrow();
  const { error } = await c.from('streaming_services').upsert(row, { onConflict: 'id' });
  if (error) throw error;
}

export async function deleteService(id) {
  const c = clientOrThrow();
  const { error } = await c.from('streaming_services').delete().eq('id', id);
  if (error) throw error;
}

// Audit log
export async function auditLog({ entity, entityId, action, payload }) {
  const c = clientOrThrow();
  const { data: sess } = await c.auth.getSession();
  const userEmail = sess?.session?.user?.email || null;
  const row = { user_email: userEmail, entity, entity_id: entityId || null, action, payload: payload ?? null };
  await c.from('admin_audit').insert(row);
}

// CSV helpers (client-side)
export function exportToCsv(filename, rows) {
  const escape = (val) => {
    if (val == null) return '';
    const s = String(val);
    if (s.includes(',') || s.includes('\n') || s.includes('"')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const keys = Array.from(rows.reduce((set, r) => { Object.keys(r).forEach(k=>set.add(k)); return set; }, new Set()));
  const header = keys.join(',');
  const body = rows.map(r => keys.map(k => escape(r[k])).join(',')).join('\n');
  const csv = header + '\n' + body;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

export function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.replace(/^\"|\"$/g, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = cols[idx] ? cols[idx].replace(/^\"|\"$/g, '') : ''; });
    rows.push(obj);
  }
  return rows;
}



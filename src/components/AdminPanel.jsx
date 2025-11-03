import { useEffect, useState } from 'react';
import { signInWithPassword, getSession, signOut, listPlans, upsertPlan, deletePlan, listServices, upsertService, deleteService, auditLog, exportToCsv, parseCsv } from '../utils/adminApi';

export default function AdminPanel({ onClose }) {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode] = useState('signin');
  const [tab, setTab] = useState('plans');
  const [plans, setPlans] = useState([]);
  const [services, setServices] = useState([]);
  const [planQuery, setPlanQuery] = useState('');
  const [serviceQuery, setServiceQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    (async () => {
      const s = await getSession();
      setSession(s);
      if (s) {
        await refreshData();
      }
    })();
  }, []);

  async function refreshData() {
    setLoading(true);
    setError(null);
    try {
      const [p, s] = await Promise.all([listPlans(), listServices()]);
      setPlans(p);
      setServices(s);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const sess = await signInWithPassword(email, password);
      if (sess) {
        setSession(sess);
        await refreshData();
      }
    } catch (e) {
      alert(e.message || 'Login fejl');
    }
  }

  async function handleSignOut() {
    await signOut();
    setSession(null);
  }

  function onChangePlan(idx, key, value) {
    setPlans(prev => prev.map((row, i) => i === idx ? { ...row, [key]: value } : row));
  }

  async function savePlan(idx) {
    const row = plans[idx];
    // simple validation
    if (!row.id || !row.provider || !row.name) { setError('ID, provider og navn er påkrævet'); return; }
    if (!(Number(row.price) >= 0)) { setError('Pris skal være et tal >= 0'); return; }
    await upsertPlan(row);
    await auditLog({ entity: 'plans', entityId: row.id, action: 'upsert', payload: row });
    await refreshData();
    setToast('Plan gemt');
  }

  async function removePlan(id) {
    if (!confirm('Slet plan?')) return;
    await deletePlan(id);
    await auditLog({ entity: 'plans', entityId: id, action: 'delete', payload: null });
    await refreshData();
    setToast('Plan slettet');
  }

  function addEmptyPlan() {
    setPlans(prev => [{ id: '', provider: '', name: '', data: '', price: 0, logo: '', color: '' }, ...prev]);
  }

  function onChangeService(idx, key, value) {
    setServices(prev => prev.map((row, i) => i === idx ? { ...row, [key]: value } : row));
  }

  async function saveService(idx) {
    const row = services[idx];
    if (!row.id || !row.name) { setError('ID og navn er påkrævet'); return; }
    if (!(Number(row.price) >= 0)) { setError('Pris skal være et tal >= 0'); return; }
    await upsertService(row);
    await auditLog({ entity: 'streaming_services', entityId: row.id, action: 'upsert', payload: row });
    await refreshData();
    setToast('Tjeneste gemt');
  }

  async function removeService(id) {
    if (!confirm('Slet tjeneste?')) return;
    await deleteService(id);
    await auditLog({ entity: 'streaming_services', entityId: id, action: 'delete', payload: null });
    await refreshData();
    setToast('Tjeneste slettet');
  }

  function addEmptyService() {
    setServices(prev => [{ id: '', name: '', price: 0, logo: '', bg_color: '', category: 'streaming' }, ...prev]);
  }

  if (!session) {
    return (
      <div className="admin-panel">
        <div className="admin-header">
          <h2>Admin</h2>
          <button className="btn" onClick={onClose}>Luk</button>
        </div>
        <form onSubmit={handleLogin} className="admin-login">
          <input className="input" type="email" placeholder="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="adgangskode" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="btn btn-primary" type="submit">Log ind</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Admin</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={refreshData} disabled={loading}>Opdater</button>
          <button className="btn" onClick={handleSignOut}>Log ud</button>
          <button className="btn" onClick={onClose}>Luk</button>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-tabs">
        <button className={`btn ${tab==='plans'?'btn-primary':''}`} onClick={() => setTab('plans')}>Abonnementer</button>
        <button className={`btn ${tab==='services'?'btn-primary':''}`} onClick={() => setTab('services')}>Tjenester</button>
        <button className={`btn ${tab==='config'?'btn-primary':''}`} onClick={() => setTab('config')}>Konfiguration</button>
      </div>

      {tab === 'plans' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button className="btn" onClick={addEmptyPlan}>+ Ny plan</button>
          </div>
          <div className="toolbar">
            <input className="input" placeholder="Søg (id, navn, provider)" value={planQuery} onChange={e=>setPlanQuery(e.target.value)} />
            <button className="btn" onClick={()=>exportToCsv('plans.csv', plans)}>Eksport CSV</button>
            <label className="btn">
              Import CSV
              <input type="file" accept=".csv" style={{ display:'none' }} onChange={async (e)=>{
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                const rows = parseCsv(text);
                for (const r of rows) {
                  try { await upsertPlan(r); await auditLog({ entity:'plans', entityId: r.id, action:'upsert', payload:r }); } catch {}
                }
                await refreshData();
                setToast('CSV importeret');
                e.target.value = '';
              }} />
            </label>
          </div>
          <div className="admin-table">
            <div className="admin-row admin-row-head">
              <div>ID</div><div>Provider</div><div>Navn</div><div>Data</div><div>Pris</div><div>Status</div><div>Ver.</div><div>Handling</div>
            </div>
            {plans.filter(p => {
              const q = planQuery.trim().toLowerCase();
              if (!q) return true;
              return (
                String(p.id||'').toLowerCase().includes(q) ||
                String(p.name||'').toLowerCase().includes(q) ||
                String(p.provider||'').toLowerCase().includes(q)
              );
            }).map((p, idx) => (
              <div className="admin-row" key={p.id || `new-${idx}`}>
                <input className="input" value={p.id || ''} onChange={e=>onChangePlan(idx,'id',e.target.value)} placeholder="id" />
                <input className="input" value={p.provider || ''} onChange={e=>onChangePlan(idx,'provider',e.target.value)} placeholder="provider" />
                <input className="input" value={p.name || ''} onChange={e=>onChangePlan(idx,'name',e.target.value)} placeholder="navn" />
                <input className="input" value={p.data || ''} onChange={e=>onChangePlan(idx,'data',e.target.value)} placeholder="data" />
                <input className="input" type="number" value={p.price ?? 0} onChange={e=>onChangePlan(idx,'price',Number(e.target.value))} placeholder="pris" />
                <select className="input" value={p.status || 'draft'} onChange={e=>onChangePlan(idx,'status',e.target.value)}>
                  <option value="draft">Kladde</option>
                  <option value="published">Publiceret</option>
                </select>
                <div>{p.version ?? 1}</div>
                <div className="admin-actions">
                  <button className="btn btn-primary" onClick={()=>savePlan(idx)}>Gem</button>
                  {p.id && <button className="btn" onClick={()=>removePlan(p.id)}>Slet</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'services' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button className="btn" onClick={addEmptyService}>+ Ny tjeneste</button>
          </div>
          <div className="toolbar">
            <input className="input" placeholder="Søg (id, navn, kategori)" value={serviceQuery} onChange={e=>setServiceQuery(e.target.value)} />
            <button className="btn" onClick={()=>exportToCsv('streaming_services.csv', services)}>Eksport CSV</button>
            <label className="btn">
              Import CSV
              <input type="file" accept=".csv" style={{ display:'none' }} onChange={async (e)=>{
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                const rows = parseCsv(text);
                for (const r of rows) {
                  try { await upsertService(r); await auditLog({ entity:'streaming_services', entityId: r.id, action:'upsert', payload:r }); } catch {}
                }
                await refreshData();
                setToast('CSV importeret');
                e.target.value = '';
              }} />
            </label>
          </div>
          <div className="admin-table">
            <div className="admin-row admin-row-head">
              <div>ID</div><div>Navn</div><div>Pris</div><div>Status</div><div>Ver.</div><div>Kat.</div><div>Handling</div>
            </div>
            {services.filter(s => {
              const q = serviceQuery.trim().toLowerCase();
              if (!q) return true;
              return (
                String(s.id||'').toLowerCase().includes(q) ||
                String(s.name||'').toLowerCase().includes(q) ||
                String(s.category||'').toLowerCase().includes(q)
              );
            }).map((s, idx) => (
              <div className="admin-row" key={s.id || `new-s-${idx}`}>
                <input className="input" value={s.id || ''} onChange={e=>onChangeService(idx,'id',e.target.value)} placeholder="id" />
                <input className="input" value={s.name || ''} onChange={e=>onChangeService(idx,'name',e.target.value)} placeholder="navn" />
                <input className="input" type="number" value={s.price ?? 0} onChange={e=>onChangeService(idx,'price',Number(e.target.value))} placeholder="pris" />
                <select className="input" value={s.status || 'draft'} onChange={e=>onChangeService(idx,'status',e.target.value)}>
                  <option value="draft">Kladde</option>
                  <option value="published">Publiceret</option>
                </select>
                <div>{s.version ?? 1}</div>
                <input className="input" value={s.category || 'streaming'} onChange={e=>onChangeService(idx,'category',e.target.value)} placeholder="kategori" />
                <div className="admin-actions">
                  <button className="btn btn-primary" onClick={()=>saveService(idx)}>Gem</button>
                  {s.id && <button className="btn" onClick={()=>removeService(s.id)}>Slet</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'config' && (
        <ConfigEditor />
      )}

      <style>{`
        .admin-panel { background: var(--glass-bg); padding: var(--spacing-lg); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); }
        .admin-header { display:flex; align-items:center; justify-content:space-between; margin-bottom: var(--spacing-md); }
        .admin-login { display:flex; gap: var(--spacing-sm); }
        .toolbar { display:flex; gap: 8px; margin: 8px 0; }
        .admin-tabs { display:flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-md); }
        .admin-table { display:flex; flex-direction:column; gap: 6px; }
        .admin-row { display:grid; grid-template-columns: 1.2fr 1fr 1.5fr 1fr 0.8fr 1.6fr 0.8fr 1fr; gap: 6px; align-items:center; }
        .admin-row-head { font-weight: 600; }
        .admin-actions { display:flex; gap: 6px; justify-content:flex-end; }
        .admin-error { color: var(--color-danger); margin-bottom: var(--spacing-sm); }
      `}</style>
      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  );
}

function ConfigEditor() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => { (async () => {
    try {
      setLoading(true);
      const resp = await fetch('/rest/v1/app_config?select=key,value', { headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY } });
      const data = await resp.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || String(e));
    } finally { setLoading(false); }
  })(); }, []);

  return (
    <div>
      <h3>App Konfiguration</h3>
      {error && <div className="admin-error">{error}</div>}
      {loading ? 'Indlæser...' : (
        <div className="admin-table">
          <div className="admin-row admin-row-head"><div>Nøgle</div><div>Værdi (JSON)</div></div>
          {items.map((it, idx) => (
            <div className="admin-row" key={it.key || idx} style={{ gridTemplateColumns: '1fr 2fr' }}>
              <input className="input" value={it.key} readOnly />
              <input className="input" value={JSON.stringify(it.value ?? null)} onChange={e=>{
                try { const v = JSON.parse(e.target.value); setItems(prev => prev.map((p,i)=>i===idx?{...p,value:v}:p)); } catch {}
              }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



import AdminPanel from '../components/AdminPanel';

export default function AdminPage() {
  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <div className="brand">⚙️ Power Admin</div>
        <nav className="actions">
          <a className="btn" href="/" aria-label="Tilbage til app">← Til app</a>
        </nav>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="nav-group">
            <div className="nav-title">Indhold</div>
            <a className="nav-link active" href="#plans">Abonnementer</a>
            <a className="nav-link" href="#services">Tjenester</a>
          </div>
          <div className="nav-group">
            <div className="nav-title">System</div>
            <a className="nav-link" href="#config">Konfiguration</a>
          </div>
        </aside>
        <main className="admin-content">
          <AdminPanel onClose={() => { window.location.href = '/'; }} />
        </main>
      </div>

      <style>{`
        .admin-page { min-height: 100vh; background: var(--app-bg, #0b0b0b); color: var(--text-primary); }
        .admin-topbar { position: sticky; top: 0; z-index: 50; display:flex; align-items:center; justify-content:space-between; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(10,10,10,0.9); backdrop-filter: blur(8px); }
        .brand { font-weight: 700; letter-spacing: .3px; }
        .actions { display:flex; gap: 8px; }

        .admin-layout { display:grid; grid-template-columns: 240px 1fr; min-height: calc(100vh - 56px); }
        .admin-sidebar { border-right: 1px solid rgba(255,255,255,0.08); padding: 16px; position: sticky; top: 56px; height: calc(100vh - 56px); overflow: auto; }
        .nav-group { margin-bottom: 16px; }
        .nav-title { font-size: 12px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }
        .nav-link { display:block; padding: 8px 10px; border-radius: 8px; color: var(--text-secondary); text-decoration: none; }
        .nav-link:hover { background: rgba(255,255,255,0.06); color: var(--text-primary); }
        .nav-link.active { background: rgba(255,255,255,0.08); color: var(--text-primary); }

        .admin-content { padding: 20px; }
      `}</style>
    </div>
  );
}



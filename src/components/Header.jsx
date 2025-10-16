/**
 * Header komponent
 * Viser app-titel, tema-toggle, og kontrol-knapper
 */

import { useState, useEffect } from 'react';

export default function Header({ 
  onReset, 
  onPresentationToggle, 
  theme, 
  onThemeToggle,
  showCashDiscount,
  onToggleCashDiscount
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyPress(e) {
      // Ctrl+R: Reset
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        setShowConfirm(true);
      }
      // Ctrl+P: Presentation
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        onPresentationToggle();
      }
      // Ctrl+T: Theme
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        onThemeToggle();
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onPresentationToggle, onThemeToggle]);

  const handleResetConfirm = () => {
    onReset();
    setShowConfirm(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo og titel */}
          <div className="header-logo">
            <h1 className="text-gradient">⚡ Power Calculator</h1>
            <p className="text-sm text-muted">Mobilabonnement & Streaming Beregner</p>
          </div>

          {/* Kontroller */}
          <div className="header-actions">
            {/* Kontant rabat toggle */}
            <button
              onClick={onToggleCashDiscount}
              className={`btn btn-secondary ${showCashDiscount ? 'active' : ''}`}
              title="Vis/skjul kontant rabat"
            >
              💰 Kontant Rabat
            </button>

            {/* Tema toggle */}
            <button
              onClick={onThemeToggle}
              className="btn btn-icon btn-secondary"
              title="Skift tema (Ctrl+T)"
              aria-label="Skift tema"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Præsentation */}
            <button
              onClick={onPresentationToggle}
              className="btn btn-primary"
              title="Vis præsentation (Ctrl+P)"
            >
              📊 Præsentér
            </button>

            {/* Reset */}
            <button
              onClick={() => setShowConfirm(true)}
              className="btn btn-danger"
              title="Nulstil alt (Ctrl+R)"
            >
              🔄 Nulstil
            </button>
          </div>
        </div>
      </div>

      {/* Reset confirmation dialog */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <h3>Bekræft nulstilling</h3>
            <p className="text-secondary">
              Er du sikker på, at du vil nulstille alt? Dette kan ikke fortrydes.
            </p>
            <div className="modal-actions">
              <button 
                onClick={() => setShowConfirm(false)} 
                className="btn btn-secondary"
              >
                Annullér
              </button>
              <button 
                onClick={handleResetConfirm} 
                className="btn btn-danger"
              >
                Ja, nulstil alt
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .header {
          background: var(--glass-bg);
          backdrop-filter: blur(var(--blur-xl));
          border-bottom: 1px solid var(--glass-border);
          padding: var(--spacing-lg) 0;
          position: sticky;
          top: 0;
          z-index: var(--z-sticky);
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--spacing-lg);
        }

        .header-logo h1 {
          margin: 0;
          font-size: var(--font-3xl);
        }

        .header-logo p {
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: var(--spacing-sm);
          align-items: center;
        }

        .btn.active {
          background: var(--color-orange);
          color: white;
          box-shadow: var(--glow-orange);
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(var(--blur-md));
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: var(--z-modal);
          padding: var(--spacing-lg);
        }

        .modal-content {
          max-width: 500px;
          width: 100%;
          padding: var(--spacing-2xl);
          animation: slideInUp var(--transition-base);
        }

        .modal-content h3 {
          margin-top: 0;
        }

        .modal-actions {
          display: flex;
          gap: var(--spacing-md);
          justify-content: flex-end;
          margin-top: var(--spacing-lg);
        }

        @media (max-width: 900px) {
          .header-content {
            flex-direction: column;
            align-items: stretch;
          }

          .header-logo {
            text-align: center;
          }

          .header-actions {
            flex-wrap: wrap;
            justify-content: center;
          }

          .header-actions .btn:not(.btn-icon) {
            flex: 1;
            min-width: 120px;
          }
        }
      `}</style>
    </header>
  );
}


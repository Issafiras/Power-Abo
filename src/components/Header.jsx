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
  onToggleCashDiscount,
  onSmartCalculatorToggle
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

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

  // Shrink header on scroll for a more compact UI - Optimized with throttling
  useEffect(() => {
    let ticking = false;
    let lastScrollY = window.scrollY;
    
    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          // Kun opdater hvis scroll position har ændret sig betydeligt (throttle)
          if (Math.abs(currentScrollY - lastScrollY) > 5) {
            const shouldBeCompact = currentScrollY > 24;
            if (shouldBeCompact !== isCompact) {
              setIsCompact(shouldBeCompact);
            }
            lastScrollY = currentScrollY;
          }
          ticking = false;
        });
        ticking = true;
      }
    }
    
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isCompact]);

  const handleResetConfirm = () => {
    onReset();
    setShowConfirm(false);
  };

  return (
    <header className={`app-header fade-in-down ${isCompact ? 'app-header--compact' : ''}`}>
      <div className="app-header__bg" aria-hidden="true">
        <span className="app-header__aurora app-header__aurora--primary" />
        <span className="app-header__aurora app-header__aurora--secondary" />
        <span className="app-header__mesh" />
        <span className="app-header__glow" />
      </div>

      {/* Reset confirmation dialog */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-dialog-title"
            onClick={e => e.stopPropagation()}
          >
            <h3>Bekræft nulstilling</h3>
            <p className="text-secondary">
              Er du sikker på, at du vil nulstille alt? Dette kan ikke fortrydes.
            </p>
            <div className="modal-actions">
              <button 
                onClick={() => setShowConfirm(false)} 
                className="btn btn-glass"
              >
                Annullér
              </button>
              <button 
                onClick={handleResetConfirm} 
                className="btn btn-gradient-orange"
              >
                Ja, nulstil alt
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container app-header__grid">
        <div className="app-header__lead">
          <p className="app-header__kicker">Sammenlign mobilabonnementer og streaming-tjenester</p>
          <div className="app-header__badges">
            <span className="badge badge-tonal">
              🎯 Professionel værktøj
            </span>
            <span className="badge badge-tonal">
              💡 Intelligent sammenligning
            </span>
            <span className="badge badge-tonal">
              ⚡ Hurtig og præcis
            </span>
          </div>
        </div>

        <div className="app-header__logo">
          {(() => {
            const logoSrc = `${import.meta.env.BASE_URL}power-logo-white.png?v=1`;
            return (
              <img
                src={logoSrc}
                alt="Power Abonnement"
                className="app-header__logo-image"
              />
            );
          })()}
          <span className="app-header__logo-divider" />
        </div>

        <div className="app-header__actions">
          <div className="app-header__actions-group">
            {onSmartCalculatorToggle && (
              <button
                onClick={onSmartCalculatorToggle}
                className="btn btn-glass btn-sm"
                title="Åbn AI Anbefaling System"
              >
                🤖 AI Anbefaling
              </button>
            )}

            <button
              onClick={onPresentationToggle}
              className="btn btn-premium btn-lg"
              title="Vis præsentation (Ctrl+P)"
            >
              📊 Præsentér
            </button>
          </div>

          <div className="app-header__actions-group">
            <button
              onClick={onToggleCashDiscount}
              className={`btn btn-glass btn-sm ${showCashDiscount ? 'is-active' : ''}`}
              title="Vis/skjul kontant rabat"
            >
              💰 Kontant Rabat
            </button>

            <button
              onClick={onThemeToggle}
              className="btn btn-icon btn-glass"
              title="Skift tema (Ctrl+T)"
              aria-label="Skift tema"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <button
              onClick={() => setShowConfirm(true)}
              className="btn btn-gradient-orange btn-sm"
              title="Nulstil alt (Ctrl+R)"
            >
              🔄 Nulstil
            </button>
          </div>

          <div className="app-header__maps">
            <a
              href="https://www.telmore.dk/mobilt-bredbaand/daekningskort"
              target="_blank"
              rel="noopener noreferrer"
              className="coverage-map-btn coverage-map-btn-telmore"
              title="Se Telmore dækningskort"
            >
              <span className="btn-icon">📍</span>
              <span className="btn-text">Telmore Dækning</span>
            </a>

            <a
              href="https://www.telenor.dk/kundeservice/drift-og-dakning/dakning/dakningskort/"
              target="_blank"
              rel="noopener noreferrer"
              className="coverage-map-btn coverage-map-btn-telenor"
              title="Se Telenor/CBB dækningskort"
            >
              <span className="btn-icon">📍</span>
              <span className="btn-text">Telenor/CBB Dækning</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}


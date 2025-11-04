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
    <header className="header fade-in-down">
      {/* Hero Background - Performance optimized (reduced particles) */}
      <div className="hero-background">
        {/* Reduced particles for better performance */}
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="hero-gradient-overlay"></div>
      </div>

      <div className="container">
        <div className="header-content">
          {/* Logo og titel */}
          <div className="header-logo">
            {(() => {
              const logoSrc = `${import.meta.env.BASE_URL}power-logo.png`;
              return (
                <img
                  src={logoSrc}
                  alt="Power Abonnement"
                  className="app-logo bounce-in"
                />
              );
            })()}
            <p className="text-sm text-muted fade-in font-medium">Sammenlign mobilabonnementer og streaming-tjenester</p>
            <div className="hero-subtitle fade-in" style={{ animationDelay: '200ms' }}>
              <span className="badge badge-primary pulse">🎯 Professionel værktøj</span>
              <span className="badge badge-info">💡 Intelligent sammenligning</span>
              <span className="badge badge-success">⚡ Hurtig og præcis</span>
            </div>
          </div>

          {/* Kontroller */}
          <div className="header-actions">
            {/* AI Smart Calculator */}
            {onSmartCalculatorToggle && (
              <button
                onClick={onSmartCalculatorToggle}
                className="btn btn-glass btn-sm"
                title="Åbn AI Anbefaling System"
              >
                🤖 AI Anbefaling
              </button>
            )}

            {/* Kontant rabat toggle */}
            <button
              onClick={onToggleCashDiscount}
              className={`btn btn-glass btn-sm ${showCashDiscount ? 'active' : ''}`}
              title="Vis/skjul kontant rabat"
            >
              💰 Kontant Rabat
            </button>

            {/* Tema toggle */}
            <button
              onClick={onThemeToggle}
              className="btn btn-icon btn-glass"
              title="Skift tema (Ctrl+T)"
              aria-label="Skift tema"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Præsentation */}
            <button
              onClick={onPresentationToggle}
              className="btn btn-premium btn-lg"
              title="Vis præsentation (Ctrl+P)"
            >
              📊 Præsentér
            </button>

            {/* Reset */}
            <button
              onClick={() => setShowConfirm(true)}
              className="btn btn-gradient-orange btn-sm"
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

      <style>{`
        .header {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(var(--blur-lg)) saturate(150%);
          -webkit-backdrop-filter: blur(var(--blur-lg)) saturate(150%);
          border-bottom: 0.5px solid var(--glass-border);
          padding: var(--spacing-2xl) 0;
          position: sticky;
          top: 0;
          z-index: var(--z-sticky);
          transition: background var(--transition-base);
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: -1;
        }

        .particle {
          position: absolute;
          background: var(--color-orange);
          border-radius: 50%;
          opacity: 0.4;
          animation: float 12s ease-in-out infinite;
          will-change: transform;
        }

        .particle-1 {
          width: 4px;
          height: 4px;
          top: 20%;
          left: 10%;
          animation-delay: 0s;
          animation-duration: 12s;
        }

        .particle-2 {
          width: 6px;
          height: 6px;
          top: 60%;
          left: 85%;
          animation-delay: 6s;
          animation-duration: 14s;
          background: var(--color-telenor);
        }

        .hero-gradient-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
            ellipse at center,
            rgba(255, 107, 26, 0.05) 0%,
            transparent 70%
          );
          opacity: 0.8;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) translateX(10px) rotate(90deg);
          }
          50% {
            transform: translateY(-10px) translateX(-5px) rotate(180deg);
          }
          75% {
            transform: translateY(-30px) translateX(15px) rotate(270deg);
          }
        }

        .header::before {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, 
            var(--color-orange), 
            var(--color-telenor),
            var(--color-cbb),
            var(--color-orange)
          );
          background-size: 200% 100%;
          animation: gradientFlow 3s ease infinite;
          opacity: 0.6;
        }

        @keyframes gradientFlow {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 0%; }
          100% { background-position: 0% 0%; }
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

        .app-logo {
          height: 56px;
          width: auto;
          display: block;
          object-fit: contain;
          image-rendering: auto;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.35));
        }

        .header-logo p {
          margin: 0;
        }

        .hero-subtitle {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-md);
          align-items: center;
        }

        .hero-subtitle .badge {
          font-size: var(--font-xs);
          padding: var(--spacing-xs) var(--spacing-sm);
          animation: fadeInUp var(--duration-normal) var(--ease-in-out-cubic) forwards;
          opacity: 0;
          transform: translateY(10px);
        }

        .hero-subtitle .badge:nth-child(1) {
          animation-delay: 300ms;
        }

        .hero-subtitle .badge:nth-child(2) {
          animation-delay: 400ms;
        }

        .hero-subtitle .badge:nth-child(3) {
          animation-delay: 500ms;
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
          animation: scaleIn var(--duration-normal) var(--ease-out-back);
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
          .header {
            padding: var(--spacing-lg) 0;
          }

          .header-content {
            flex-direction: column;
            align-items: stretch;
          }

          .header-logo {
            text-align: center;
          }

          .header-logo h1 {
            font-size: var(--font-2xl);
          }

          .app-logo {
            height: 44px;
          }

          .hero-subtitle {
            justify-content: center;
            flex-wrap: wrap;
          }

          .hero-subtitle .badge {
            font-size: 10px;
            padding: 4px 8px;
          }

          .header-actions {
            flex-wrap: wrap;
            justify-content: center;
          }

          .header-actions .btn:not(.btn-icon) {
            flex: 1;
            min-width: 120px;
          }

          /* Reducer partikel animation på mobile */
          .particle {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}


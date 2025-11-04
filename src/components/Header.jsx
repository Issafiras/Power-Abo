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

  // Shrink header on scroll for a more compact UI
  useEffect(() => {
    function handleScroll() {
      const shouldBeCompact = window.scrollY > 24;
      if (shouldBeCompact !== isCompact) {
        setIsCompact(shouldBeCompact);
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
    <header className={`header fade-in-down ${isCompact ? 'compact' : ''}`}>
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
            <p className="text-sm text-muted fade-in font-medium">Sammenlign mobilabonnementer og streaming-tjenester</p>
            <div className="hero-subtitle fade-in" style={{ animationDelay: '200ms' }}>
              <span className="badge badge-primary pulse">🎯 Professionel værktøj</span>
              <span className="badge badge-info">💡 Intelligent sammenligning</span>
              <span className="badge badge-success">⚡ Hurtig og præcis</span>
            </div>
          </div>

          {/* Logo mellem badges og knapper */}
          <div className="header-logo-center">
            {(() => {
              const logoSrc = `${import.meta.env.BASE_URL}power-logo-white.png?v=1`;
              return (
                <img
                  src={logoSrc}
                  alt="Power Abonnement"
                  className="app-logo bounce-in"
                />
              );
            })()}
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

        .header.compact {
          padding: var(--spacing-md) 0;
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
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
          width: 100%;
        }

        .header-logo {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 0 0 auto;
          min-width: 0;
          align-items: flex-start;
        }

        .header-logo h1 {
          margin: 0;
          font-size: var(--font-3xl);
        }

        .header-logo-center {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          min-width: 0;
          align-self: center;
        }

        .app-logo {
          height: 300px;
          width: auto;
          max-width: 1100px;
          display: block;
          object-fit: contain;
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          filter: drop-shadow(0 2px 12px rgba(0,0,0,0.4)) drop-shadow(0 0 20px rgba(255, 107, 26, 0.2));
          margin: 0 auto;
          transition: transform var(--transition-smooth);
        }

        .header.compact .app-logo {
          height: 150px;
          max-width: 650px;
          filter: drop-shadow(0 1px 8px rgba(0,0,0,0.35)) drop-shadow(0 0 12px rgba(255, 107, 26, 0.15));
        }

        .app-logo:hover {
          transform: scale(1.02);
        }

        .header-logo p {
          margin: 0;
          margin-top: 2px;
          line-height: 1.5;
        }

        .hero-subtitle {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-sm);
          align-items: center;
        }

        .hero-subtitle .badge {
          font-size: var(--font-xs);
          padding: var(--spacing-xs) var(--spacing-sm);
          animation: fadeInUp var(--duration-normal) var(--ease-in-out-cubic) forwards;
          opacity: 0;
          transform: translateY(10px);
        }

        .badge-primary {
          background: rgba(255, 107, 26, 0.12);
          border: 1px solid rgba(255, 107, 26, 0.3);
        }
        .badge-info {
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        .badge-success {
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.3);
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
          flex-shrink: 0;
        }

        .header.compact .header-actions .btn-lg {
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: var(--font-sm);
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
          .header.compact {
            padding: var(--spacing-sm) 0;
          }

          .header-content {
            flex-direction: column;
            align-items: stretch;
            gap: var(--spacing-md);
          }

          .header-logo {
            text-align: center;
            align-items: center;
          }

          .header-logo h1 {
            font-size: var(--font-2xl);
          }

          .header-logo-center {
            order: -1;
            margin-bottom: var(--spacing-sm);
          }

          .app-logo {
            height: 200px;
            max-width: 700px;
            margin: 0 auto;
          }
          .header.compact .app-logo {
            height: 110px;
            max-width: 480px;
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


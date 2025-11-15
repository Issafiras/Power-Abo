/**
 * Header komponent - Steve Jobs / Apple Design
 * Elegant, minimalistisk og sofistikeret header med perfekt attention to detail
 */

import React, { useState, useEffect } from 'react';
import Icon from './common/Icon';
import ScrollProgress from './common/ScrollProgress';

function Header({ 
  onReset, 
  onPresentationToggle, 
  theme, 
  onThemeToggle,
  onSmartCalculatorToggle,
  currentSection,
  cartCount = 0,
  onCartClick,
  onFindSolutionClick,
  canFindSolution = false
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
        if (onPresentationToggle) {
          onPresentationToggle();
        }
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

  // Apple-style scroll detection - smooth and performant
  useEffect(() => {
    let ticking = false;
    
    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsCompact(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Section name mapping for display
  const sectionNames = {
    'customer-situation': 'Kundens Situation',
    'plans-section': 'Abonnementer',
    'comparison-section': 'Sammenligning'
  };

  const currentSectionName = currentSection ? sectionNames[currentSection] || null : null;

  const handleResetConfirm = () => {
    onReset();
    setShowConfirm(false);
  };

  return (
    <header className={`apple-header fade-in-down ${isCompact ? 'apple-header--compact' : ''}`}>
      {/* Scroll progress bar */}
      <ScrollProgress currentSection={currentSectionName} />

      {/* Ultra minimal background blur layer - Steve Jobs Perfection */}
      <div className="apple-header__backdrop" aria-hidden="true" />

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
            <h3 id="reset-dialog-title">Bekræft nulstilling</h3>
            <p className="text-secondary">
              Er du sikker på, at du vil nulstille alt? Dette kan ikke fortrydes.
            </p>
            <div className="modal-actions">
              <button 
                onClick={() => setShowConfirm(false)} 
                className="btn btn-glass"
                aria-label="Annullér nulstilling"
              >
                Annullér
              </button>
              <button 
                onClick={handleResetConfirm} 
                className="btn btn-premium"
                aria-label="Bekræft nulstilling"
              >
                Ja, nulstil alt
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="apple-header__nav" aria-label="Hovednavigation">
        <div className="apple-header__container">
          {/* Logo - Centered Apple Style */}
        <div className="apple-header__logo">
          {(() => {
            const logoSrc = `${import.meta.env.BASE_URL}power-logo-white.png?v=1`;
            return (
                <a href="#" className="apple-header__logo-link" aria-label="Power Abonnement">
              <img
                src={logoSrc}
                alt="Power Abonnement"
                className="apple-header__logo-image"
                loading="eager"
                width="200"
                height="60"
                decoding="async"
              />
                </a>
            );
          })()}
        </div>

          {/* Navigation Links - Apple Style Subtle */}
          <div className="apple-header__nav-links">
          {/* Quick Action: Find bedste løsning */}
          {canFindSolution && onFindSolutionClick && (
            <button
              onClick={onFindSolutionClick}
              className="apple-header__nav-link apple-header__nav-link--primary"
              title="Find bedste løsning"
              aria-label="Find bedste løsning"
            >
              <Icon name="rocket" size={16} className="icon-inline icon-spacing-xs" />
              Find løsning
            </button>
          )}

          {/* Cart badge */}
          {cartCount > 0 && onCartClick && (
            <button
              onClick={onCartClick}
              className="apple-header__nav-link apple-header__nav-link--cart"
              title={`Kurv: ${cartCount} abonnementer`}
              aria-label={`Kurv: ${cartCount} abonnementer`}
            >
              <Icon name="cart" size={16} className="icon-inline icon-spacing-xs" />
              Kurv
              <span className="cart-badge">{cartCount}</span>
            </button>
          )}

          {onPresentationToggle && (
            <button
              onClick={onPresentationToggle}
                className="apple-header__nav-link"
              title="Vis præsentation (Ctrl+P)"
              aria-label="Vis præsentation"
            >
                Præsentér
            </button>
          )}
          </div>

          {/* Actions - Right Side Minimal */}
          <div className="apple-header__actions">
            {onSmartCalculatorToggle && (
              <button
                onClick={onSmartCalculatorToggle}
                className="apple-header__action-icon"
                title="AI Anbefaling"
                aria-label="AI Anbefaling"
              >
                <span className="apple-header__icon-text">AI</span>
              </button>
            )}

            <button
              onClick={onThemeToggle}
              className="apple-header__action-icon"
              title="Skift tema (Ctrl+T)"
              aria-label="Skift tema"
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
            </button>

            <button
              onClick={() => setShowConfirm(true)}
              className="apple-header__action-icon"
              title="Nulstil alt (Ctrl+R)"
              aria-label="Nulstil"
            >
              <Icon name="reset" size={20} />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;

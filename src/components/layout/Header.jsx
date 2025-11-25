/**
 * Header komponent - Modern Minimalist Design
 * Elegant, minimalistisk header med bedre navigation og accessibility
 */

import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../common/Icon';
import Button from '../ui/Button';

function Header({ 
  onReset, 
  onPresentationToggle, 
  theme, 
  onThemeToggle,
  cartCount = 0,
  onCartClick
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyPress(e) {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }
      
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

  // Smooth scroll detection - optimized performance
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

  const handleResetConfirm = useCallback(() => {
    setShowConfirm(false);
    // Hard refresh - genindlæs siden helt fra serveren
    window.location.reload(true);
  }, []);

  const handleCartClick = useCallback(() => {
    if (onCartClick) {
      onCartClick();
    }
  }, [onCartClick]);

  return (
    <>
      <header 
        className={`header-modern ${isCompact ? 'header-modern--compact' : ''}`}
        role="banner"
        aria-label="Hovednavigation"
      >
        {/* Backdrop blur layer */}
        <div className="header-modern__backdrop" aria-hidden="true" />

        <nav className="header-modern__nav" aria-label="Hovednavigation">
          <div className="header-modern__container">
            {/* Logo */}
            <div className="header-modern__logo">
              <a 
                href="#" 
                className="header-modern__logo-link" 
                aria-label="Power Abonnement - Gå til toppen"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <img
                  src={`${import.meta.env.BASE_URL}power-logo-white.png?v=1`}
                  alt="Power Abonnement"
                  className="header-modern__logo-image"
                  loading="eager"
                  width="200"
                  height="60"
                  decoding="async"
                />
              </a>
            </div>

            {/* Actions - Right Side */}
            <div className="header-modern__actions">
              {/* Cart Button */}
              {cartCount > 0 && (
                <button
                  onClick={handleCartClick}
                  className="header-modern__cart-btn"
                  aria-label={`Kurv med ${cartCount} ${cartCount === 1 ? 'vare' : 'varer'}`}
                  title="Se kurv"
                >
                  <Icon name="shopping-cart" size={20} />
                  {cartCount > 0 && (
                    <span className="header-modern__cart-badge" aria-hidden="true">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
              )}

              {/* Presentation Toggle */}
              <button
                onClick={onPresentationToggle}
                className="header-modern__action-btn"
                title="Præsentationsvisning (Ctrl+P)"
                aria-label="Skift præsentationsvisning"
              >
                <Icon name="presentation" size={20} />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={onThemeToggle}
                className="header-modern__action-btn"
                title="Skift tema (Ctrl+T)"
                aria-label={`Skift til ${theme === 'dark' ? 'lyst' : 'mørkt'} tema`}
              >
                <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
              </button>

              {/* Reset Button */}
              <button
                onClick={() => setShowConfirm(true)}
                className="header-modern__action-btn header-modern__action-btn--danger"
                title="Nulstil alt (Ctrl+R)"
                aria-label="Nulstil alt"
              >
                <Icon name="refresh-cw" size={20} />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Reset confirmation dialog */}
      {showConfirm && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowConfirm(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-dialog-title"
        >
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
          >
            <h3 id="reset-dialog-title">Bekræft nulstilling</h3>
            <p className="text-secondary">
              Er du sikker på, at du vil nulstille alt? Dette kan ikke fortrydes.
            </p>
            <div className="modal-actions">
              <Button 
                onClick={() => setShowConfirm(false)} 
                variant="outline"
                aria-label="Annullér nulstilling"
              >
                Annullér
              </Button>
              <Button 
                onClick={handleResetConfirm} 
                variant="danger"
                aria-label="Bekræft nulstilling"
              >
                Ja, nulstil alt
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default React.memo(Header);

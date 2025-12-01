/**
 * Header komponent - Modern Minimalist Design
 * Elegant, minimalistisk header med bedre navigation og accessibility
 */

import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../common/Icon';
import Button from '../ui/Button';
import { resetAll } from '../../utils/storage';

function Header({
  onReset,
  onPresentationToggle,
  theme,
  onThemeToggle,
  cartCount = 0,
  onCartClick,
  onHelpClick
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
      // F1 or Ctrl+H: Help
      if (e.key === 'F1' || (e.ctrlKey && e.key === 'h')) {
        e.preventDefault();
        if (onHelpClick) {
          onHelpClick();
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onPresentationToggle, onThemeToggle, onHelpClick]);

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
    // Clear all local storage
    resetAll();
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

              {/* Help Button */}
              <button
                onClick={onHelpClick}
                className="header-modern__action-btn"
                title="Hjælp og brugervejledning"
                aria-label="Åbn hjælp og brugervejledning"
              >
                <Icon name="help" size={20} />
              </button>

              {/* Presentation Toggle */}
              <button
                onClick={onPresentationToggle}
                className="header-modern__action-btn"
                title="Præsentationsvisning (Ctrl+P)"
                aria-label="Skift præsentationsvisning"
              >
                <Icon name="presentation" size={20} />
              </button>

              {/* Coverage Map Button */}
              <div className="header-modern__action-wrapper" style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    // Toggle logic handled by local state or separate component if needed
                    // For now using a simple state in Header
                    const menu = document.getElementById('coverage-menu');
                    if (menu) {
                      menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                    }
                  }}
                  className="header-modern__action-btn"
                  title="Dækningskort"
                  aria-label="Se dækningskort"
                  aria-expanded="false"
                  aria-controls="coverage-menu"
                >
                  <Icon name="signal" size={20} />
                </button>

                {/* Dropdown Menu */}
                <div
                  id="coverage-menu"
                  className="header-modern__dropdown"
                  style={{
                    display: 'none',
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: 'rgba(30, 30, 30, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '8px',
                    minWidth: '200px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    zIndex: 1000
                  }}
                >
                  <a
                    href="https://www.telmore.dk/internet/daekningskort"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="header-modern__dropdown-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      color: '#fff',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      transition: 'background 0.2s',
                      fontSize: '14px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Icon name="map" size={16} />
                    <span>Telmore Dækning</span>
                  </a>
                  <a
                    href="https://www.telenor.dk/kundeservice/drift-og-dakning/dakning/dakningskort/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="header-modern__dropdown-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      color: '#fff',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      transition: 'background 0.2s',
                      fontSize: '14px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Icon name="map" size={16} />
                    <span>Telenor/CBB Dækning</span>
                  </a>
                </div>
              </div>

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

// Add click outside listener to close dropdown
if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    const menu = document.getElementById('coverage-menu');
    const btn = e.target.closest('.header-modern__action-btn');
    // If click is outside menu AND not on the button that toggles it
    if (menu && menu.style.display === 'block' && !menu.contains(e.target) && (!btn || btn.getAttribute('aria-controls') !== 'coverage-menu')) {
      menu.style.display = 'none';
    }
  });
}

export default React.memo(Header);

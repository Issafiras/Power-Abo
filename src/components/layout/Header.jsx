/**
 * Header komponent - Modern Minimalist Design
 * Elegant, minimalistisk header med bedre navigation og accessibility
 */

import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import Icon from '../common/Icon';
import Button from '../ui/Button';
import { resetAll } from '../../utils/storage';

const ShareModal = lazy(() => import('../common/ShareModal'));

function Header({
  onReset,
  onPresentationToggle,
  theme,
  onThemeToggle,
  cartCount = 0,
  onCartClick,
  onHelpClick,
  onWhatsNewClick,
  onAdminToggle,
  showAdmin = false
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

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

      // Ctrl+Shift+A: Admin Dashboard
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        if (onAdminToggle) {
          onAdminToggle();
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onPresentationToggle, onThemeToggle, onHelpClick, onAdminToggle]);

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
        className={`apple-header ${isCompact ? 'apple-header--compact' : ''}`}
        role="banner"
        aria-label="Hovednavigation"
      >
        {/* Backdrop blur layer */}
        <div className="apple-header__backdrop" aria-hidden="true" />

        <nav className="apple-header__nav" aria-label="Hovednavigation">
          <div className="apple-header__container">

            {/* Logo Area */}
            <div className="apple-header__logo">
              <a
                href="#"
                className="apple-header__logo-link"
                aria-label="Power Abonnement - Gå til toppen"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <img
                  src={`${import.meta.env.BASE_URL}power-logo-white.png?v=1`}
                  alt="Power Abonnement"
                  className="apple-header__logo-image"
                  loading="eager"
                  style={{ height: 'auto', width: 'auto', maxHeight: isCompact ? '32px' : '40px' }}
                  width="140"
                  height="44"
                  decoding="async"
                />
              </a>
            </div>

            {/* Navigation Links (Desktop) */}
            <div className="apple-header__nav-links hidden-mobile">
              <button onClick={onHelpClick} className="apple-header__nav-link">Hjælp</button>
              <button onClick={onWhatsNewClick} className="apple-header__nav-link">Nyheder</button>
              <button
                onMouseEnter={() => document.getElementById('coverage-menu').style.display = 'block'}
                className="apple-header__nav-link"
              >
                Dækning
              </button>
            </div>

            {/* Actions - Right Side */}
            <div className="apple-header__actions">

              {/* Coverage Menu (Dropdown) */}
              <div
                id="coverage-menu"
                className="header-modern__dropdown" /* Reusing existing dropdown style for now */
                style={{
                  display: 'none',
                  position: 'absolute',
                  top: '60px',
                  right: '10px',
                  marginTop: '8px',
                  background: 'rgba(30, 30, 30, 0.98)',
                  backdropFilter: 'blur(30px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '20px',
                  padding: '10px',
                  minWidth: '240px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                  zIndex: 1000
                }}
                onMouseLeave={() => document.getElementById('coverage-menu').style.display = 'none'}
              >
                <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 'bold', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dækningskort</div>
                <a href="https://www.telmore.dk/internet/daekningskort" target="_blank" rel="noopener noreferrer" className="header-modern__dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: '#fff', textDecoration: 'none', borderRadius: '12px', transition: 'background 0.2s', fontSize: '14px', fontWeight: '600' }}>
                  <div style={{ background: '#002788', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="map" size={16} /></div> <span>Telmore</span>
                </a>
                <a href="https://www.telenor.dk/kundeservice/drift-og-dakning/dakning/dakningskort/" target="_blank" rel="noopener noreferrer" className="header-modern__dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: '#fff', textDecoration: 'none', borderRadius: '12px', transition: 'background 0.2s', fontSize: '14px', fontWeight: '600' }}>
                  <div style={{ background: '#0207b2', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="map" size={16} /></div> <span>Telenor / CBB</span>
                </a>
              </div>

              {/* Coverage Toggle (Mobile) */}
              <button
                onClick={() => {
                  const menu = document.getElementById('coverage-menu');
                  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                }}
                className="apple-header__action-icon"
                title="Dækning"
              >
                <Icon name="map" size={18} />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={onThemeToggle}
                className="apple-header__action-icon"
                title="Skift tema"
              >
                <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
              </button>

              {/* Presentation Toggle */}
              <button
                onClick={onPresentationToggle}
                className="apple-header__action-icon"
                title="Præsentation"
              >
                <Icon name="presentation" size={18} />
              </button>

              {/* Share Button */}
              <button
                onClick={() => setShowShareModal(true)}
                className="apple-header__action-icon"
                title="Del"
              >
                <Icon name="share" size={18} />
              </button>

              {/* Cart Button (Highlighted) */}
              {cartCount > 0 && (
                <button
                  onClick={handleCartClick}
                  className="apple-header__nav-link apple-header__nav-link--primary ml-2" /* Added margin left */
                  title="Se kurv"
                >
                  <span>Kurv</span>
                  <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
                </button>
              )}

              {/* Reset Button */}
              <button
                onClick={() => setShowConfirm(true)}
                className="apple-header__action-icon"
                title="Nulstil"
                style={{ color: 'var(--color-danger)' }}
              >
                <Icon name="refresh-cw" size={18} />
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

      {/* Share Modal */}
      {showShareModal && (
        <Suspense fallback={null}>
          <ShareModal onClose={() => setShowShareModal(false)} />
        </Suspense>
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

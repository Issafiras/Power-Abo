/**
 * HelpButton komponent
 * Floating help button med guide pop-up
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from './common/Icon';
import Guide from './Guide';

function HelpButton() {
  const [showGuide, setShowGuide] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sikre at komponenten kun renderes på klienten og document.body er klar
  useEffect(() => {
    if (typeof window !== 'undefined' && document.body) {
      setMounted(true);
    }
  }, []);

  // Keyboard shortcut: ? eller H for at åbne guide
  useEffect(() => {
    function handleKeyPress(e) {
      if ((e.key === '?' || e.key === 'h' || e.key === 'H') && !e.ctrlKey && !e.metaKey) {
        // Tjek at vi ikke er i et input felt
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
        e.preventDefault();
        setShowGuide(prev => !prev);
      }
      // ESC for at lukke
      if (e.key === 'Escape' && showGuide) {
        setShowGuide(false);
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showGuide]);

  // Lås body scroll når guide er åben
  useEffect(() => {
    if (showGuide) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [showGuide]);

  if (!mounted) return null;

  return (
    <>
      {/* Floating help button - Portal til body for at sikre den altid er synlig */}
      {createPortal(
        <button
          className="help-button"
          onClick={() => setShowGuide(true)}
          aria-label="Vis brugerguide"
          title="Vis brugerguide (tryk ? eller H)"
        >
          <Icon name="helpCircle" size={24} />
        </button>,
        document.body
      )}

      {/* Guide modal */}
      {showGuide && createPortal(
        <div
          className="guide-modal-overlay"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="guide-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <Guide onClose={() => setShowGuide(false)} />
          </div>
        </div>,
        document.body
      )}

      <style>{`
        .help-button {
          position: fixed !important;
          bottom: var(--spacing-xl) !important;
          right: var(--spacing-xl) !important;
          width: 64px !important;
          height: 64px !important;
          border-radius: 50% !important;
          background: linear-gradient(135deg, var(--color-orange), var(--color-orange-dark)) !important;
          border: 2px solid rgba(255, 255, 255, 0.2) !important;
          color: white !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: 
            0 8px 32px rgba(255, 109, 31, 0.4),
            0 0 0 0 rgba(255, 109, 31, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
          z-index: 99999 !important;
          transition: all var(--transition-base) !important;
          pointer-events: auto !important;
          margin: 0 !important;
          padding: 0 !important;
          transform: translateZ(0) !important;
          will-change: transform !important;
          -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
          backdrop-filter: blur(20px) saturate(180%) !important;
        }

        .help-button:hover {
          box-shadow: 
            0 12px 48px rgba(255, 109, 31, 0.6),
            0 0 0 4px rgba(255, 109, 31, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
          transform: translateY(-4px) scale(1.05) !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
        }

        .help-button:active {
          transform: translateY(-2px) scale(0.98) !important;
          box-shadow: 
            0 6px 24px rgba(255, 109, 31, 0.5),
            0 0 0 2px rgba(255, 109, 31, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
        }

        .guide-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: var(--spacing-lg);
          overflow-y: auto;
        }

        .guide-modal-content {
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          margin: auto;
          background: var(--glass-bg);
          border-radius: var(--radius-xl);
          border: 1px solid var(--glass-border);
          box-shadow: 
            0 24px 64px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          backdrop-filter: blur(20px) saturate(180%);
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .help-button {
            bottom: var(--spacing-lg);
            right: var(--spacing-lg);
            width: 48px;
            height: 48px;
          }

          .guide-modal-overlay {
            padding: var(--spacing-sm);
          }

          .guide-modal-content {
            max-height: 95vh;
          }
        }
      `}</style>
    </>
  );
}

export default HelpButton;


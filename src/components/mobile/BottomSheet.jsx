/**
 * BottomSheet komponent
 * Mobile-optimized bottom sheet pattern for abonnements-valg
 */

import { useEffect } from 'react';
import Icon from '../common/Icon';

export default function BottomSheet({ isOpen, onClose, title, children }) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="bottom-sheet-backdrop"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className="bottom-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bottom-sheet-title"
      >
            {/* Handle */}
            <div className="bottom-sheet-handle" aria-hidden="true">
              <div className="bottom-sheet-handle-bar" />
            </div>

            {/* Header */}
            <div className="bottom-sheet-header">
              <h2 id="bottom-sheet-title" className="bottom-sheet-title">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="bottom-sheet-close"
                aria-label="Luk"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="bottom-sheet-content">
              {children}
            </div>
          </div>
        </>
      );
}


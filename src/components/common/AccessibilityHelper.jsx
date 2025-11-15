/**
 * AccessibilityHelper komponent
 * Håndterer globale accessibility features som skip links og aria-live regions
 */

import { useEffect } from 'react';

export function SkipLinks() {
  useEffect(() => {
    // Tilføj skip link hvis den ikke eksisterer
    if (document.getElementById('skip-to-main')) return;

    const skipLink = document.createElement('a');
    skipLink.id = 'skip-to-main';
    skipLink.href = '#main-content';
    skipLink.textContent = 'Spring til hovedindhold';
    skipLink.className = 'sr-only skip-link';
    skipLink.style.cssText = `
      position: absolute;
      top: -60px;
      left: var(--spacing-md);
      background: linear-gradient(135deg, var(--color-orange), var(--color-orange-dark));
      color: white;
      padding: var(--spacing-md) var(--spacing-lg);
      text-decoration: none;
      z-index: 10000;
      border-radius: var(--radius-md);
      font-weight: var(--font-semibold);
      font-size: var(--font-base);
      transition: top var(--transition-base), transform var(--transition-fast);
      box-shadow: 0 4px 16px rgba(255, 109, 31, 0.4);
      border: 2px solid rgba(255, 255, 255, 0.2);
    `;
    skipLink.onfocus = function() {
      this.style.top = 'var(--spacing-md)';
      this.style.transform = 'scale(1.02)';
    };
    skipLink.onblur = function() {
      this.style.top = '-60px';
      this.style.transform = 'scale(1)';
    };

    document.body.insertBefore(skipLink, document.body.firstChild);

    return () => {
      const existing = document.getElementById('skip-to-main');
      if (existing) {
        existing.remove();
      }
    };
  }, []);

  return null;
}

export function AriaLiveRegion({ message, priority = 'polite' }) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
      style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}
    >
      {message}
    </div>
  );
}

export default function AccessibilityHelper() {
  return (
    <>
      <SkipLinks />
    </>
  );
}


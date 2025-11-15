/**
 * useKeyboardNavigation hook
 * Håndterer keyboard navigation for accessibility
 */

import { useEffect, useCallback } from 'react';

/**
 * Hook til at håndtere keyboard navigation
 * @param {Object} options - Navigation options
 * @param {Function} options.onEnter - Handler for Enter key
 * @param {Function} options.onEscape - Handler for Escape key
 * @param {Function} options.onArrowUp - Handler for ArrowUp key
 * @param {Function} options.onArrowDown - Handler for ArrowDown key
 * @param {Function} options.onArrowLeft - Handler for ArrowLeft key
 * @param {Function} options.onArrowRight - Handler for ArrowRight key
 * @param {Array} options.enabledKeys - Liste af keys der skal håndteres (default: alle)
 */
export function useKeyboardNavigation({
  onEnter,
  onEscape,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  enabledKeys = ['Enter', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
}) {
  const handleKeyDown = useCallback((event) => {
    // Ignorer hvis brugeren er i et input felt (undtagen Escape)
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA' ||
      event.target.isContentEditable
    ) {
      if (event.key === 'Escape' && onEscape) {
        onEscape(event);
      }
      return;
    }

    // Ignorer hvis modifier keys er aktive (undtagen Enter)
    if (event.ctrlKey || event.metaKey || event.altKey) {
      if (event.key === 'Enter' && onEnter) {
        onEnter(event);
      }
      return;
    }

    // Håndter navigation keys
    switch (event.key) {
      case 'Enter':
        if (enabledKeys.includes('Enter') && onEnter) {
          event.preventDefault();
          onEnter(event);
        }
        break;
      case 'Escape':
        if (enabledKeys.includes('Escape') && onEscape) {
          event.preventDefault();
          onEscape(event);
        }
        break;
      case 'ArrowUp':
        if (enabledKeys.includes('ArrowUp') && onArrowUp) {
          event.preventDefault();
          onArrowUp(event);
        }
        break;
      case 'ArrowDown':
        if (enabledKeys.includes('ArrowDown') && onArrowDown) {
          event.preventDefault();
          onArrowDown(event);
        }
        break;
      case 'ArrowLeft':
        if (enabledKeys.includes('ArrowLeft') && onArrowLeft) {
          event.preventDefault();
          onArrowLeft(event);
        }
        break;
      case 'ArrowRight':
        if (enabledKeys.includes('ArrowRight') && onArrowRight) {
          event.preventDefault();
          onArrowRight(event);
        }
        break;
      default:
        break;
    }
  }, [onEnter, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, enabledKeys]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

/**
 * Hook til at håndtere focus trap i modals
 */
export function useFocusTrap(ref, isActive = true) {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus første element når modal åbnes
    firstElement?.focus();

    element.addEventListener('keydown', handleTab);
    return () => {
      element.removeEventListener('keydown', handleTab);
    };
  }, [ref, isActive]);
}

/**
 * Hook til at håndtere skip links
 */
export function useSkipLinks() {
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
      top: -40px;
      left: 0;
      background: var(--color-orange);
      color: white;
      padding: var(--spacing-sm) var(--spacing-md);
      text-decoration: none;
      z-index: 10000;
      border-radius: 0 0 var(--radius-md) 0;
    `;
    skipLink.onfocus = function() {
      this.style.top = '0';
    };
    skipLink.onblur = function() {
      this.style.top = '-40px';
    };

    document.body.insertBefore(skipLink, document.body.firstChild);
  }, []);
}

export default useKeyboardNavigation;


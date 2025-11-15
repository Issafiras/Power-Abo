/**
 * ScrollProgress komponent
 * Viser scroll-progress bar og aktuel sektion i header
 */

import { useState, useEffect } from 'react';

function ScrollProgress({ currentSection, onSectionClick }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showToTop, setShowToTop] = useState(false);

  useEffect(() => {
    let ticking = false;

    function updateScrollProgress() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
          
          setScrollProgress(progress);
          setShowToTop(scrollTop > 400);
          
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress(); // Initial update

    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Progress bar */}
      <div 
        className="scroll-progress-bar" 
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      {/* Section name indicator - vises i compact mode */}
      {currentSection && (
        <div className="scroll-section-indicator" aria-label={`Aktuel sektion: ${currentSection}`}>
          {currentSection}
        </div>
      )}

      {/* Til top knap */}
      {showToTop && (
        <button
          className="scroll-to-top-btn"
          onClick={scrollToTop}
          aria-label="Scroll til top"
          title="Scroll til top"
        >
          ↑
        </button>
      )}

      <style>{`
        .scroll-progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--color-orange), var(--color-telenor), var(--color-cbb), var(--color-orange));
          background-size: 300% 100%;
          z-index: calc(var(--z-sticky) + 1);
          transition: width 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            0 0 12px rgba(255, 109, 31, 0.7),
            0 0 24px rgba(255, 109, 31, 0.4);
          animation: gradientShift 3s ease infinite;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .scroll-section-indicator {
          position: absolute;
          top: 50%;
          left: var(--spacing-md);
          transform: translateY(-50%);
          font-size: var(--font-xs);
          font-weight: var(--font-medium);
          color: rgba(255, 255, 255, 0.7);
          white-space: nowrap;
          opacity: 0;
          transition: opacity var(--transition-base);
          pointer-events: none;
        }

        .apple-header--compact .scroll-section-indicator {
          opacity: 1;
        }

        .scroll-to-top-btn {
          position: fixed;
          bottom: var(--spacing-xl);
          right: var(--spacing-xl);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-orange), var(--color-orange-dark));
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          font-size: var(--font-xl);
          font-weight: var(--font-bold);
          cursor: pointer;
          z-index: var(--z-fixed);
          box-shadow: 
            0 4px 16px rgba(255, 109, 31, 0.4),
            0 0 24px rgba(255, 109, 31, 0.3);
          transition: all var(--transition-base);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: translateY(20px) scale(0.9);
          animation: slideInUp 0.3s var(--ease-out-back) forwards;
        }

        .scroll-to-top-btn:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 
            0 8px 24px rgba(255, 109, 31, 0.6),
            0 0 32px rgba(255, 109, 31, 0.4);
        }

        .scroll-to-top-btn:active {
          transform: translateY(0) scale(0.98);
        }

        @keyframes slideInUp {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 900px) {
          .scroll-to-top-btn {
            bottom: calc(var(--spacing-md) + env(safe-area-inset-bottom));
            right: var(--spacing-md);
            width: 44px;
            height: 44px;
            font-size: var(--font-lg);
          }

          .scroll-section-indicator {
            display: none; /* Skjul på mobil for plads */
          }
        }
      `}</style>
    </>
  );
}

export default ScrollProgress;


/**
 * Tooltip komponent
 * Simpel tooltip uden tunge dependencies
 */

import { useState } from 'react';

export default function Tooltip({ 
  children, 
  content, 
  side = 'top',
  ...props 
}) {
  const [isVisible, setIsVisible] = useState(false);

  if (!content) return children;

  return (
    <span
      className="tooltip-wrapper"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      {...props}
    >
      {children}
      {isVisible && (
        <div className={`tooltip-content tooltip-${side}`} role="tooltip">
          {content}
        </div>
      )}
      <style>{`
        .tooltip-wrapper {
          position: relative;
          display: inline-block;
        }

        .tooltip-content {
          position: absolute;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: var(--font-sm);
          color: var(--text-primary);
          box-shadow: var(--shadow-xl);
          backdrop-filter: blur(12px);
          z-index: var(--z-tooltip);
          max-width: 300px;
          white-space: nowrap;
          pointer-events: none;
        }

        .tooltip-top {
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 8px;
        }

        .tooltip-bottom {
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 8px;
        }

        .tooltip-left {
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-right: 8px;
        }

        .tooltip-right {
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-left: 8px;
        }
      `}</style>
    </span>
  );
}

/**
 * Skeleton Loading komponent
 * Let og hurtig skeleton loading indikator
 */

function Skeleton({ width, height, className = '', style = {} }) {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{ width, height, ...style }}
      aria-hidden="true"
    >
      <style>{`
        .skeleton {
          background: linear-gradient(
            120deg,
            color-mix(in srgb, var(--glass-bg) 60%, transparent) 0%,
            rgba(255, 255, 255, 0.08) 50%,
            color-mix(in srgb, var(--glass-bg) 60%, transparent) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
          border-radius: var(--radius-md);
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .skeleton {
            animation: none;
            background: var(--glass-bg);
          }
        }
      `}</style>
    </div>
  );
}

export default Skeleton;


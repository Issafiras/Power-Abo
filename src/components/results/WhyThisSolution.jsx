/**
 * WhyThisSolution komponent
 * Forklarer hvorfor denne løsning er den bedste for kunden
 */

import Icon from '../common/Icon';
import COPY from '../../constants/copy';

export default function WhyThisSolution({
  cartItems,
  selectedStreaming,
  savings,
  dataAmount,
  streamingCoverage
}) {
  const reasons = [];

  // Streaming coverage
  if (streamingCoverage) {
    const includedCount = streamingCoverage.included?.length || 0;
    if (includedCount > 0) {
      reasons.push({
        icon: 'tv',
        text: `Omfatter alle dine valgte streaming-tjenester (${includedCount} tjenester)`,
        highlight: true
      });
    }
  } else if (selectedStreaming && selectedStreaming.length > 0) {
    reasons.push({
      icon: 'tv',
      text: `Omfatter alle dine valgte streaming-tjenester (${selectedStreaming.length} tjenester)`,
      highlight: true
    });
  }

  // Data amount
  if (dataAmount) {
    reasons.push({
      icon: 'smartphone',
      text: `${dataAmount} GB data passer til dit forbrug`,
      highlight: false
    });
  }

  // Savings
  if (savings && savings > 0) {
    reasons.push({
      icon: 'wallet',
      text: `Du sparer ${Math.abs(savings).toLocaleString('da-DK')} kr. over 6 måneder`,
      highlight: true
    });
  }

  // Features
  reasons.push({
    icon: 'zap',
    text: '5G hastighed og EU roaming inkluderet',
    highlight: false
  });

  if (reasons.length === 0) {
    return null;
  }

  return (
    <div className="why-this-solution">
      <div className="why-header">
        <h3 className="why-title">
          <Icon name="info" size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Hvorfor denne løsning?
        </h3>
      </div>

      <ul className="why-reasons">
        {reasons.map((reason, index) => (
          <li
            key={index}
            className={`why-reason ${reason.highlight ? 'highlight' : ''}`}
          >
            <Icon 
              name={reason.icon} 
              size={18} 
              style={{ marginRight: '12px', verticalAlign: 'middle', flexShrink: 0 }} 
            />
            <span>{reason.text}</span>
          </li>
        ))}
      </ul>

      <div className="why-social-proof">
        <Icon name="users" size={16} style={{ marginRight: '6px', verticalAlign: 'middle', opacity: 0.7 }} />
        <span className="social-proof-text">
          Baseret på 500+ kunder med lignende behov
        </span>
      </div>

      <style>{`
        .why-this-solution {
          padding: var(--spacing-2xl);
          background: linear-gradient(135deg, 
            rgba(255, 109, 31, 0.12) 0%, 
            rgba(255, 109, 31, 0.06) 100%
          );
          border: 2px solid rgba(255, 109, 31, 0.25);
          border-radius: var(--radius-xl);
          margin-top: var(--spacing-xl);
          box-shadow: 
            0 8px 32px rgba(255, 109, 31, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          backdrop-filter: blur(20px) saturate(180%);
          transition: all var(--transition-base);
        }

        .why-this-solution:hover {
          border-color: rgba(255, 109, 31, 0.35);
          box-shadow: 
            0 12px 48px rgba(255, 109, 31, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          transform: translateY(-2px);
        }

        .why-header {
          margin-bottom: var(--spacing-lg);
        }

        .why-title {
          font-size: var(--font-xl);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          margin: 0;
          display: flex;
          align-items: center;
          letter-spacing: var(--letter-spacing-tight);
          line-height: var(--leading-tight);
        }

        .why-reasons {
          list-style: none;
          padding: 0;
          margin: 0 0 var(--spacing-lg) 0;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .why-reason {
          display: flex;
          align-items: flex-start;
          padding: var(--spacing-md) var(--spacing-lg);
          color: var(--text-secondary);
          font-size: var(--font-base);
          line-height: var(--leading-relaxed);
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-md);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all var(--transition-base);
        }

        .why-reason:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateX(4px);
        }

        .why-reason.highlight {
          color: var(--text-primary);
          font-weight: var(--font-semibold);
          background: linear-gradient(135deg, rgba(255, 109, 31, 0.1), rgba(255, 109, 31, 0.05));
          border-color: rgba(255, 109, 31, 0.2);
        }

        .why-reason.highlight:hover {
          background: linear-gradient(135deg, rgba(255, 109, 31, 0.15), rgba(255, 109, 31, 0.08));
          border-color: rgba(255, 109, 31, 0.3);
        }

        .why-reason.highlight .icon {
          color: var(--color-orange);
        }

        .why-social-proof {
          padding-top: var(--spacing-md);
          border-top: 1px solid rgba(255, 109, 31, 0.2);
          display: flex;
          align-items: center;
          font-size: var(--font-sm);
          color: var(--text-muted);
        }

        .social-proof-text {
          font-style: italic;
        }

        @media (max-width: 900px) {
          .why-this-solution {
            padding: var(--spacing-md);
          }

          .why-reasons {
            gap: var(--spacing-sm);
          }
        }
      `}</style>
    </div>
  );
}


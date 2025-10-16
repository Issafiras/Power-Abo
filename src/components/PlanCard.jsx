/**
 * PlanCard komponent
 * Viser en enkelt mobilplan med features og pris
 */

import { formatCurrency } from '../utils/calculations';

// Provider logo mapping
const providerLogos = {
  telenor: '/Power-Abo/logos/Telenor.png',
  telmore: '/Power-Abo/logos/Telmore.png',
  cbb: '/Power-Abo/logos/CBB.png'
};

export default function PlanCard({ plan, onAddToCart }) {
  const hasIntroPrice = plan.introPrice && plan.introMonths;
  const brandColor = plan.color || 'var(--color-orange)';
  const providerLogo = providerLogos[plan.provider.toLowerCase()];

  return (
    <div className="plan-card glass-card scale-in">
      {/* Provider badge */}
      <div className="plan-header" style={{ borderColor: brandColor }}>
        <div className="plan-provider">
          {providerLogo ? (
            <img 
              src={providerLogo} 
              alt={plan.provider}
              className="provider-logo"
            />
          ) : (
            <span style={{ color: brandColor }}>{plan.provider.toUpperCase()}</span>
          )}
        </div>
        {plan.familyDiscount && (
          <div className="badge badge-telenor bounce-in">👨‍👩‍👧‍👦 Familie</div>
        )}
      </div>

      {/* Plan navn og data */}
      <div className="plan-title">
        <h3 style={{ color: brandColor }}>{plan.name}</h3>
        <div className="plan-data">{plan.data}</div>
      </div>

      {/* Pris */}
      <div className="plan-pricing">
        {hasIntroPrice ? (
          <>
            <div className="price-intro">
              <span className="price-amount" style={{ color: brandColor }}>
                {formatCurrency(plan.introPrice)}
              </span>
              <span className="price-period">/md</span>
            </div>
            <div className="price-detail text-muted">
              i {plan.introMonths} {plan.introMonths === 1 ? 'måned' : 'måneder'}, 
              derefter {formatCurrency(plan.price)}/md
            </div>
          </>
        ) : (
          <div className="price-normal">
            <span className="price-amount" style={{ color: brandColor }}>
              {formatCurrency(plan.price)}
            </span>
            <span className="price-period">/md</span>
          </div>
        )}
        
        {plan.familyDiscount && (
          <div className="price-family text-sm text-muted">
            Samlerabat: -50 kr/md pr. ekstra linje
          </div>
        )}
      </div>

      {/* Features */}
      <div className="plan-features">
        {plan.features.map((feature, index) => (
          <span key={index} className="badge badge-info">
            {feature}
          </span>
        ))}
      </div>

      {/* Streaming (hvis inkluderet) */}
      {plan.streaming && plan.streaming.length > 0 && (
        <div className="plan-streaming">
          <div className="streaming-label">📺 Inkluderer:</div>
          <div className="streaming-count badge badge-success">
            {plan.streamingCount || plan.streaming.length} streaming-tjeneste
            {(plan.streamingCount || plan.streaming.length) !== 1 ? 'r' : ''}
          </div>
        </div>
      )}

      {/* Indtjening badge */}
      <div className="plan-earnings">
        <span className="earnings-label">💰 Indtjening:</span>
        <span className="earnings-amount text-success font-bold">
          {formatCurrency(plan.earnings)}
        </span>
      </div>

      {/* Add to cart knap */}
      <button
        onClick={() => onAddToCart(plan)}
        className="btn btn-primary plan-add-btn"
        style={{ 
          background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)`,
          boxShadow: `0 0 20px ${brandColor}40`
        }}
      >
        <span>Læg i kurv</span>
        <span>🛒</span>
      </button>

      <style jsx>{`
        .plan-card {
          display: flex;
          flex-direction: column;
          padding: var(--spacing-lg);
          gap: var(--spacing-md);
          transition: all var(--transition-smooth);
          cursor: pointer;
        }

        .plan-card:hover {
          transform: translateY(-6px) scale(1.02);
          z-index: 10;
        }

        .plan-card:active {
          transform: translateY(-2px) scale(0.99);
        }

        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: var(--spacing-sm);
          border-bottom: 2px solid;
        }

        .plan-provider {
          font-size: var(--font-xs);
          font-weight: var(--font-bold);
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
        }

        .provider-logo {
          height: 24px;
          width: auto;
          max-width: 120px;
          object-fit: contain;
          transition: all var(--transition-smooth);
        }

        .plan-card:hover .provider-logo {
          transform: scale(1.05);
          filter: brightness(1.1);
        }

        .plan-title h3 {
          margin: 0;
          font-size: var(--font-2xl);
        }

        .plan-data {
          font-size: var(--font-lg);
          color: var(--text-secondary);
          font-weight: var(--font-semibold);
        }

        .plan-pricing {
          padding: var(--spacing-md) 0;
        }

        .price-intro,
        .price-normal {
          display: flex;
          align-items: baseline;
          gap: var(--spacing-xs);
        }

        .price-amount {
          font-size: var(--font-3xl);
          font-weight: var(--font-extrabold);
        }

        .price-period {
          font-size: var(--font-base);
          color: var(--text-tertiary);
        }

        .price-detail {
          font-size: var(--font-sm);
          margin-top: var(--spacing-xs);
        }

        .price-family {
          margin-top: var(--spacing-xs);
          padding: var(--spacing-xs) var(--spacing-sm);
          background: rgba(56, 189, 248, 0.1);
          border-radius: var(--radius-sm);
        }

        .plan-features {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
        }

        .plan-streaming {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: rgba(16, 185, 129, 0.1);
          border-radius: var(--radius-md);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .streaming-label {
          font-size: var(--font-sm);
          font-weight: var(--font-semibold);
        }

        .plan-earnings {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-sm);
          background: var(--glass-bg);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .plan-earnings:hover {
          background: rgba(16, 185, 129, 0.1);
          transform: scale(1.02);
        }

        .earnings-label {
          font-size: var(--font-sm);
          color: var(--text-secondary);
        }

        .earnings-amount {
          font-size: var(--font-lg);
        }

        .plan-add-btn {
          margin-top: auto;
          width: 100%;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .plan-add-btn:hover {
          animation: pulseGlow 1s ease-in-out infinite;
        }

        @media (max-width: 900px) {
          .plan-card {
            padding: var(--spacing-md);
          }

          .price-amount {
            font-size: var(--font-2xl);
          }
        }
      `}</style>
    </div>
  );
}


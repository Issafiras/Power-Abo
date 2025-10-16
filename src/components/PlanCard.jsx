/**
 * PlanCard komponent
 * Viser en enkelt mobilplan med features og pris
 */

import { useState } from 'react';
import { formatCurrency } from '../utils/calculations';
import CBBMixSelector from './CBBMixSelector';

export default function PlanCard({ 
  plan, 
  onAddToCart, 
  onCBBMixToggle, 
  onCBBMixCountChange,
  cbbMixEnabled = false,
  cbbMixCount = 2
}) {
  const hasIntroPrice = plan.introPrice && plan.introMonths;
  const brandColor = plan.color || 'var(--color-orange)';

  return (
    <div className={`plan-card glass-card scale-in ${plan.provider === 'cbb' ? 'cbb-card' : ''}`}>
      {/* Provider badge */}
      <div className="plan-header" style={{ borderColor: brandColor }}>
        <div className="plan-provider" style={{ color: brandColor }}>
          {plan.provider.toUpperCase()}
        </div>
        {plan.familyDiscount && (
          <div className="badge badge-telenor bounce-in">👨‍👩‍👧‍👦 Familie</div>
        )}
        {plan.provider === 'cbb' && (
          <div className="cbb-5g-badge">5G</div>
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

      {/* CBB MIX Section */}
      {plan.cbbMixAvailable && (
        <div className="cbb-mix-section">
          <div className="mix-toggle">
            <label className="mix-toggle-label">
              <input 
                type="checkbox" 
                checked={cbbMixEnabled}
                onChange={(e) => onCBBMixToggle && onCBBMixToggle(plan.id, e.target.checked)}
                className="mix-checkbox"
              />
              <span className="mix-toggle-text">🎬 Tilføj CBB MIX</span>
            </label>
          </div>
          
          {cbbMixEnabled && (
            <CBBMixSelector
              selectedCount={cbbMixCount}
              onCountChange={(count) => onCBBMixCountChange && onCBBMixCountChange(plan.id, count)}
              cbbMixPricing={plan.cbbMixPricing}
            />
          )}
        </div>
      )}

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
          padding: var(--spacing-md);
          gap: var(--spacing-sm);
          transition: all var(--transition-base);
          cursor: pointer;
        }

        .plan-card:hover {
          transform: translateY(-3px);
          z-index: 10;
        }

        .plan-card:active {
          transform: translateY(-1px);
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

        .cbb-mix-section {
          margin: var(--spacing-sm) 0;
          padding: var(--spacing-sm);
          background: rgba(168, 85, 247, 0.1);
          border-radius: var(--radius-md);
          border: 1px solid rgba(168, 85, 247, 0.2);
        }

        .mix-toggle {
          margin-bottom: var(--spacing-sm);
        }

        .mix-toggle-label {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          cursor: pointer;
          font-weight: var(--font-semibold);
          color: var(--color-purple);
        }

        .mix-checkbox {
          width: 18px;
          height: 18px;
          accent-color: var(--color-purple);
        }

        .mix-toggle-text {
          font-size: var(--font-sm);
        }

        /* CBB Card Styling */
        .cbb-card {
          background: linear-gradient(135deg, #FFE4B5, #FFD700);
          border: 2px solid #DAA520;
          color: #8B4513;
        }

        .cbb-card .plan-header {
          background: rgba(255, 255, 255, 0.9);
          border-radius: var(--radius-md) var(--radius-md) 0 0;
          padding: var(--spacing-sm) var(--spacing-md);
          border-bottom: 2px solid #DAA520;
        }

        .cbb-card .plan-provider {
          color: #8B4513;
          font-weight: var(--font-bold);
          font-size: var(--font-sm);
        }

        .cbb-5g-badge {
          background: #DC143C;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: var(--font-xs);
          font-weight: var(--font-bold);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .cbb-5g-badge::before {
          content: "📶";
          font-size: 10px;
        }

        .cbb-card .plan-title h3 {
          color: #8B4513;
          font-size: var(--font-3xl);
          font-weight: var(--font-extrabold);
          margin: 0;
        }

        .cbb-card .plan-data {
          color: #8B4513;
          font-size: var(--font-sm);
          font-weight: var(--font-medium);
        }

        .cbb-card .plan-pricing {
          background: white;
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
          margin: var(--spacing-sm) 0;
          border: 1px solid #DAA520;
        }

        .cbb-card .price-amount {
          color: #8B4513;
          font-size: var(--font-2xl);
          font-weight: var(--font-extrabold);
        }

        .cbb-card .price-period {
          color: #8B4513;
          font-size: var(--font-sm);
        }

        .cbb-card .plan-features {
          margin: var(--spacing-sm) 0;
        }

        .cbb-card .badge {
          background: rgba(139, 69, 19, 0.1);
          color: #8B4513;
          border: 1px solid rgba(139, 69, 19, 0.3);
        }

        .cbb-card .plan-add-btn {
          background: linear-gradient(135deg, #8B4513, #A0522D);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
        }

        .cbb-card .plan-add-btn:hover {
          background: linear-gradient(135deg, #A0522D, #8B4513);
          box-shadow: 0 6px 16px rgba(139, 69, 19, 0.4);
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


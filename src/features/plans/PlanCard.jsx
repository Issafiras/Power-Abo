/**
 * PlanCard komponent
 * Viser en enkelt mobilplan med features og pris
 */

import React, { Suspense } from 'react';
import { formatCurrency, isCampaignActive, getCurrentPrice } from '../../utils/calculations';
import Icon from '../../components/common/Icon';
import COPY from '../../constants/copy';
import CBBMixSelector from '../streaming/CBBMixSelector';

function PlanCard({ 
  plan, 
  onAddToCart, 
  onCBBMixToggle, 
  onCBBMixCountChange,
  cbbMixEnabled = false,
  cbbMixCount = 2
}) {
  const hasIntroPrice = plan.introPrice && plan.introMonths;
  const brandColor = plan.color || 'var(--color-orange)';
  const campaignActive = isCampaignActive(plan);
  const currentPrice = getCurrentPrice(plan);

  return (
    <div
      className={`plan-card glass-card broadband-card broadband-card--${plan.provider}`}
      role="article"
      aria-label={`${plan.name} abonnement fra ${plan.provider}`}
    >
      {/* Ens design for alle provider typer - baseret på bredbånd design */}
      <div className="broadband-card-wrapper">
        {/* Header med logo og titel */}
        <div className="broadband-header">
          {plan.logo && (
            <img
              src={plan.logo}
              alt={plan.provider}
              className="broadband-logo"
              loading="lazy"
            />
          )}
          <div className="broadband-title">
            <h3 className="broadband-name">{plan.name}</h3>
            <div className="broadband-data">{plan.data}</div>
          </div>
        </div>

        {/* Pris sektion */}
        <div className="broadband-price">
          {hasIntroPrice ? (
            <>
              <div className="price-intro">
                <span className="price-amount">{formatCurrency(plan.introPrice)}</span>
                <span className="price-period">/md.</span>
              </div>
              <div className="price-detail text-muted">
                i {plan.introMonths} {plan.introMonths === 1 ? 'måned' : 'måneder'},
                derefter {formatCurrency(currentPrice)}/md.
              </div>
            </>
          ) : (
            <div className="price-normal">
              {campaignActive && plan.originalPrice && (
                <div className="price-original" style={{ textDecoration: 'line-through', opacity: 0.6, fontSize: '0.9em', marginBottom: '4px' }}>
                  {formatCurrency(plan.originalPrice)}/md.
                </div>
              )}
              <span className="price-amount">{formatCurrency(currentPrice)}</span>
              <span className="price-period">/md.{plan.business ? ' (ex. moms)' : ''}</span>
            </div>
          )}

          {/* Familie rabat */}
          {plan.familyDiscount && (
            <div className="price-family text-sm text-muted">
              <Icon name="users" size={16} className="icon-inline icon-spacing-xs" />
              -50 kr./md. pr. ekstra abonnement
            </div>
          )}

          {/* Kampagne badge */}
          {campaignActive && plan.campaign && (
            <div className="badge badge-campaign" style={{ marginTop: '8px', alignSelf: 'flex-start' }}>
              <Icon name="tag" size={16} className="icon-inline icon-spacing-xs" />
              Kampagne
            </div>
          )}
        </div>

        {/* Features */}
        <div className="broadband-features">
          {plan.features.map((feature, index) => (
            <span key={index} className="badge badge-info">
              {feature}
            </span>
          ))}

          {/* Streaming info hvis relevant */}
          {plan.streaming && plan.streaming.length > 0 && (
            <span className="badge badge-success">
              <Icon name="tv" size={14} className="icon-inline icon-spacing-xs" />
              {plan.streamingCount || plan.streaming.length} streaming-tjeneste{(plan.streamingCount || plan.streaming.length) !== 1 ? 'r' : ''}
            </span>
          )}

          {/* Most Popular badge */}
          {plan.mostPopular && (
            <span className="badge badge-telenor">
              <Icon name="star" size={14} className="icon-inline icon-spacing-xs" />
              Flest vælger
            </span>
          )}
        </div>
      </div>

      {/* CBB MIX Section */}
      {plan.cbbMixAvailable && (
        <div className="cbb-mix-section">
          <div className="mix-toggle">
            <label className="mix-toggle-label">
              <input 
                id={`cbb-mix-${plan.id}`}
                name={`cbb-mix-${plan.id}`}
                type="checkbox" 
                checked={cbbMixEnabled}
                onChange={(e) => onCBBMixToggle && onCBBMixToggle(plan.id, e.target.checked)}
                className="mix-checkbox"
              />
              <Icon name="film" size={18} className="icon-inline icon-spacing-sm" />
              <span className="mix-toggle-text">Tilføj CBB MIX</span>
            </label>
          </div>
          
          {cbbMixEnabled && (
            <Suspense fallback={<div className="skeleton" style={{ height: '100px', margin: 'var(--spacing-md)' }} />}>
              <CBBMixSelector
                selectedCount={cbbMixCount}
                onCountChange={(count) => onCBBMixCountChange && onCBBMixCountChange(plan.id, count)}
                cbbMixPricing={plan.cbbMixPricing}
              />
            </Suspense>
          )}
        </div>
      )}

      {/* Add to cart knap */}
      <button
        onClick={() => onAddToCart(plan)}
        className="btn btn-premium plan-add-btn"
        style={{ 
          background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)`,
          boxShadow: `0 0 20px ${brandColor}40`
        }}
        aria-label={`Tilføj ${plan.name} til kurv`}
      >
        <span className="btn-text">{COPY.cta.addToCartOriginal}</span>
        <Icon name="cart" size={20} className="cart-icon" aria-hidden="true" />
      </button>

      <style>{`
        .plan-card {
          display: flex;
          flex-direction: column;
          padding: var(--spacing-lg);
          gap: var(--spacing-md);
          transition: all var(--transition-base);  /* Max 300ms */
          cursor: pointer;
          position: relative;
        }

        .plan-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--gradient-glass);
          opacity: 0;
          transition: opacity var(--transition-base);  /* Max 300ms */
          border-radius: var(--radius-lg);
          pointer-events: none;
          z-index: -1;
        }

        .plan-card:hover {
          transform: translateY(-6px) scale(1.02) translateZ(0);  /* GPU accelerated lift */
          z-index: 10;
        }

        .plan-card:hover::before {
          opacity: 0.4;
        }

        .plan-card:active {
          transform: translateY(-1px) scale(0.99) translateZ(0);  /* GPU accelerated */
          transition: transform var(--transition-fast) var(--ease-apple);
        }

        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: var(--spacing-sm);
          border-bottom: 2px solid;
          position: relative;
          transition: all var(--transition-base);
        }

        .plan-card:hover .plan-header {
          transform: translateX(4px);
          border-bottom-width: 3px;
        }

        .plan-provider {
          font-size: var(--font-xs);
          font-weight: var(--font-bold);
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }

        .provider-logo {
          width: 20px;
          height: 20px;
          object-fit: contain;
          border-radius: 3px;
        }

        .plan-title h3 {
          margin: 0;
          font-size: var(--font-xl);
          line-height: var(--leading-tight);
        }

        .plan-data {
          font-size: var(--font-lg);
          color: var(--text-secondary);
          font-weight: var(--font-semibold);
        }

        .plan-pricing {
          padding: var(--spacing-sm) 0;
          position: relative;
          transition: all var(--transition-base);
        }

        .plan-card:hover .plan-pricing {
          transform: scale(1.04) translateZ(0);  /* GPU accelerated scale */
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
          transition: all var(--transition-base);
          display: inline-block;
        }

        .plan-card:hover .price-amount {
          transform: scale(1.08) translateZ(0);  /* GPU accelerated scale */
          text-shadow: 0 0 20px currentColor, 0 0 40px rgba(255, 109, 31, 0.5);  /* Glow effect */
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
          background: rgba(2, 7, 178, 0.1);
          border-radius: var(--radius-sm);
        }

        .plan-features {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
          margin-top: var(--spacing-xs);
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
          border-radius: var(--radius-lg);
          transform-style: preserve-3d;
        }

        .plan-add-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transition: left 0.6s ease;
        }

        .plan-add-btn:hover::before {
          left: 100%;
        }

        .plan-add-btn:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 
            0 16px 56px rgba(255, 109, 31, 0.6),
            0 0 60px rgba(255, 109, 31, 0.4);
          filter: brightness(1.1);
        }
        
        .plan-add-btn:active {
          transform: translateY(-1px) scale(0.98);
          transition: transform 100ms var(--ease-apple);
        }

        .plan-add-btn:hover .cart-icon {
          transform: scale(1.1);
          transition: transform var(--transition-fast);
        }

        .plan-add-btn:active .cart-icon {
          transform: scale(0.95);
        }

        .plan-add-btn .btn-text {
          transition: all var(--transition-fast);
        }

        .plan-add-btn:hover .btn-text {
          transform: translateX(-2px);
        }

        .cbb-mix-section {
          margin: var(--spacing-sm) 0;
          padding: var(--spacing-sm);
          background: rgba(65, 0, 22, 0.05);
          border-radius: var(--radius-md);
          border: 1px solid rgba(65, 0, 22, 0.2);
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
          color: #410016;
        }

        .mix-checkbox {
          width: 18px;
          height: 18px;
          accent-color: #410016;
        }

        .mix-toggle-text {
          font-size: var(--font-sm);
        }




        /* Bredbånd Card Styling - Ens design for alle providers */
        .broadband-card {
          border-radius: var(--radius-lg);
          overflow: hidden;
          position: relative;
        }

        /* Provider-specifikke farver */
        .broadband-card--broadband {
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
          border: 2px solid rgba(79, 70, 229, 0.3);
          color: white;
        }

        .broadband-card--broadband .plan-add-btn {
          background: linear-gradient(135deg, #4F46E5, #7C3AED);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .broadband-card--broadband .plan-add-btn:hover {
          background: linear-gradient(135deg, #7C3AED, #4F46E5);
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
        }

        .broadband-card--telenor,
        .broadband-card--telenor-b2b {
          background: linear-gradient(135deg, #0207b2 0%, #3b4fdb 100%);
          border: 2px solid rgba(2, 7, 178, 0.3);
          color: white;
        }

        .broadband-card--telenor .plan-add-btn,
        .broadband-card--telenor-b2b .plan-add-btn {
          background: linear-gradient(135deg, #0207b2, #3b4fdb);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(2, 7, 178, 0.3);
        }

        .broadband-card--telenor .plan-add-btn:hover,
        .broadband-card--telenor-b2b .plan-add-btn:hover {
          background: linear-gradient(135deg, #3b4fdb, #0207b2);
          box-shadow: 0 6px 20px rgba(2, 7, 178, 0.4);
        }

        .broadband-card--telmore {
          background: linear-gradient(135deg, #002788 0%, #003fa3 100%);
          border: 2px solid rgba(0, 39, 136, 0.3);
          color: white;
        }

        .broadband-card--telmore .plan-add-btn {
          background: linear-gradient(135deg, #002788, #003fa3);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(0, 39, 136, 0.3);
        }

        .broadband-card--telmore .plan-add-btn:hover {
          background: linear-gradient(135deg, #003fa3, #002788);
          box-shadow: 0 6px 20px rgba(0, 39, 136, 0.4);
        }

        .broadband-card--cbb {
          background: linear-gradient(135deg, #410016 0%, #6b0024 100%);
          border: 2px solid rgba(65, 0, 22, 0.3);
          color: white;
        }

        .broadband-card--cbb .plan-add-btn {
          background: linear-gradient(135deg, #410016, #6b0024);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(65, 0, 22, 0.3);
        }

        .broadband-card--cbb .plan-add-btn:hover {
          background: linear-gradient(135deg, #6b0024, #410016);
          box-shadow: 0 6px 20px rgba(65, 0, 22, 0.4);
        }

        .broadband-card-wrapper {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .broadband-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding-bottom: var(--spacing-sm);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .broadband-logo {
          width: 40px;
          height: 40px;
          object-fit: contain;
          filter: brightness(1.1);
        }

        .broadband-title {
          flex: 1;
        }

        .broadband-name {
          margin: 0;
          font-size: var(--font-lg);
          font-weight: var(--font-bold);
        }

        .broadband-data {
          font-size: var(--font-sm);
          opacity: 0.9;
          font-weight: var(--font-medium);
        }

        .broadband-price {
          padding: var(--spacing-sm) 0;
        }

        .broadband-price .price-amount {
          color: inherit;
        }

        .broadband-price .price-period {
          color: rgba(255, 255, 255, 0.8);
        }

        .broadband-features {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
        }

        .broadband-features .badge {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

         @media (max-width: 900px) {
          .plan-card {
            padding: var(--spacing-md);
          }

          .price-amount {
            font-size: var(--font-2xl);
          }

          /* Strømlinet Telenor design - mobile */
          .subscription-card__wrapper {
            padding: 16px;
            gap: 12px;
          }

          .subscription-card__header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding-bottom: 12px;
          }

          .subscription-card__header-top {
            width: 100%;
          }

          .subscription-card__price-block {
            text-align: left;
            width: 100%;
          }

          .subscription-card__data-amount {
            font-size: 22px;
          }

          .subscription-card__price-main {
            font-size: 20px;
          }

          .subscription-features-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .telenor-family-discount-compact {
            padding: 8px 12px;
          }

          .family-text {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}

export default React.memo(PlanCard);


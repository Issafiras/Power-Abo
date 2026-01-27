/**
 * PlanCard komponent
 * Viser en enkelt mobilplan med features og pris
 */

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
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
    <motion.div
      className={`plan-card glass-card broadband-card broadband-card--${plan.provider}`}
      role="article"
      aria-label={`${plan.name} abonnement fra ${plan.provider}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -6, zIndex: 10 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
                <motion.span
                  className="price-amount"
                  layoutId={`price-${plan.id}`}
                >
                  {formatCurrency(plan.introPrice)}
                </motion.span>
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
              <motion.span
                className="price-amount"
                layoutId={`price-${plan.id}`}
              >
                {formatCurrency(currentPrice)}
              </motion.span>
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
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <CBBMixSelector
                  selectedCount={cbbMixCount}
                  onCountChange={(count) => onCBBMixCountChange && onCBBMixCountChange(plan.id, count)}
                  cbbMixPricing={plan.cbbMixPricing}
                />
              </motion.div>
            </Suspense>
          )}
        </div>
      )}

      {/* Add to cart knap */}
      <motion.button
        onClick={() => onAddToCart(plan)}
        className="btn btn-premium plan-add-btn"
        style={{
          background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)`,
          boxShadow: `0 0 20px ${brandColor}40`
        }}
        aria-label={`Tilføj ${plan.name} til kurv`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="btn-text">{COPY.cta.addToCartOriginal}</span>
        <Icon name="cart" size={20} className="cart-icon" aria-hidden="true" />
      </motion.button>

      <style>{`
        .plan-card {
          display: flex;
          flex-direction: column;
          padding: var(--spacing-lg);
          gap: var(--spacing-md);
          cursor: pointer;
          position: relative;
          /* transition removed in favor of motion */
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
          transition: opacity 0.3s ease;
          border-radius: var(--radius-lg);
          pointer-events: none;
          z-index: -1;
        }

        .plan-card:hover::before {
          opacity: 0.6;
        }

        .broadband-card {
           backdrop-filter: blur(var(--blur-md));
           -webkit-backdrop-filter: blur(var(--blur-md));
           box-shadow: var(--shadow-glass);
           border: 1px solid var(--glass-border);
           transition: transform var(--transition-base), box-shadow var(--transition-base);
        }

        .broadband-card:hover {
           box-shadow: var(--shadow-floating);
           border-color: var(--glass-border-strong);
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

        .price-intro,
        .price-normal {
          display: flex;
          align-items: baseline;
          gap: var(--spacing-xs);
        }

        .price-amount {
          font-size: var(--font-3xl);
          font-weight: var(--font-extrabold);
          display: inline-block;
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
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-sm);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .plan-add-btn {
          margin-top: auto;
          width: 100%;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          border-radius: var(--radius-lg);
          /* transform-style: preserve-3d; handled by motion */
        }

        /* Keep the shine effect */
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
          color: var(--color-cbb);
        }

        .mix-checkbox {
          width: 18px;
          height: 18px;
          accent-color: var(--color-cbb);
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
          background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-secondary) 100%);
          border: 1px solid var(--glass-border);
          color: white;
        }

        .broadband-card--broadband .plan-add-btn {
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          color: white;
          border: none;
          box-shadow: 0 4px 12px var(--color-primary-glow);
        }

        .broadband-card--telenor,
        .broadband-card--telenor-b2b {
          background: linear-gradient(135deg, var(--color-telenor-dark) 0%, var(--color-telenor) 100%);
          border: 1px solid var(--glass-border);
          color: white;
        }

        .broadband-card--telenor .plan-add-btn,
        .broadband-card--telenor-b2b .plan-add-btn {
          background: linear-gradient(135deg, var(--color-telenor), var(--color-telenor-light));
          color: white;
          border: none;
          box-shadow: 0 4px 12px var(--color-telenor-glow);
        }

        .broadband-card--telmore {
          background: linear-gradient(135deg, #002788 0%, #0045B5 100%); /* Beholder Telmore blå da den ikke er i vars */
          border: 1px solid var(--glass-border);
          color: white;
        }

        .broadband-card--telmore .plan-add-btn {
          background: linear-gradient(135deg, #002788, #0045B5);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(0, 39, 136, 0.3);
        }

        .broadband-card--cbb {
          background: linear-gradient(135deg, #410016 0%, #6b0024 100%);
          border: 1px solid var(--glass-border);
          color: white;
        }

        .broadband-card--cbb .plan-add-btn {
          background: linear-gradient(135deg, #410016, #6b0024);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(65, 0, 22, 0.3);
        }

        .broadband-card-wrapper {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
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
    </motion.div>
  );
}

export default React.memo(PlanCard);


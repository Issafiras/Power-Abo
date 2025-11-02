/**
 * PlanCard komponent
 * Viser en enkelt mobilplan med features og pris
 */

import React from 'react';
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
    <div className={`plan-card glass-card scale-in ${plan.provider === 'cbb' ? 'cbb-card' : ''} ${plan.provider === 'telenor' || plan.provider === 'telenor-b2b' || plan.provider === 'telenor-bredbånd' ? 'telenor-card' : ''} ${plan.provider === 'telmore' || plan.provider === 'telmore-bredbånd' ? 'telmore-card' : ''}`}>
      {plan.provider === 'cbb' ? (
        // CBB specifik struktur
        <div className="refined-product-card__main-card">
          <div className="refined-product-card__main-card--product-content-area">
            {/* 5G badge */}
            <div className="connection-type-label">
              <div className="connection-type-label__content">
                <svg viewBox="0 0 20 15" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.7452 6.7506C16.336 7.3414 16.8474 8.058 17.2371 8.8199C17.4257 9.1886 17.2797 9.6405 16.9109 9.8291C16.5421 10.0177 16.0903 9.8717 15.9017 9.5029C15.5813 8.8766 15.1611 8.2878 14.6845 7.8112C12.1219 5.24857 7.96699 5.24857 5.40433 7.8112C4.90651 8.309 4.5021 8.8688 4.19074 9.4844C4.00378 9.854 3.55259 10.0021 3.18297 9.8151C2.81335 9.6281 2.66527 9.1769 2.85223 8.8073C3.23503 8.0505 3.73307 7.3612 4.34367 6.7506C7.49211 3.60212 12.5967 3.60212 15.7452 6.7506ZM13.6433 9.8194C14.0909 10.267 14.4592 10.8167 14.7154 11.4016C14.8817 11.781 14.7089 12.2233 14.3295 12.3895C13.9501 12.5558 13.5078 12.383 13.3416 12.0036C13.1585 11.5858 12.8948 11.1922 12.5827 10.8801C11.1799 9.4773 8.9056 9.4773 7.5029 10.8801C7.19239 11.1906 6.94028 11.5688 6.7557 11.9906C6.58966 12.3701 6.14743 12.5431 5.76795 12.3771C5.38847 12.211 5.21545 11.7688 5.3815 11.3893C5.63895 10.8009 5.99533 10.2663 6.44224 9.8194C8.4308 7.8309 11.6548 7.8309 13.6433 9.8194ZM18.4483 4.27868C18.9574 4.78773 19.438 5.3693 19.8565 5.97556C20.0917 6.3165 20.0061 6.7836 19.6652 7.0188C19.3243 7.2541 18.8572 7.1685 18.6219 6.8276C18.2539 6.2944 17.8311 5.78273 17.3877 5.33934C13.3076 1.25928 6.69255 1.25928 2.6125 5.33934C2.19062 5.76121 1.77221 6.2728 1.39047 6.8231C1.15437 7.1634 0.68707 7.2479 0.34673 7.0118C0.00639987 6.7757 -0.0781001 6.3084 0.15801 5.9681C0.58817 5.34803 1.06258 4.76794 1.55184 4.27868C6.21768 -0.387163 13.7825 -0.387163 18.4483 4.27868ZM11.0609 12.4391C11.6467 13.0249 11.6467 13.9748 11.0609 14.5607C10.475 15.1465 9.5252 15.1465 8.9393 14.5607C8.3534 13.9748 8.3534 13.0249 8.9393 12.4391C9.5252 11.8532 10.475 11.8532 11.0609 12.4391Z"></path>
                </svg>
                <p>5G</p>
              </div>
            </div>
            
            {/* FRI tale */}
            <div className="product-content product-content__speak">
              <div className="current-product-content">
                <p className="current-product-content__value">FRI</p>
                <p className="current-product-content__label">tale</p>
              </div>
            </div>
            
            {/* Data */}
            <div className="product-content product-content__data">
              <div className="current-product-content">
                <p className="current-product-content__value">{plan.name.split(' ')[0]}</p>
                <p className="current-product-content__label">GB</p>
              </div>
            </div>
            
            {/* EU-data */}
            <div className="product-content product-content__roaming-data">
              <div className="current-product-content">
                <p className="current-product-content__value">+ 30 GB EU-data</p>
              </div>
            </div>
          </div>
          
          {/* Pris */}
          <div className="refined-product-card__main-card--price-area">
            <div className="current-price-line">
              <p className="current-price-line__price">{plan.price}</p>
              <p className="current-price-line__label"> kr./md.</p>
            </div>
          </div>
        </div>
      ) : (plan.provider === 'telenor' || plan.provider === 'telenor-b2b' || plan.provider === 'telenor-bredbånd') ? (
        // Telenor specifik struktur
        <div className="subscription-card color-telenor-dark-blue">
          {/* Badge - kun hvis mostPopular er true */}
          {plan.mostPopular && (
            <div className="subscription__badge-block">
              <div className="subscription__badge text-size--16 badge--hot-pink color-white">
                Flest vælger
              </div>
            </div>
          )}
          
          {/* Card wrapper */}
          <div className="subscription-card__wrapper background-white">
            {/* Image/Title area */}
            <div className="subscription-card__img">
              <div className="subscription-card__title full-width color-white">
                <div className="col-auto text--left color-telenor-light-blue">
                  <h3 className="heading heading--medium">{plan.name.split(' ')[0]} GB</h3>
                </div>
                <div className="col-auto text--right">
                  <div className="subscription-card__price text-bold text-italic">
                    {plan.price},- <span className="currency-label">/md{plan.business ? ' (ex. moms)' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Samlerabat info */}
            {plan.familyDiscount && (
              <div className="telenor-family-discount">
                <div className="family-discount-badge">
                  👨‍👩‍👧‍👦 Familie samlerabat
                </div>
                <div className="family-discount-info">
                  -50 kr/md pr. ekstra linje
                </div>
              </div>
            )}
            
            {/* Features list */}
            <div className="subscription-features">
              <ul className="list--reset">
                {plan.features.map((feature, index) => (
                  <li key={index} className="subscription-card__list-item">
                    <span className="col-auto">
                      <span className="color-telenor-blue icon icon-world icon--medium"></span>
                    </span>
                    <span className="col-stretch">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        // Eksisterende struktur for andre providers
        <>
          {/* Provider badge */}
          <div className="plan-header" style={{ borderColor: brandColor }}>
            <div className="plan-provider" style={{ color: brandColor }}>
              {plan.logo ? (
                <img 
                  src={plan.logo} 
                  alt={plan.provider}
                  className="provider-logo"
                />
              ) : (
                plan.provider.toUpperCase()
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
        </>
      )}

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
        className="btn btn-premium plan-add-btn"
        style={{ 
          background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)`,
          boxShadow: `0 0 20px ${brandColor}40`
        }}
      >
        <span className="btn-text">Tilføj til kurv</span>
        <span className="cart-icon">🛒</span>
      </button>

      <style>{`
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
          background: rgba(2, 7, 178, 0.1);
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

        .plan-add-btn:hover .cart-icon {
          animation: cartBounce 0.6s ease-in-out;
        }

        .plan-add-btn:active .cart-icon {
          transform: scale(1.2);
        }

        @keyframes cartBounce {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-2px) rotate(-5deg); }
          75% { transform: translateX(2px) rotate(5deg); }
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

        /* CBB Card Styling - Præcis som rigtige CBB kort */
        .cbb-card {
          background: #ffc50f;
          border: 2px solid #410016;
          color: #410016;
          font-family: 'Arial', sans-serif;
        }

        .refined-product-card__main-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #ffc50f;
          border-radius: 12px;
          overflow: hidden;
        }

        .refined-product-card__main-card--product-content-area {
          flex: 1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .connection-type-label {
          align-self: flex-end;
          margin-bottom: 8px;
        }

        .connection-type-label__content {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #410016;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }

        .connection-type-label__content svg {
          width: 16px;
          height: 12px;
          fill: white;
        }

        .connection-type-label__content p {
          margin: 0;
          font-size: 12px;
          font-weight: bold;
        }

        .product-content {
          display: flex;
          flex-direction: column;
        }

        .current-product-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .current-product-content__value {
          font-size: 32px;
          font-weight: 900;
          color: #410016;
          margin: 0;
          line-height: 1;
        }

        .current-product-content__label {
          font-size: 14px;
          font-weight: 600;
          color: #410016;
          margin: 0;
          margin-top: 2px;
        }

        .product-content__speak .current-product-content__value {
          font-size: 24px;
        }

        .product-content__data .current-product-content__value {
          font-size: 48px;
          font-weight: 900;
        }

        .product-content__roaming-data .current-product-content__value {
          font-size: 14px;
          font-weight: 600;
          color: #410016;
        }

        .refined-product-card__main-card--price-area {
          background: white;
          padding: 16px;
          border-top: 1px solid #410016;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .current-price-line {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .current-price-line__price {
          font-size: 24px;
          font-weight: 900;
          color: #410016;
          margin: 0;
        }

        .current-price-line__label {
          font-size: 14px;
          font-weight: 600;
          color: #410016;
          margin: 0;
        }

        .cbb-card .plan-add-btn {
          background: linear-gradient(135deg, #410016, #6b0024);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(65, 0, 22, 0.3);
          margin-top: 12px;
        }

         .cbb-card .plan-add-btn:hover {
           background: linear-gradient(135deg, #6b0024, #410016);
           box-shadow: 0 6px 16px rgba(65, 0, 22, 0.4);
         }

         /* Telenor Card Styling - Præcis som rigtige Telenor kort */
         .telenor-card {
           background: #ffffff;
           border: 2px solid #0207b2;
           color: #0207b2;
           font-family: 'Arial', sans-serif;
           position: relative;
           overflow: hidden;
         }

         .subscription-card {
           display: flex;
           flex-direction: column;
           height: 100%;
           position: relative;
         }

         .subscription__badge-block {
           position: absolute;
           top: 0;
           left: 0;
           z-index: 10;
           padding: 8px;
         }

         .subscription__badge {
           background: #0207b2;
           color: white;
           padding: 4px 12px;
           border-radius: 4px;
           font-size: 12px;
           font-weight: bold;
           text-transform: uppercase;
         }

         .subscription-card__wrapper {
           flex: 1;
           display: flex;
           flex-direction: column;
           background: #ffffff;
           border-radius: 8px;
           overflow: hidden;
         }

         .subscription-card__img {
           background: linear-gradient(135deg, #0207b2, #3b4fdb);
           color: white;
           padding: 20px;
           position: relative;
           min-height: 120px;
         }

         .telenor-family-discount {
           background: rgba(2, 7, 178, 0.05);
           padding: 12px 16px;
           border-radius: 8px;
           margin-top: 12px;
           border: 1px solid rgba(2, 7, 178, 0.2);
         }

         .family-discount-badge {
           color: #0207b2;
           font-size: 14px;
           font-weight: bold;
           margin-bottom: 4px;
         }

         .family-discount-info {
           color: #0207b2;
           font-size: 12px;
           opacity: 0.8;
         }

         .subscription-card__title {
           display: flex;
           justify-content: space-between;
           align-items: center;
           margin-top: 20px;
         }

         .color-telenor-light-blue {
           color: #ffffff;
         }

         .heading--medium {
           font-size: 24px;
           font-weight: bold;
           margin: 0;
         }

         .subscription-card__price {
           font-size: 20px;
           font-weight: bold;
           color: white;
         }

         .currency-label {
           font-size: 14px;
           font-weight: normal;
         }

         .subscription-features {
           padding: 16px;
           flex: 1;
         }

         .list--reset {
           list-style: none;
           padding: 0;
           margin: 0;
         }

         .subscription-card__list-item {
           display: flex;
           align-items: center;
           gap: 12px;
           margin-bottom: 8px;
           font-size: 14px;
           color: #0207b2;
         }

         .color-telenor-blue {
           color: #0207b2;
         }

         .icon {
           width: 16px;
           height: 16px;
           display: inline-block;
         }

         .icon-world::before {
           content: "🌍";
         }

         .icon-heart::before {
           content: "❤️";
         }

         .icon-coverage::before {
           content: "📶";
         }

         .telenor-card .plan-add-btn {
           background: linear-gradient(135deg, #0207b2, #3b4fdb);
           color: white;
           border: none;
           box-shadow: 0 4px 12px rgba(2, 7, 178, 0.3);
           margin-top: 12px;
         }

         .telenor-card .plan-add-btn:hover {
           background: linear-gradient(135deg, #3b4fdb, #0207b2);
           box-shadow: 0 6px 16px rgba(2, 7, 178, 0.4);
         }

         /* Telmore Card Styling */
         .telmore-card {
           background: #f3b2d0;
           border: 2px solid #002788;
           color: #002788;
         }

         .telmore-card .plan-header {
           border-color: #002788;
         }

         .telmore-card .plan-provider {
           color: #002788;
         }

         .telmore-card .plan-title h3 {
           color: #002788;
         }

         .telmore-card .plan-data {
           color: #002788;
           opacity: 0.8;
         }

         .telmore-card .price-amount {
           color: #002788;
         }

         .telmore-card .price-period,
         .telmore-card .price-detail {
           color: #002788;
           opacity: 0.7;
         }

         .telmore-card .badge {
           background: rgba(0, 39, 136, 0.1);
           color: #002788;
           border: 1px solid rgba(0, 39, 136, 0.2);
         }

         .telmore-card .plan-streaming {
           background: rgba(0, 39, 136, 0.1);
           border: 1px solid rgba(0, 39, 136, 0.2);
         }

         .telmore-card .streaming-label {
           color: #002788;
         }

         .telmore-card .plan-add-btn {
           background: linear-gradient(135deg, #002788, #003fa3);
           color: white;
           border: none;
           box-shadow: 0 4px 12px rgba(0, 39, 136, 0.3);
         }

         .telmore-card .plan-add-btn:hover {
           background: linear-gradient(135deg, #003fa3, #002788);
           box-shadow: 0 6px 16px rgba(0, 39, 136, 0.4);
         }

         @media (max-width: 900px) {
          .plan-card {
            padding: var(--spacing-md);
          }

          .price-amount {
            font-size: var(--font-2xl);
          }

          .subscription-card__img {
            min-height: 100px;
            padding: 16px;
          }

          .heading--medium {
            font-size: 20px;
          }

          .subscription-card__price {
            font-size: 18px;
          }

          .telenor-family-discount {
            padding: 8px 12px;
            margin-top: 8px;
          }

          .family-discount-badge {
            font-size: 12px;
          }

          .family-discount-info {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}


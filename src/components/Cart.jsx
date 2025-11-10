/**
 * Cart komponent
 * Viser tilføjede planer med quantity controls
 */

import { formatCurrency, calculateSixMonthPrice } from '../utils/calculations';

export default function Cart({ cartItems, onUpdateQuantity, onRemove, newlyAddedPlans = new Set() }) {
  if (cartItems.length === 0) {
    return (
      <div className="cart glass-card-no-hover fade-in-up">
        <div className="section-header">
          <h2>🛒 Kurv</h2>
          <p className="text-secondary">Tilføj planer for at se beregninger</p>
        </div>
        
        <div className="empty-state animate-scale-in">
          <div className="empty-state-icon animate-pulse">🛒</div>
          <p className="text-lg font-semibold">Kurven er tom</p>
          <p className="text-secondary">
            Vælg mobilabonnementer fra listen nedenfor
          </p>
        </div>

        <style>{`
          .cart {
            padding: var(--spacing-2xl);
            min-height: 400px;
          }

          .section-header {
            margin-bottom: var(--spacing-xl);
          }

          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: var(--spacing-3xl);
          }

          .empty-state-icon {
            font-size: var(--font-5xl);
            margin-bottom: var(--spacing-lg);
            opacity: 0.3;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="cart glass-card-no-hover fade-in-up">
      <div className="section-header">
        <h2>🛒 Kurv</h2>
        <div className="cart-count badge badge-primary animate-pulse animate-pulse-glow">
          {cartItems.reduce((sum, item) => sum + item.quantity, 0)} 
          {' '}linje{cartItems.reduce((sum, item) => sum + item.quantity, 0) !== 1 ? 'r' : ''}
        </div>
      </div>

      {/* Cart items */}
      <div className="cart-items">
        {cartItems.map((item, index) => {
          const sixMonthPrice = calculateSixMonthPrice(item.plan, item.quantity);
          const hasIntro = item.plan.introPrice && item.plan.introMonths;
          
          return (
            <div 
              key={item.plan.id} 
              className={`cart-item animate-fade-in-up ${newlyAddedPlans.has(item.plan.id) ? 'newly-added' : ''}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Plan info */}
              <div className="cart-item-header">
                <div className="cart-item-provider" style={{ color: item.plan.color }}>
                  {item.plan.provider.toUpperCase()}
                </div>
                <button
                  onClick={() => onRemove(item.plan.id)}
                  className="btn-remove"
                  title="Fjern fra kurv"
                  aria-label="Fjern fra kurv"
                >
                  ✕
                </button>
              </div>

              <div className="cart-item-name">{item.plan.name}</div>
              <div className="cart-item-data text-muted">{item.plan.data}</div>

              {/* Quantity controls */}
              <div className="quantity-controls">
                <button
                  onClick={() => onUpdateQuantity(item.plan.id, item.quantity - 1)}
                  className="btn btn-icon btn-secondary quantity-btn"
                  disabled={item.quantity <= 1}
                  aria-label="Reducer antal"
                >
                  −
                </button>
                <span className="quantity-value">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.plan.id, item.quantity + 1)}
                  className="btn btn-icon btn-secondary quantity-btn"
                  disabled={item.quantity >= 20}
                  aria-label="Forøg antal"
                >
                  +
                </button>
              </div>

              {/* Pricing */}
              <div className="cart-item-pricing">
                {hasIntro ? (
                  <>
                    <div className="price-line">
                      <span className="price-label">Intro ({item.plan.introMonths} mdr):</span>
                      <span className="price-value">
                        {formatCurrency(item.plan.introPrice * item.quantity)}/md
                      </span>
                    </div>
                    <div className="price-line">
                      <span className="price-label">Derefter:</span>
                      <span className="price-value">
                        {formatCurrency(item.plan.price * item.quantity)}/md
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="price-line">
                    <span className="price-label">Pris pr. måned:</span>
                    <span className="price-value">
                      {formatCurrency(item.plan.price * item.quantity)}
                    </span>
                  </div>
                )}

                {/* CBB Mix pricing */}
                {item.cbbMixEnabled && item.cbbMixCount && (
                  <div className="cbb-mix-pricing">
                    <div className="price-line cbb-mix-line">
                      <span className="price-label">🎬 CBB MIX ({item.cbbMixCount} tjenester):</span>
                      <span className="price-value">
                        {formatCurrency((item.plan.cbbMixPricing[item.cbbMixCount] || 0) * item.quantity)}/md
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="price-line total">
                  <span className="price-label font-semibold">6 måneder:</span>
                  <span className="price-value font-bold">
                    {formatCurrency(sixMonthPrice + (item.cbbMixEnabled && item.cbbMixCount ? 
                      ((item.plan.cbbMixPricing[item.cbbMixCount] || 0) * 6 * item.quantity) : 0))}
                  </span>
                </div>

              </div>

              {/* Features */}
              {item.plan.features && item.plan.features.length > 0 && (
                <div className="cart-item-features">
                  {item.plan.features.slice(0, 3).map((feature, idx) => (
                    <span key={idx} className="badge badge-info">
                      {feature}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>


      <style>{`
        .cart {
          padding: var(--spacing-lg);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
        }

        .section-header h2 {
          margin: 0;
        }

        .cart-items {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .cart-item {
          padding: var(--spacing-md);
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.08) 0%, 
            rgba(255, 255, 255, 0.04) 100%
          );
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.15);
          transition: all var(--transition-smooth);
          position: relative;
          transform-style: preserve-3d;
          backdrop-filter: blur(var(--blur-md)) saturate(150%);
          -webkit-backdrop-filter: blur(var(--blur-md)) saturate(150%);
        }

        .cart-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.05));
          opacity: 0;
          transition: opacity var(--transition-base);
          border-radius: var(--radius-lg);
          pointer-events: none;
        }

        .cart-item:hover {
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow: 
            var(--shadow-xl), 
            0 0 30px rgba(255, 109, 31, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.2) inset;
          transform: translateX(8px) translateY(-2px) rotateY(2deg) scale(1.02);
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.12) 0%, 
            rgba(255, 255, 255, 0.06) 100%
          );
        }

        .cart-item:hover::before {
          opacity: 1;
        }

        .cart-item.newly-added {
          animation: newlyAddedPulse 0.6s ease-out, fade-in-up 0.6s var(--ease-out-back);
          border-color: var(--color-success);
          box-shadow: 
            var(--shadow-xl), 
            0 0 40px rgba(16, 185, 129, 0.6),
            0 0 0 2px rgba(16, 185, 129, 0.3) inset;
          background: linear-gradient(135deg, 
            rgba(16, 185, 129, 0.15) 0%, 
            rgba(16, 185, 129, 0.08) 50%,
            rgba(255, 255, 255, 0.08) 100%
          );
        }

        .cart-item.newly-added::after {
          content: '✨ Ny';
          position: absolute;
          top: var(--spacing-sm);
          right: var(--spacing-sm);
          background: var(--color-success);
          color: white;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-sm);
          font-size: var(--font-xs);
          font-weight: var(--font-bold);
          box-shadow: var(--glow-green);
          animation: bounceIn var(--duration-slow) var(--ease-out-back);
          z-index: 10;
        }

        @keyframes newlyAddedPulse {
          0% {
            transform: scale(0.95);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .cart-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }

        .cart-item-provider {
          font-size: var(--font-xs);
          font-weight: var(--font-bold);
          letter-spacing: 0.05em;
        }

        .btn-remove {
          width: 32px;
          height: 32px;
          border: none;
          background: rgba(239, 68, 68, 0.2);
          color: var(--color-danger);
          border-radius: 50%;
          cursor: pointer;
          transition: all var(--transition-fast);
          font-size: var(--font-lg);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-remove:hover {
          background: var(--color-danger);
          color: white;
          transform: scale(1.1);
        }

        .cart-item-name {
          font-size: var(--font-xl);
          font-weight: var(--font-bold);
          margin-bottom: var(--spacing-xs);
        }

        .cart-item-data {
          font-size: var(--font-sm);
          margin-bottom: var(--spacing-md);
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }

        .quantity-btn {
          font-size: var(--font-xl);
          font-weight: var(--font-bold);
          transition: all var(--transition-fast);
        }

        .quantity-btn:hover {
          transform: scale(1.15) rotate(5deg);
          background: var(--color-orange);
          color: white;
          box-shadow: var(--glow-orange);
          filter: brightness(1.2);
        }

        .quantity-btn:active {
          transform: scale(0.95);
        }

        .quantity-value {
          transition: all var(--transition-fast);
        }

        .quantity-btn:hover + .quantity-value {
          transform: scale(1.1);
          color: var(--color-orange);
        }

        .quantity-value {
          min-width: 40px;
          text-align: center;
          font-size: var(--font-xl);
          font-weight: var(--font-bold);
        }

        .cart-item-pricing {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
          padding: var(--spacing-md);
          background: rgba(0, 0, 0, 0.2);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-md);
        }

        .price-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .price-line.total {
          padding-top: var(--spacing-sm);
          border-top: 1px solid var(--glass-border);
          margin-top: var(--spacing-xs);
        }

        .price-line.earnings {
          padding-top: var(--spacing-sm);
          border-top: 1px solid var(--glass-border);
        }

        .price-label {
          font-size: var(--font-sm);
          color: var(--text-secondary);
        }

        .price-value {
          font-size: var(--font-base);
        }

        .cbb-mix-pricing {
          margin-top: var(--spacing-xs);
          padding: var(--spacing-xs) 0;
        }

        .cbb-mix-line {
          background: rgba(168, 85, 247, 0.1);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-sm);
          border: 1px solid rgba(168, 85, 247, 0.2);
        }

        .cbb-mix-line .price-label {
          color: var(--color-purple);
          font-weight: var(--font-semibold);
        }

        .cart-item-features {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
        }

        @media (max-width: 900px) {
          .cart {
            padding: var(--spacing-lg);
          }

          .cart-item {
            padding: var(--spacing-md);
          }
        }
      `}</style>
    </div>
  );
}


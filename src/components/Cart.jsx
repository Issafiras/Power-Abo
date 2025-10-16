/**
 * Cart komponent
 * Viser tilføjede planer med quantity controls
 */

import { formatCurrency, calculateSixMonthPrice } from '../utils/calculations';

export default function Cart({ cartItems, onUpdateQuantity, onRemove }) {
  if (cartItems.length === 0) {
    return (
      <div className="cart glass-card-no-hover fade-in-up">
        <div className="section-header">
          <h2>🛒 Kurv</h2>
          <p className="text-secondary">Tilføj planer for at se beregninger</p>
        </div>
        
        <div className="empty-state scale-in">
          <div className="empty-state-icon pulse">🛒</div>
          <p className="text-lg font-semibold">Kurven er tom</p>
          <p className="text-secondary">
            Vælg mobilplaner fra listen nedenfor
          </p>
        </div>

        <style jsx>{`
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

  // Beregn totaler
  const totalEarnings = cartItems.reduce((sum, item) => 
    sum + (item.plan.earnings * item.quantity), 0
  );

  return (
    <div className="cart glass-card-no-hover fade-in-up">
      <div className="section-header">
        <h2>🛒 Kurv</h2>
        <div className="cart-count badge badge-primary pulse">
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
              className="cart-item fade-in-up" 
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
                
                <div className="price-line total">
                  <span className="price-label font-semibold">6 måneder:</span>
                  <span className="price-value font-bold">
                    {formatCurrency(sixMonthPrice)}
                  </span>
                </div>

                <div className="price-line earnings">
                  <span className="price-label">Indtjening:</span>
                  <span className="price-value text-success font-bold">
                    {formatCurrency(item.plan.earnings * item.quantity)}
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

      <div className="divider"></div>

      {/* Total earnings */}
      <div className="cart-total-earnings scale-in">
        <span className="earnings-label">💰 Total indtjening:</span>
        <span className="earnings-value text-success font-extrabold text-2xl pulse-glow">
          {formatCurrency(totalEarnings)}
        </span>
      </div>

      <style jsx>{`
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
          background: var(--glass-bg);
          border-radius: var(--radius-md);
          border: 1px solid var(--glass-border);
          transition: all var(--transition-base);
          position: relative;
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
          box-shadow: var(--shadow-xl), 0 0 20px rgba(255, 107, 26, 0.1);
          transform: translateX(4px);
        }

        .cart-item:hover::before {
          opacity: 1;
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

        .cart-item-features {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
        }

        .cart-total-earnings {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-lg);
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
          border-radius: var(--radius-lg);
          border: 2px solid rgba(16, 185, 129, 0.3);
        }

        .earnings-label {
          font-size: var(--font-lg);
          font-weight: var(--font-semibold);
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


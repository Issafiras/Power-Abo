/**
 * Cart komponent
 * Viser tilføjede planer med quantity controls
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, calculateSixMonthPrice } from '../../utils/calculations';
import Icon from '../../components/common/Icon';
import COPY from '../../constants/copy';

const Cart = React.memo(function Cart({ cartItems, onUpdateQuantity, onRemove, newlyAddedPlans = new Set() }) {
  if (cartItems.length === 0) {
    return (
      <motion.div 
        className="cart glass-card-no-hover"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="section-header">
        <h2>
          <Icon name="cart" size={24} className="icon-inline icon-spacing-md" />
          Kurv
        </h2>
          <p className="text-secondary">{COPY.empty.noCartItems}</p>
        </div>
        
        <motion.div 
          className="empty-state"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <Icon name="cart" size={64} className="empty-state-icon opacity-30" aria-hidden="true" />
          <p className="text-lg font-semibold">Kurven er tom</p>
          <p className="text-secondary">
            Vælg mobilabonnementer fra listen nedenfor.
          </p>
        </motion.div>

        <style>{`
          .cart {
            padding: var(--spacing-lg);
            min-height: 400px;
          }

          .section-header {
            margin-bottom: var(--spacing-md);
          }

          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: var(--spacing-xl);
          }

          .empty-state-icon {
            font-size: var(--font-4xl);
            margin-bottom: var(--spacing-md);
            opacity: 0.3;
          }
        `}</style>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="cart glass-card-no-hover"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="section-header">
          <h2>
            <Icon name="cart" size={24} className="icon-inline icon-spacing-md" />
            Kurv
          </h2>
          <div className="cart-count badge badge-primary" aria-label={`${cartItems.reduce((sum, item) => sum + item.quantity, 0)} abonnementer i kurv`}>
          {cartItems.reduce((sum, item) => sum + item.quantity, 0)} 
          {' '}abonnement{cartItems.reduce((sum, item) => sum + item.quantity, 0) !== 1 ? 'er' : ''}
        </div>
      </div>

      {/* Cart items */}
      <div className="cart-items">
        <AnimatePresence mode="popLayout">
          {cartItems.map((item) => {
            const sixMonthPrice = calculateSixMonthPrice(item.plan, item.quantity);
            const hasIntro = item.plan.introPrice && item.plan.introMonths;
            
            return (
              <motion.div 
                key={item.plan.id} 
                className={`cart-item ${newlyAddedPlans.has(item.plan.id) ? 'newly-added' : ''}`}
                layout
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {/* Plan info */}
                <div className="cart-item-header">
                  <div className="cart-item-provider" style={{ color: item.plan.color || 'var(--color-orange)' }}>
                    {item.plan.provider.toUpperCase()}
                  </div>
                  <motion.button
                    onClick={() => onRemove(item.plan.id)}
                    className="btn-remove"
                    title="Fjern fra kurv"
                    aria-label="Fjern fra kurv"
                    whileHover={{ scale: 1.1, backgroundColor: 'var(--color-danger)', color: 'white' }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✕
                  </motion.button>
                </div>

                <div className="cart-item-name">{item.plan.name}</div>
                <div className="cart-item-data text-muted">{item.plan.data}</div>

                {/* Quantity controls */}
                <div className="quantity-controls">
                  <motion.button
                    onClick={() => onUpdateQuantity(item.plan.id, item.quantity - 1)}
                    className="btn btn-icon btn-secondary quantity-btn"
                    disabled={item.quantity <= 1}
                    aria-label={`Reducer antal ${item.plan.name}`}
                    aria-controls={`quantity-${item.plan.id}`}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span aria-hidden="true">−</span>
                  </motion.button>
                  <motion.span 
                    id={`quantity-${item.plan.id}`} 
                    className="quantity-value" 
                    aria-label={`Antal: ${item.quantity}`}
                    key={item.quantity}
                    initial={{ scale: 1.5, color: 'var(--color-orange)' }}
                    animate={{ scale: 1, color: 'var(--text-primary)' }}
                  >
                    {item.quantity}
                  </motion.span>
                  <motion.button
                    onClick={() => onUpdateQuantity(item.plan.id, item.quantity + 1)}
                    className="btn btn-icon btn-secondary quantity-btn"
                    disabled={item.quantity >= 20}
                    aria-label={`Forøg antal ${item.plan.name}`}
                    aria-controls={`quantity-${item.plan.id}`}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span aria-hidden="true">+</span>
                  </motion.button>
                </div>

                {/* Pricing */}
                <div className="cart-item-pricing">
                  {hasIntro ? (
                    <>
                      <div className="price-line">
                        <span className="price-label">Intro ({item.plan.introMonths} mdr.):</span>
                        <span className="price-value">
                          {formatCurrency(item.plan.introPrice * item.quantity)}/md.
                        </span>
                      </div>
                      <div className="price-line">
                        <span className="price-label">Derefter:</span>
                        <span className="price-value">
                          {formatCurrency(item.plan.price * item.quantity)}/md.
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="price-line">
                      <span className="price-label">Pris pr. måned:</span>
                      <span className="price-value">
                        {formatCurrency(item.plan.price * item.quantity)}/md.
                      </span>
                    </div>
                  )}

                  {/* CBB Mix pricing */}
                  {item.cbbMixEnabled && item.cbbMixCount && (
                    <div className="cbb-mix-pricing">
                      <div className="price-line cbb-mix-line">
                        <span className="price-label">
                          <Icon name="film" size={16} className="icon-inline icon-spacing-xs" />
                          CBB MIX ({item.cbbMixCount} tjenester):
                        </span>
                        <span className="price-value">
                          {formatCurrency((item.plan.cbbMixPricing[item.cbbMixCount] || 0) * item.quantity)}/md.
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="price-line total">
                    <span className="price-label font-semibold">6 måneder:</span>
                    <motion.span 
                      className="price-value font-bold"
                      key={sixMonthPrice}
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                    >
                      {formatCurrency(sixMonthPrice + (item.cbbMixEnabled && item.cbbMixCount ? 
                        ((item.plan.cbbMixPricing[item.cbbMixCount] || 0) * 6 * item.quantity) : 0))} kr.
                    </motion.span>
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
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>


      <style>{`
        .cart {
          padding: var(--spacing-lg);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
        }

        .section-header h2 {
          font-size: var(--font-2xl);
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
          /* transition removed in favor of motion */
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
          transition: opacity 0.3s ease;
          border-radius: var(--radius-lg);
          pointer-events: none;
        }

        .cart-item:hover {
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow: 
            var(--shadow-xl), 
            0 0 30px rgba(255, 109, 31, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.2) inset;
          /* transform handled by motion */
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.12) 0%, 
            rgba(255, 255, 255, 0.06) 100%
          );
        }

        .cart-item:hover::before {
          opacity: 1;
        }

        .cart-item.newly-added {
          /* animation handled by motion initial prop */
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
          content: 'Ny';
          position: absolute;
          top: var(--spacing-sm);
          right: var(--spacing-sm);
          background: var(--color-success);
          color: white;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-sm);
          font-size: var(--font-xs);
          font-weight: var(--font-bold);
          z-index: 10;
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
          /* transition handled by motion */
          font-size: var(--font-lg);
          display: flex;
          align-items: center;
          justify-content: center;
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
          /* transition handled by motion */
        }

        .quantity-value {
          display: inline-block; /* Required for transform */
          transition: none; /* Handled by motion */
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
    </motion.div>
  );
});

export default Cart;

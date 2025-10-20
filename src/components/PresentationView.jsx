/**
 * PresentationView komponent
 * Fullscreen præsentationsvisning med animeret besparelse
 */

import { useState, useEffect } from 'react';
import {
  formatCurrency,
  calculateCustomerTotal,
  calculateOurOfferTotal,
  calculateSavings,
  checkStreamingCoverage
} from '../utils/calculations';
import { getStreamingTotal, getServiceById } from '../data/streamingServices';

export default function PresentationView({
  cartItems,
  selectedStreaming,
  customerMobileCost,
  originalItemPrice,
  cashDiscount,
  onClose
}) {
  const [animatedSavings, setAnimatedSavings] = useState(0);

  // Beregninger
  const streamingCoverage = checkStreamingCoverage(cartItems, selectedStreaming);
  const notIncludedStreamingCost = getStreamingTotal(streamingCoverage.notIncluded);
  const streamingCost = getStreamingTotal(selectedStreaming);
  
  const customerTotals = calculateCustomerTotal(customerMobileCost, streamingCost, originalItemPrice);
  const ourOfferTotals = calculateOurOfferTotal(
    cartItems,
    notIncludedStreamingCost,
    cashDiscount,
    originalItemPrice
  );
  const savings = calculateSavings(customerTotals.sixMonth, ourOfferTotals.sixMonth);
  const isPositiveSavings = savings > 0;

  // Animér besparelse tal
  useEffect(() => {
    const duration = 2000; // 2 sekunder
    const steps = 60;
    const increment = savings / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      
      if (step >= steps) {
        setAnimatedSavings(savings);
        clearInterval(timer);
      } else {
        setAnimatedSavings(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [savings]);

  // Escape key to close
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="presentation-overlay" onClick={onClose}>
      <div className="presentation-content" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button onClick={onClose} className="btn-close" aria-label="Luk">
          ✕
        </button>

        {/* Main savings display */}
        <div className={`savings-hero ${isPositiveSavings ? 'positive' : 'negative'}`}>
          <div className="savings-icon">
            {isPositiveSavings ? '✅' : '⚠️'}
          </div>
          <div className="savings-label">
            {isPositiveSavings ? 'BESPARELSE' : 'MERSALG'}
          </div>
          <div className="savings-amount">
            {isPositiveSavings ? '' : '-'}
            {formatCurrency(Math.abs(animatedSavings))}
          </div>
          <div className="savings-period">over 6 måneder</div>
        </div>

        {/* Comparison summary */}
        <div className="comparison-summary">
          <div className="summary-column">
            <div className="summary-label">👤 Kundens Situation</div>
            <div className="summary-amount">{formatCurrency(customerTotals.sixMonth)}</div>
            <div className="summary-details">
              <div className="detail-row">
                <span className="detail-label">Mobil:</span>
                <span className="detail-value">{formatCurrency(customerMobileCost || 0)}/md</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Streaming:</span>
                <span className="detail-value">{formatCurrency(streamingCost)}/md</span>
              </div>
              {originalItemPrice > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Varens pris:</span>
                  <span className="detail-value">{formatCurrency(originalItemPrice)}</span>
                </div>
              )}
              <div className="detail-row total">
                <span className="detail-label">Total/md:</span>
                <span className="detail-value">{formatCurrency(customerTotals.monthly)}</span>
              </div>
            </div>
          </div>

          <div className="summary-divider">⚡</div>

          <div className="summary-column">
            <div className="summary-label">💼 Vores Tilbud</div>
            <div className="summary-amount">{formatCurrency(ourOfferTotals.sixMonth)}</div>
            <div className="summary-details">
              <div className="detail-row">
                <span className="detail-label">Planer:</span>
                <span className="detail-value">{formatCurrency(ourOfferTotals.monthly - (notIncludedStreamingCost || 0))}/md</span>
              </div>
              {ourOfferTotals.telenorDiscount > 0 && (
                <div className="detail-row discount">
                  <span className="detail-label">Telenor rabat:</span>
                  <span className="detail-value text-success">-{formatCurrency(ourOfferTotals.telenorDiscount)}/md</span>
                </div>
              )}
              {notIncludedStreamingCost > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Streaming tillæg:</span>
                  <span className="detail-value">{formatCurrency(notIncludedStreamingCost)}/md</span>
                </div>
              )}
              {originalItemPrice > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Varens pris:</span>
                  <span className="detail-value">{formatCurrency(originalItemPrice)}</span>
                </div>
              )}
              {ourOfferTotals.setupFee > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Oprettelsesgebyr:</span>
                  <span className="detail-value">{formatCurrency(ourOfferTotals.setupFee)}</span>
                </div>
              )}
              <div className="detail-row total">
                <span className="detail-label">Total/md:</span>
                <span className="detail-value">{formatCurrency(ourOfferTotals.monthly)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected plans */}
        {cartItems.length > 0 && (
          <div className="plans-summary">
            <h3>Valgte Abonnementer</h3>
            <div className="plans-grid">
              {cartItems.map(item => (
                <div key={item.plan.id} className="plan-summary-card">
                  <div className="plan-provider" style={{ color: item.plan.color }}>
                    {item.plan.provider.toUpperCase()}
                  </div>
                  <div className="plan-name">{item.plan.name}</div>
                  <div className="plan-qty">
                    {item.quantity} linje{item.quantity !== 1 ? 'r' : ''}
                  </div>
                  {(item.plan.streamingCount > 0 || (item.plan.streaming && item.plan.streaming.length > 0)) && (
                    <div className="plan-streaming-badge">
                      📺 {item.plan.streamingCount || item.plan.streaming.length} streaming
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Streaming coverage */}
        {selectedStreaming.length > 0 && (
          <div className="streaming-summary">
            <h3>📺 Streaming Oversigt</h3>
            <div className="streaming-coverage-header">
              <div className="coverage-stats">
                <div className="stat-item">
                  <span className="stat-number">{streamingCoverage.included.length}</span>
                  <span className="stat-label">Inkluderet</span>
                </div>
                {streamingCoverage.notIncluded.length > 0 && (
                  <div className="stat-item">
                    <span className="stat-number">{streamingCoverage.notIncluded.length}</span>
                    <span className="stat-label">Tillæg</span>
                  </div>
                )}
                <div className="stat-item total">
                  <span className="stat-number">{selectedStreaming.length}</span>
                  <span className="stat-label">Total</span>
                </div>
              </div>
            </div>
            <div className="streaming-items">
              {streamingCoverage.included.length > 0 && (
                <div className="streaming-group">
                  <div className="streaming-group-label">
                    ✅ Inkluderet i abonnement ({streamingCoverage.included.length} tjenester)
                  </div>
                  <div className="streaming-tags">
                    {streamingCoverage.included.map(id => {
                      const service = getServiceById(id);
                      return service ? (
                        <span key={id} className="streaming-tag included">
                          <img 
                            src={service.logo} 
                            alt={service.name}
                            className="streaming-logo"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'inline';
                            }}
                          />
                          <span style={{ display: 'none' }}>{service.name.charAt(0)}</span>
                          {service.name}
                          <span className="streaming-price">({formatCurrency(service.price)}/md)</span>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              {streamingCoverage.notIncluded.length > 0 && (
                <div className="streaming-group">
                  <div className="streaming-group-label">
                    ➕ Tillæg til abonnement ({streamingCoverage.notIncluded.length} tjenester)
                  </div>
                  <div className="streaming-tags">
                    {streamingCoverage.notIncluded.map(id => {
                      const service = getServiceById(id);
                      return service ? (
                        <span key={id} className="streaming-tag">
                          <img 
                            src={service.logo} 
                            alt={service.name}
                            className="streaming-logo"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'inline';
                            }}
                          />
                          <span style={{ display: 'none' }}>{service.name.charAt(0)}</span>
                          {service.name}
                          <span className="streaming-price">({formatCurrency(service.price)}/md)</span>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="presentation-footer">
          <div className="footer-text">
            Tryk ESC eller klik udenfor for at lukke
          </div>
        </div>
      </div>

      <style>{`
        .presentation-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(var(--blur-xl));
          z-index: var(--z-modal);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-lg);
          overflow-y: auto;
          animation: fadeIn var(--transition-base);
        }

        .presentation-content {
          max-width: 1200px;
          width: 100%;
          padding: var(--spacing-3xl);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-2xl);
          position: relative;
          animation: slideInUp var(--transition-slow);
        }

        .btn-close {
          position: absolute;
          top: var(--spacing-lg);
          right: var(--spacing-lg);
          width: 48px;
          height: 48px;
          border: none;
          background: rgba(239, 68, 68, 0.2);
          color: var(--color-danger);
          border-radius: 50%;
          cursor: pointer;
          font-size: var(--font-2xl);
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .btn-close:hover {
          background: var(--color-danger);
          color: white;
          transform: scale(1.1);
        }

        .savings-hero {
          text-align: center;
          padding: var(--spacing-3xl);
          border-radius: var(--radius-2xl);
          position: relative;
          overflow: hidden;
        }

        .savings-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.1;
          z-index: 0;
        }

        .savings-hero.positive {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.1));
          border: 4px solid var(--color-success);
          box-shadow: 0 0 60px rgba(16, 185, 129, 0.4);
        }

        .savings-hero.negative {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.1));
          border: 4px solid var(--color-danger);
          box-shadow: 0 0 60px rgba(239, 68, 68, 0.4);
        }

        .savings-icon {
          font-size: 6rem;
          margin-bottom: var(--spacing-lg);
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .savings-label {
          font-size: var(--font-3xl);
          font-weight: var(--font-bold);
          letter-spacing: 0.1em;
          margin-bottom: var(--spacing-md);
          opacity: 0.9;
        }

        .savings-amount {
          font-size: 5rem;
          font-weight: var(--font-extrabold);
          line-height: 1;
          margin-bottom: var(--spacing-md);
          position: relative;
          z-index: 1;
        }

        .savings-hero.positive .savings-amount {
          color: var(--color-success);
          text-shadow: 0 0 30px rgba(16, 185, 129, 0.5);
        }

        .savings-hero.negative .savings-amount {
          color: var(--color-danger);
          text-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
        }

        .savings-period {
          font-size: var(--font-xl);
          opacity: 0.8;
        }

        .comparison-summary {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: var(--spacing-2xl);
          padding: var(--spacing-2xl);
          background: var(--glass-bg);
          border-radius: var(--radius-xl);
          backdrop-filter: blur(var(--blur-lg));
          border: 1px solid var(--glass-border);
        }

        .summary-column {
          text-align: center;
        }

        .summary-label {
          font-size: var(--font-lg);
          font-weight: var(--font-semibold);
          margin-bottom: var(--spacing-md);
          color: var(--text-secondary);
        }

        .summary-amount {
          font-size: var(--font-4xl);
          font-weight: var(--font-extrabold);
          margin-bottom: var(--spacing-md);
          color: var(--color-orange);
        }

        .summary-details {
          font-size: var(--font-base);
          color: var(--text-tertiary);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-xs) 0;
        }

        .detail-row.total {
          border-top: 1px solid var(--glass-border);
          margin-top: var(--spacing-xs);
          padding-top: var(--spacing-sm);
          font-weight: var(--font-semibold);
        }

        .detail-row.discount {
          color: var(--color-success);
        }

        .detail-label {
          font-size: var(--font-sm);
        }

        .detail-value {
          font-weight: var(--font-semibold);
          color: var(--color-orange);
        }

        .detail-value.text-success {
          color: var(--color-success);
        }

        .summary-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--font-4xl);
          color: var(--color-orange);
        }

        .plans-summary,
        .streaming-summary {
          background: var(--glass-bg);
          border-radius: var(--radius-xl);
          padding: var(--spacing-2xl);
          backdrop-filter: blur(var(--blur-lg));
          border: 1px solid var(--glass-border);
        }

        .plans-summary h3,
        .streaming-summary h3 {
          margin-bottom: var(--spacing-lg);
          text-align: center;
          font-size: var(--font-2xl);
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-md);
        }

        .plan-summary-card {
          padding: var(--spacing-lg);
          background: rgba(0, 0, 0, 0.3);
          border-radius: var(--radius-lg);
          border: 1px solid var(--glass-border);
        }

        .plan-provider {
          font-size: var(--font-xs);
          font-weight: var(--font-bold);
          letter-spacing: 0.05em;
          margin-bottom: var(--spacing-xs);
        }

        .plan-name {
          font-size: var(--font-xl);
          font-weight: var(--font-bold);
          margin-bottom: var(--spacing-xs);
        }

        .plan-qty {
          font-size: var(--font-sm);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-sm);
        }

        .plan-streaming-badge {
          font-size: var(--font-sm);
          padding: var(--spacing-xs) var(--spacing-sm);
          background: rgba(16, 185, 129, 0.2);
          border-radius: var(--radius-md);
          display: inline-block;
        }

        .streaming-items {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .streaming-group-label {
          font-size: var(--font-base);
          font-weight: var(--font-semibold);
          margin-bottom: var(--spacing-sm);
        }

        .streaming-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
        }

        .streaming-tag {
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: var(--radius-md);
          font-size: var(--font-sm);
        }

        .streaming-tag.included {
          background: rgba(16, 185, 129, 0.2);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .streaming-logo {
          width: 20px;
          height: 20px;
          margin-right: var(--spacing-xs);
          vertical-align: middle;
          object-fit: contain;
          border-radius: var(--radius-sm);
        }

        .streaming-price {
          font-size: var(--font-xs);
          opacity: 0.8;
          margin-left: var(--spacing-xs);
        }

        .streaming-coverage-header {
          margin-bottom: var(--spacing-lg);
          text-align: center;
        }

        .coverage-stats {
          display: flex;
          justify-content: center;
          gap: var(--spacing-xl);
          margin-bottom: var(--spacing-lg);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--spacing-md);
          background: rgba(0, 0, 0, 0.2);
          border-radius: var(--radius-lg);
          border: 1px solid var(--glass-border);
          min-width: 80px;
        }

        .stat-item.total {
          background: rgba(255, 107, 26, 0.1);
          border-color: rgba(255, 107, 26, 0.3);
        }

        .stat-number {
          font-size: var(--font-2xl);
          font-weight: var(--font-extrabold);
          color: var(--color-orange);
          line-height: 1;
        }

        .stat-item.total .stat-number {
          color: var(--color-orange);
        }

        .stat-label {
          font-size: var(--font-sm);
          color: var(--text-secondary);
          margin-top: var(--spacing-xs);
        }

        .presentation-footer {
          text-align: center;
          padding-top: var(--spacing-lg);
          border-top: 1px solid var(--glass-border);
        }

        .footer-text {
          color: var(--text-muted);
          font-size: var(--font-sm);
        }

        @media (max-width: 900px) {
          .presentation-content {
            padding: var(--spacing-xl);
            gap: var(--spacing-lg);
          }

          .savings-hero {
            padding: var(--spacing-xl);
          }

          .savings-icon {
            font-size: 4rem;
          }

          .savings-amount {
            font-size: 3rem;
          }

          .comparison-summary {
            grid-template-columns: 1fr;
            gap: var(--spacing-lg);
          }

          .summary-divider {
            transform: rotate(90deg);
          }

          .plans-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}


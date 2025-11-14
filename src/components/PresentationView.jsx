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
  freeSetup,
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
    originalItemPrice,
    freeSetup
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
        {/* Close button - Ultra Minimal Apple Style */}
        <button onClick={onClose} className="btn-close" aria-label="Luk">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>

        {/* Main savings display - Steve Jobs Ultra Minimal */}
        <div className={`savings-hero ${isPositiveSavings ? 'positive' : 'negative'}`}>
          <div className="savings-amount">
            {isPositiveSavings ? '' : '-'}
            {formatCurrency(Math.abs(animatedSavings))}
          </div>
          <div className="savings-label">
            {isPositiveSavings ? 'BESPARELSE' : 'MERSALG'}
          </div>
          <div className="savings-period">over 6 måneder.</div>
        </div>

        {/* Comparison summary - Steve Jobs Ultra Minimal with Details */}
        <div className="comparison-summary">
          <div className="summary-column">
            <div className="summary-label">Kundens Situation</div>
            <div className="summary-amount">{formatCurrency(customerTotals.sixMonth)}</div>
            <div className="summary-subtitle">6 måneder</div>
            <div className="summary-details">
              <div className="detail-row">
                <span className="detail-label">Mobil:</span>
                <span className="detail-value">{formatCurrency(customerMobileCost || 0)}/md.</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Streaming:</span>
                <span className="detail-value">{formatCurrency(streamingCost)}/md.</span>
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

          <div className="summary-divider">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <div className="summary-column">
            <div className="summary-label">Vores Tilbud</div>
            <div className="summary-amount">{formatCurrency(ourOfferTotals.sixMonth)}</div>
            <div className="summary-subtitle">6 måneder</div>
            <div className="summary-details">
              <div className="detail-row">
                <span className="detail-label">Abonnementer:</span>
                <span className="detail-value">{formatCurrency(ourOfferTotals.monthly - (notIncludedStreamingCost || 0))}/md.</span>
              </div>
              {ourOfferTotals.telenorDiscount > 0 && (
                <div className="detail-row discount">
                  <span className="detail-label">Telenor rabat:</span>
                  <span className="detail-value text-success">-{formatCurrency(ourOfferTotals.telenorDiscount)}/md.</span>
                </div>
              )}
              {notIncludedStreamingCost > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Streaming tillæg:</span>
                  <span className="detail-value">{formatCurrency(notIncludedStreamingCost)}/md.</span>
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
              {freeSetup && ourOfferTotals.setupFeeDiscount > 0 && (
                <div className="detail-row discount">
                  <span className="detail-label">Gratis oprettelse:</span>
                  <span className="detail-value text-success">-{formatCurrency(ourOfferTotals.setupFeeDiscount)}</span>
                </div>
              )}
              <div className="detail-row total">
                <span className="detail-label">Total/md:</span>
                <span className="detail-value">{formatCurrency(ourOfferTotals.monthly)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected plans - Steve Jobs Minimal */}
        {cartItems.length > 0 && (
          <div className="plans-summary">
            <div className="plans-grid">
              {cartItems.map(item => (
                <div key={item.plan.id} className="plan-summary-card">
                  <div className="plan-name">{item.plan.name}</div>
                  <div className="plan-provider" style={{ color: item.plan.color }}>
                    {item.plan.provider.toUpperCase()}
                  </div>
                  <div className="plan-qty">
                    {item.quantity} abonnement{item.quantity !== 1 ? 'er' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Streaming services - Steve Jobs Ultra Elegant */}
        {selectedStreaming.length > 0 && (
          <div className="streaming-summary">
            <div className="streaming-header">
              <div className="streaming-label">Streaming Tjenester</div>
              <div className="streaming-count">{selectedStreaming.length} tjeneste{selectedStreaming.length !== 1 ? 'r' : ''}</div>
            </div>
            <div className="streaming-items">
              {streamingCoverage.included.length > 0 && (
                <div className="streaming-group">
                  <div className="streaming-group-header">
                    <div className="streaming-group-icon included-icon">✓</div>
                    <div className="streaming-group-label">
                      Inkluderet i abonnement
                      <span className="streaming-group-count">({streamingCoverage.included.length})</span>
                    </div>
                  </div>
                  <div className="streaming-tags">
                    {streamingCoverage.included.map(id => {
                      const service = getServiceById(id);
                      return service ? (
                        <div key={id} className="streaming-tag included">
                          <img 
                            src={service.logo} 
                            alt={service.name}
                            className="streaming-logo"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                          <span className="streaming-logo-fallback" style={{ display: 'none' }}>{service.name.charAt(0)}</span>
                          <span className="streaming-name">{service.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              {streamingCoverage.notIncluded.length > 0 && (
                <div className="streaming-group">
                  <div className="streaming-group-header">
                    <div className="streaming-group-icon add-icon">+</div>
                    <div className="streaming-group-label">
                      Tillæg til abonnement
                      <span className="streaming-group-count">({streamingCoverage.notIncluded.length})</span>
                    </div>
                  </div>
                  <div className="streaming-tags">
                    {streamingCoverage.notIncluded.map(id => {
                      const service = getServiceById(id);
                      return service ? (
                        <div key={id} className="streaming-tag">
                          <img 
                            src={service.logo} 
                            alt={service.name}
                            className="streaming-logo"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                          <span className="streaming-logo-fallback" style={{ display: 'none' }}>{service.name.charAt(0)}</span>
                          <span className="streaming-name">{service.name}</span>
                          <span className="streaming-price">({formatCurrency(service.price)}/md.)</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer info - Ultra Minimal */}
        <div className="presentation-footer">
          <div className="footer-text">
            Tryk ESC for at lukke.
          </div>
        </div>
      </div>

      <style>{`
        /* Presentation Overlay - Steve Jobs Ultra Minimal */
        .presentation-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);
          z-index: var(--z-modal);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-md);
          overflow: hidden;
          animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .presentation-content {
          max-width: 900px;
          width: 100%;
          max-height: 100vh;
          padding: clamp(1rem, 2vw, 1.5rem);
          display: flex;
          flex-direction: column;
          gap: clamp(0.75rem, 1.5vw, 1.25rem);
          position: relative;
          animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Close button - Ultra Minimal Apple Style */
        .btn-close {
          position: absolute;
          top: var(--spacing-sm);
          right: var(--spacing-sm);
          width: 32px;
          height: 32px;
          border: none;
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        /* Savings Hero - Steve Jobs Ultra Minimal Perfection */
        .savings-hero {
          text-align: center;
          padding: clamp(0.5rem, 1vw, 1rem) clamp(0.5rem, 1vw, 1rem);
          position: relative;
        }

        .savings-amount {
          font-size: clamp(2.5rem, 8vw, 5rem);
          font-weight: 700;
          line-height: 1;
          margin-bottom: clamp(0.25rem, 0.5vw, 0.5rem);
          letter-spacing: -0.05em;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif;
        }

        .savings-hero.positive .savings-amount {
          color: #34D399;
        }

        .savings-hero.negative .savings-amount {
          color: #F87171;
        }

        .savings-label {
          font-size: clamp(0.625rem, 1vw, 0.75rem);
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: clamp(0.125rem, 0.25vw, 0.25rem);
          color: rgba(255, 255, 255, 0.6);
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
        }

        .savings-period {
          font-size: clamp(0.75rem, 1vw, 0.875rem);
          color: rgba(255, 255, 255, 0.5);
          font-weight: 400;
          letter-spacing: -0.01em;
        }

        /* Comparison Summary - Steve Jobs Ultra Minimal */
        .comparison-summary {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: clamp(0.5rem, 1vw, 1rem);
          padding: clamp(0.75rem, 1.5vw, 1rem);
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-2xl);
          backdrop-filter: blur(32px) saturate(180%);
          -webkit-backdrop-filter: blur(32px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .summary-column {
          text-align: center;
        }

        .summary-label {
          font-size: clamp(0.625rem, 0.9vw, 0.75rem);
          font-weight: 600;
          margin-bottom: clamp(0.25rem, 0.5vw, 0.5rem);
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
        }

        .summary-amount {
          font-size: clamp(1.25rem, 3vw, 2rem);
          font-weight: 700;
          margin-bottom: clamp(0.125rem, 0.25vw, 0.25rem);
          color: rgba(255, 255, 255, 0.9);
          letter-spacing: -0.03em;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif;
        }

        .summary-subtitle {
          font-size: clamp(0.625rem, 0.9vw, 0.75rem);
          color: rgba(255, 255, 255, 0.4);
          font-weight: 400;
          letter-spacing: -0.01em;
        }

        .summary-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.3);
        }

        .summary-divider svg {
          width: 16px;
          height: 16px;
        }

        .summary-details {
          margin-top: clamp(0.5rem, 1vw, 0.75rem);
          font-size: clamp(0.625rem, 0.9vw, 0.75rem);
          color: rgba(255, 255, 255, 0.6);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.125rem 0;
        }

        .detail-row.total {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: 0.25rem;
          padding-top: 0.25rem;
          font-weight: 600;
        }

        .detail-row.discount {
          color: #34D399;
        }

        .detail-label {
          font-size: clamp(0.625rem, 0.85vw, 0.75rem);
          color: rgba(255, 255, 255, 0.5);
        }

        .detail-value {
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          font-size: clamp(0.625rem, 0.85vw, 0.75rem);
        }

        .detail-value.text-success {
          color: #34D399;
        }

        /* Plans Summary - Steve Jobs Ultra Minimal */
        .plans-summary {
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-2xl);
          padding: clamp(0.5rem, 1vw, 0.75rem);
          backdrop-filter: blur(32px) saturate(180%);
          -webkit-backdrop-filter: blur(32px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: var(--spacing-xs);
        }

        .plan-summary-card {
          padding: var(--spacing-sm);
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.05);
          text-align: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .plan-summary-card:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .plan-name {
          font-size: clamp(0.75rem, 1.2vw, 0.875rem);
          font-weight: 600;
          margin-bottom: 0.125rem;
          color: rgba(255, 255, 255, 0.9);
          letter-spacing: -0.02em;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif;
        }

        .plan-provider {
          font-size: clamp(0.5rem, 0.8vw, 0.625rem);
          font-weight: 600;
          letter-spacing: 0.1em;
          margin-bottom: 0.125rem;
          text-transform: uppercase;
          opacity: 0.6;
        }

        .plan-qty {
          font-size: clamp(0.625rem, 0.9vw, 0.75rem);
          color: rgba(255, 255, 255, 0.5);
          font-weight: 400;
        }

        /* Streaming Summary - Steve Jobs Ultra Elegant */
        .streaming-summary {
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-2xl);
          padding: clamp(0.75rem, 1.5vw, 1.25rem);
          backdrop-filter: blur(32px) saturate(180%);
          -webkit-backdrop-filter: blur(32px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .streaming-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: clamp(0.75rem, 1.5vw, 1rem);
          padding-bottom: clamp(0.5rem, 1vw, 0.75rem);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .streaming-label {
          font-size: clamp(0.625rem, 0.9vw, 0.75rem);
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
        }

        .streaming-count {
          font-size: clamp(0.625rem, 0.9vw, 0.75rem);
          color: rgba(255, 255, 255, 0.4);
          font-weight: 400;
        }

        .streaming-items {
          display: flex;
          flex-direction: column;
          gap: clamp(0.75rem, 1.5vw, 1.25rem);
        }

        .streaming-group {
          display: flex;
          flex-direction: column;
          gap: clamp(0.5rem, 1vw, 0.75rem);
        }

        .streaming-group-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .streaming-group-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .streaming-group-icon.included-icon {
          background: rgba(16, 185, 129, 0.2);
          color: #34D399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .streaming-group-icon.add-icon {
          background: rgba(59, 130, 246, 0.2);
          color: #60A5FA;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .streaming-group-label {
          font-size: clamp(0.75rem, 1vw, 0.875rem);
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          gap: 0.25rem;
          letter-spacing: -0.01em;
        }

        .streaming-group-count {
          font-size: clamp(0.625rem, 0.85vw, 0.75rem);
          color: rgba(255, 255, 255, 0.5);
          font-weight: 400;
        }

        .streaming-tags {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 0.5rem;
        }

        .streaming-tag {
          padding: clamp(0.5rem, 0.75vw, 0.75rem);
          background: rgba(59, 130, 246, 0.08);
          border: 1px solid rgba(59, 130, 246, 0.15);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .streaming-tag:hover {
          background: rgba(59, 130, 246, 0.12);
          border-color: rgba(59, 130, 246, 0.25);
          transform: translateY(-1px);
        }

        .streaming-tag.included {
          background: rgba(16, 185, 129, 0.08);
          border-color: rgba(16, 185, 129, 0.15);
        }

        .streaming-tag.included:hover {
          background: rgba(16, 185, 129, 0.12);
          border-color: rgba(16, 185, 129, 0.25);
        }

        .streaming-logo {
          width: 24px;
          height: 24px;
          object-fit: contain;
          border-radius: 4px;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.05);
        }

        .streaming-logo-fallback {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
          flex-shrink: 0;
        }

        .streaming-name {
          font-size: clamp(0.75rem, 1vw, 0.875rem);
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
          letter-spacing: -0.01em;
          flex: 1;
        }

        .streaming-price {
          font-size: clamp(0.625rem, 0.85vw, 0.75rem);
          color: rgba(255, 255, 255, 0.5);
          font-weight: 400;
          margin-left: auto;
        }

        /* Presentation Footer - Ultra Minimal */
        .presentation-footer {
          text-align: center;
          padding-top: clamp(0.5rem, 1vw, 0.75rem);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .footer-text {
          color: rgba(255, 255, 255, 0.3);
          font-size: clamp(0.625rem, 0.8vw, 0.75rem);
          font-weight: 400;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
        }

        @media (max-width: 900px) {
          .presentation-overlay {
            padding: var(--spacing-xs);
          }

          .presentation-content {
            padding: clamp(0.75rem, 1.5vw, 1rem);
            gap: clamp(0.5rem, 1vw, 0.75rem);
          }

          .btn-close {
            top: var(--spacing-xs);
            right: var(--spacing-xs);
            width: 28px;
            height: 28px;
          }

          .savings-hero {
            padding: clamp(0.5rem, 1vw, 0.75rem) var(--spacing-xs);
          }

          .comparison-summary {
            grid-template-columns: 1fr;
            gap: var(--spacing-xs);
            padding: var(--spacing-sm);
          }

          .summary-divider {
            transform: rotate(90deg);
            margin: var(--spacing-xs) 0;
          }

          .plans-grid {
            grid-template-columns: 1fr;
          }

          .streaming-tags {
            grid-template-columns: 1fr;
          }

          .streaming-group-header {
            gap: 0.375rem;
          }

          .streaming-group-icon {
            width: 18px;
            height: 18px;
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}


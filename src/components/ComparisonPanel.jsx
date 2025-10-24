/**
 * ComparisonPanel komponent
 * Sammenligner kundens situation med vores tilbud
 */

import { useEffect, memo } from 'react';
import {
  formatCurrency,
  calculateCustomerTotal,
  calculateOurOfferTotal,
  calculateSavings,
  checkStreamingCoverageWithCBBMix,
  checkCBBMixCompatibility,
  autoAdjustCashDiscount
} from '../utils/calculations';
import { getStreamingTotal } from '../data/streamingServices';

const ComparisonPanel = memo(function ComparisonPanel({
  cartItems,
  selectedStreaming,
  customerMobileCost,
  originalItemPrice,
  cashDiscount,
  onCashDiscountChange,
  cashDiscountLocked,
  onCashDiscountLockedChange,
  autoAdjust,
  onAutoAdjustChange,
  showCashDiscount
}) {
  // Beregn streaming coverage med CBB MIX support
  const streamingCoverage = checkStreamingCoverageWithCBBMix(cartItems, selectedStreaming);
  const notIncludedStreamingCost = getStreamingTotal(streamingCoverage.notIncluded);
  
  // Check CBB MIX kompatibilitet
  const cbbMixCompatibility = checkCBBMixCompatibility(cartItems);

  // Kunde totaler
  const streamingCost = getStreamingTotal(selectedStreaming);
  const customerTotals = calculateCustomerTotal(customerMobileCost, streamingCost, originalItemPrice);

  // Vores tilbud (uden kontant rabat for auto-adjust beregning)
  const ourOfferWithoutDiscount = calculateOurOfferTotal(
    cartItems,
    notIncludedStreamingCost,
    0,
    originalItemPrice
  );

  // Auto-adjust kontant rabat
  useEffect(() => {
    if (autoAdjust && !cashDiscountLocked && cartItems.length > 0) {
      const neededDiscount = autoAdjustCashDiscount(
        customerTotals.sixMonth,
        ourOfferWithoutDiscount.sixMonth,
        500
      );
      if (neededDiscount !== (cashDiscount || 0)) {
        onCashDiscountChange(neededDiscount);
      }
    }
  }, [autoAdjust, cashDiscountLocked, customerTotals.sixMonth, ourOfferWithoutDiscount.sixMonth, cartItems.length, cashDiscount, onCashDiscountChange]);

  // Vores tilbud med kontant rabat
  const ourOfferTotals = calculateOurOfferTotal(
    cartItems,
    notIncludedStreamingCost,
    cashDiscount,
    originalItemPrice
  );

  // Besparelse
  const savings = calculateSavings(customerTotals.sixMonth, ourOfferTotals.sixMonth);
  const isPositiveSavings = savings > 0;

  if (cartItems.length === 0) {
    return (
      <div className="comparison-panel glass-card-no-hover fade-in-up">
        <div className="section-header">
          <h2>📊 Sammenligning</h2>
          <p className="text-secondary">Tilføj planer for at se sammenligning</p>
        </div>
        
        <div className="empty-state scale-in">
          <div className="empty-state-icon pulse">📊</div>
          <p className="text-secondary">
            Ingen data at sammenligne endnu
          </p>
        </div>

        <style>{`
          .comparison-panel {
            padding: var(--spacing-2xl);
          }

          .section-header {
            margin-bottom: var(--spacing-xl);
          }

          .empty-state {
            padding: var(--spacing-3xl);
            text-align: center;
          }

          .empty-state-icon {
            font-size: var(--font-5xl);
            margin-bottom: var(--spacing-md);
            opacity: 0.3;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="comparison-panel glass-card-no-hover fade-in-up">
      <div className="section-header">
        <h2>📊 Sammenligning</h2>
        <p className="text-secondary">6-måneders analyse</p>
      </div>

      {/* Kontant rabat sektion (hvis vist) */}
      {showCashDiscount && (
        <>
          <div className="cash-discount-section">
            <div className="cash-discount-header">
              <h3>💰 Kontant Rabat</h3>
              <div className="cash-discount-controls">
                <label className="checkbox-wrapper">
                  <input
                    id="cash-discount-locked"
                    name="cash-discount-locked"
                    type="checkbox"
                    className="checkbox"
                    checked={cashDiscountLocked}
                    onChange={(e) => onCashDiscountLockedChange(e.target.checked)}
                  />
                  <span className="text-sm">🔒 Låst</span>
                </label>
                <label className="checkbox-wrapper">
                  <input
                    id="auto-adjust"
                    name="auto-adjust"
                    type="checkbox"
                    className="checkbox"
                    checked={autoAdjust}
                    onChange={(e) => onAutoAdjustChange(e.target.checked)}
                    disabled={cashDiscountLocked}
                  />
                  <span className="text-sm">🔄 Auto-justér (minimum 500 kr)</span>
                </label>
              </div>
            </div>
            
            <input
              id="cash-discount-amount"
              name="cash-discount-amount"
              type="number"
              className="input cash-discount-input"
              placeholder="0"
              value={cashDiscount || ''}
              onChange={(e) => onCashDiscountChange(parseFloat(e.target.value) || null)}
              disabled={cashDiscountLocked}
              min="0"
              step="100"
            />
          </div>

          <div className="divider"></div>
        </>
      )}

      {/* Streaming status */}
      {selectedStreaming.length > 0 && (
        <>
          <div className="streaming-status">
            <h3>📺 Streaming Status</h3>
            {streamingCoverage.included.length > 0 && (
              <div className="streaming-status-item covered">
                <span className="status-icon">✓</span>
                <span className="status-text">
                  {streamingCoverage.included.length} tjeneste
                  {streamingCoverage.included.length !== 1 ? 'r' : ''} inkluderet
                  {cartItems.some(item => item.plan.streamingCount > 0) && ' (mix)'}
                </span>
              </div>
            )}
            {streamingCoverage.notIncluded.length > 0 && (
              <div className="streaming-status-item not-covered">
                <span className="status-icon">+</span>
                <span className="status-text">
                  {streamingCoverage.notIncluded.length} tjeneste
                  {streamingCoverage.notIncluded.length !== 1 ? 'r' : ''} tillæg 
                  ({formatCurrency(notIncludedStreamingCost)}/md)
                </span>
              </div>
            )}
          </div>

          <div className="divider"></div>
        </>
      )}

      {/* CBB MIX advarsel */}
      {!cbbMixCompatibility.compatible && (
        <>
          <div className="cbb-mix-warning">
            <div className="warning-icon">⚠️</div>
            <div className="warning-content">
              <h4>CBB MIX Advarsel</h4>
              <p>{cbbMixCompatibility.message}</p>
            </div>
          </div>
          <div className="divider"></div>
        </>
      )}

      {/* Sammenligning grid */}
      <div className="comparison-grid">
        {/* Kunde kolonne */}
        <div className="comparison-column customer slide-in-left">
          <div className="column-header">
            <h3>👤 Kunden</h3>
          </div>
          <div className="column-content">
            <div className="amount-row">
              <span className="amount-label">Mobil/md:</span>
              <span className="amount-value">{formatCurrency(customerMobileCost || 0)}</span>
            </div>
            <div className="amount-row">
              <span className="amount-label">Streaming/md:</span>
              <span className="amount-value">{formatCurrency(streamingCost)}</span>
            </div>
            {originalItemPrice > 0 && (
              <div className="amount-row">
                <span className="amount-label">Varens pris:</span>
                <span className="amount-value">{formatCurrency(originalItemPrice)}</span>
              </div>
            )}
            <div className="amount-row total">
              <span className="amount-label font-semibold">Total/md:</span>
              <span className="amount-value font-bold">
                {formatCurrency(customerTotals.monthly)}
              </span>
            </div>
            <div className="amount-row six-month">
              <span className="amount-label">6 måneder:</span>
              <span className="amount-value text-2xl font-extrabold">
                {formatCurrency(customerTotals.sixMonth)}
              </span>
            </div>
          </div>
        </div>

        {/* VS */}
        <div className="comparison-vs scale-in">
          <div className="vs-icon pulse">⚡</div>
          <div className="vs-text">VS</div>
        </div>

        {/* Vores tilbud kolonne */}
        <div className="comparison-column offer slide-in-right">
          <div className="column-header">
            <h3>💼 Vores Tilbud</h3>
          </div>
          <div className="column-content">
            <div className="amount-row">
              <span className="amount-label">Planer/md:</span>
              <span className="amount-value">
                {formatCurrency(ourOfferTotals.monthly - (notIncludedStreamingCost || 0))}
              </span>
            </div>
            {ourOfferTotals.telenorDiscount > 0 && (
              <div className="amount-row discount">
                <span className="amount-label">Telenor rabat:</span>
                <span className="amount-value text-success">
                  -{formatCurrency(ourOfferTotals.telenorDiscount)}/md
                </span>
              </div>
            )}
            {notIncludedStreamingCost > 0 && (
              <div className="amount-row">
                <span className="amount-label">Streaming tillæg:</span>
                <span className="amount-value">{formatCurrency(notIncludedStreamingCost)}/md</span>
              </div>
            )}
            {originalItemPrice > 0 && (
              <div className="amount-row">
                <span className="amount-label">Varens pris:</span>
                <span className="amount-value">{formatCurrency(originalItemPrice)}</span>
              </div>
            )}
            {ourOfferTotals.setupFee > 0 && (
              <div className="amount-row">
                <span className="amount-label">Oprettelsesgebyr:</span>
                <span className="amount-value">{formatCurrency(ourOfferTotals.setupFee)}</span>
              </div>
            )}
            <div className="amount-row total">
              <span className="amount-label font-semibold">Total/md:</span>
              <span className="amount-value font-bold">
                {formatCurrency(ourOfferTotals.monthly)}
              </span>
            </div>
            <div className="amount-row six-month">
              <span className="amount-label">6 måneder:</span>
              <span className="amount-value text-2xl font-extrabold">
                {formatCurrency(ourOfferTotals.sixMonth)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="divider"></div>

      {/* Besparelse */}
      <div className={`savings-banner ${isPositiveSavings ? 'positive' : 'negative'} bounce-in`}>
        <div className="savings-label">
          {isPositiveSavings ? '✅ Besparelse' : '⚠️ Mersalg'}
        </div>
        <div className={`savings-amount ${isPositiveSavings ? 'pulse-glow' : ''}`}>
          {isPositiveSavings ? '' : '-'}
          {formatCurrency(Math.abs(savings))}
        </div>
        <div className="savings-subtitle">
          over 6 måneder
        </div>
      </div>

      <style>{`
        .comparison-panel {
          padding: var(--spacing-lg);
        }

        .section-header {
          margin-bottom: var(--spacing-lg);
        }

        .section-header h2 {
          margin: 0;
          margin-bottom: var(--spacing-xs);
        }

        .cash-discount-section {
          margin-bottom: var(--spacing-lg);
        }

        .cash-discount-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
          flex-wrap: wrap;
          gap: var(--spacing-md);
        }

        .cash-discount-header h3 {
          margin: 0;
        }

        .cash-discount-controls {
          display: flex;
          gap: var(--spacing-md);
        }

        .cash-discount-input {
          font-size: var(--font-xl);
          font-weight: var(--font-bold);
          text-align: center;
        }

        .streaming-status {
          margin-bottom: var(--spacing-lg);
        }

        .streaming-status h3 {
          margin-bottom: var(--spacing-md);
        }

        .streaming-status-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-sm);
        }

        .streaming-status-item.covered {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .streaming-status-item.not-covered {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .status-icon {
          font-size: var(--font-xl);
          font-weight: var(--font-bold);
        }

        .status-text {
          font-size: var(--font-sm);
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: var(--spacing-lg);
          align-items: start;
        }

        .comparison-column {
          background: var(--glass-bg);
          border-radius: var(--radius-lg);
          border: 2px solid var(--glass-border);
          overflow: hidden;
          transition: all var(--transition-smooth);
        }

        .comparison-column:hover {
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl), 0 0 20px rgba(255, 107, 26, 0.1);
        }

        .column-header {
          padding: var(--spacing-md);
          text-align: center;
          border-bottom: 2px solid var(--glass-border);
        }

        .column-header h3 {
          margin: 0;
          font-size: var(--font-lg);
        }

        .column-content {
          padding: var(--spacing-lg);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .amount-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-xs) 0;
        }

        .amount-row.discount {
          font-size: var(--font-sm);
        }

        .amount-row.total {
          padding-top: var(--spacing-sm);
          border-top: 1px solid var(--glass-border);
          margin-top: var(--spacing-xs);
        }

        .amount-row.six-month {
          padding: var(--spacing-md);
          background: rgba(255, 107, 26, 0.1);
          border-radius: var(--radius-md);
          margin-top: var(--spacing-sm);
        }

        .amount-label {
          font-size: var(--font-sm);
          color: var(--text-secondary);
        }

        .amount-value {
          font-size: var(--font-base);
          color: var(--text-primary);
        }

        .comparison-vs {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-xs);
          padding-top: 3rem;
        }

        .vs-icon {
          font-size: var(--font-3xl);
        }

        .vs-text {
          font-size: var(--font-xl);
          font-weight: var(--font-extrabold);
          color: var(--text-gradient);
        }

        .savings-banner {
          padding: var(--spacing-2xl);
          border-radius: var(--radius-xl);
          text-align: center;
          position: relative;
          overflow: hidden;
          transition: all var(--transition-smooth);
        }

        .savings-banner:hover {
          transform: scale(1.02);
        }

        .savings-banner.positive {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
          border: 3px solid var(--color-success);
          box-shadow: var(--glow-green), 0 10px 40px rgba(16, 185, 129, 0.3);
        }

        .savings-banner.positive:hover {
          box-shadow: var(--glow-green), 0 20px 60px rgba(16, 185, 129, 0.4);
        }

        .savings-banner.negative {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1));
          border: 3px solid var(--color-danger);
          box-shadow: 0 0 30px rgba(239, 68, 68, 0.3);
        }

        .savings-banner.negative:hover {
          box-shadow: 0 0 40px rgba(239, 68, 68, 0.4);
        }

        .savings-label {
          font-size: var(--font-xl);
          font-weight: var(--font-bold);
          margin-bottom: var(--spacing-sm);
        }

        .savings-amount {
          font-size: var(--font-5xl);
          font-weight: var(--font-extrabold);
          line-height: 1;
          margin-bottom: var(--spacing-sm);
        }

        .savings-banner.positive .savings-amount {
          color: var(--color-success);
        }

        .savings-banner.negative .savings-amount {
          color: var(--color-danger);
        }

        .savings-subtitle {
          font-size: var(--font-base);
          color: var(--text-secondary);
        }

        .cbb-mix-warning {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          margin: var(--spacing-md) 0;
        }

        .warning-icon {
          font-size: var(--font-2xl);
          flex-shrink: 0;
        }

        .warning-content h4 {
          margin: 0 0 var(--spacing-xs) 0;
          color: var(--color-danger);
          font-size: var(--font-lg);
        }

        .warning-content p {
          margin: 0;
          color: var(--text-secondary);
          font-size: var(--font-sm);
        }

        @media (max-width: 900px) {
          .comparison-panel {
            padding: var(--spacing-lg);
          }

          .comparison-grid {
            grid-template-columns: 1fr;
            gap: var(--spacing-md);
          }

          .comparison-vs {
            order: 2;
            padding: var(--spacing-md) 0;
          }

          .comparison-column.customer {
            order: 1;
          }

          .comparison-column.offer {
            order: 3;
          }

          .savings-banner {
            padding: var(--spacing-lg);
          }

          .savings-amount {
            font-size: var(--font-4xl);
          }
        }
      `}</style>
    </div>
  );
});

export default ComparisonPanel;


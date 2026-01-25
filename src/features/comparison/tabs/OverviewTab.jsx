/**
 * OverviewTab - Oversigts-fane til ComparisonPanel
 * Viser sammenligning mellem kundens total og vores tilbud
 */

import React from 'react';
import { formatCurrency, calculateSavings, calculateEffectiveHardwarePrice } from '../../../utils/calculations';
import Icon from '../../../components/common/Icon';
import NumberDisplay from '../../../components/common/NumberDisplay';

function OverviewTab({ customerTotals, ourOfferTotals, savings, isPositiveSavings, streamingCoverage, cashDiscount, originalItemPrice, buybackAmount = 0 }) {
  const savingsPercentage = customerTotals.sixMonth > 0 
    ? ((savings / customerTotals.sixMonth) * 100).toFixed(1)
    : 0;

  const effectiveHardwarePrice = originalItemPrice > 0 
    ? calculateEffectiveHardwarePrice(originalItemPrice, savings) 
    : 0;

  return (
    <div className="detailed-comparison">
      {originalItemPrice > 0 && isPositiveSavings && (
        <div className="effective-hardware-card">
          <div className="effective-hardware-header">
            <Icon name="smartphone" size={20} className="effective-hardware-icon" />
            <div className="effective-hardware-title">Effektiv hardware pris</div>
          </div>
          <div className="effective-hardware-content">
            <div className="effective-hardware-original">
              <span className="label">Førpris:</span>
              <span className="value strike">{formatCurrency(originalItemPrice)}</span>
            </div>
            <div className="effective-hardware-arrow">
              <Icon name="arrowRight" size={16} />
            </div>
            <div className="effective-hardware-new">
              <span className="label">Din pris:</span>
              <span className="value highlight">
                {effectiveHardwarePrice <= 0 ? '0 kr.' : formatCurrency(effectiveHardwarePrice)}
              </span>
            </div>
          </div>
          <div className="effective-hardware-footer">
            Du sparer {formatCurrency(savings - buybackAmount)} på dit abonnement over 6 mdr. samt får {formatCurrency(buybackAmount)} i indbytning her og nu.
          </div>
        </div>
      )}

      <div className="comparison-summary-bar">
        <div className="summary-item customer-summary">
          <div className="summary-label">Kundens total</div>
          <div className="summary-value">
            <NumberDisplay value={customerTotals.sixMonth} size="xl" color="orange" />
          </div>
          <div className="summary-period">6 måneder</div>
          <div className="summary-monthly">
            <div className="monthly-label">
              <Icon name="smartphone" size={14} />
              <span>Pr. måned nu:</span>
            </div>
            <div className="monthly-value">
              <NumberDisplay value={customerTotals.monthly || customerTotals.sixMonth / 6} size="lg" color="orange" />
            </div>
          </div>
        </div>
        
        <div className="summary-vs">
          <div className="vs-arrow-wrapper">
            <Icon name="arrowRight" size={32} className="vs-arrow" />
          </div>
          <div className="vs-savings">
            <div className="vs-savings-label">
              {isPositiveSavings ? 'Besparelse' : 'Forskel'}
            </div>
            <div className={`vs-savings-amount ${isPositiveSavings ? 'positive' : 'negative'}`}>
              <NumberDisplay 
                value={Math.abs(savings)} 
                size="2xl" 
                color={isPositiveSavings ? 'success' : 'danger'}
                prefix={isPositiveSavings ? '-' : '+'}
              />
            </div>
            {savingsPercentage !== 0 && (
              <div className="vs-savings-percentage">
                {Math.abs(savingsPercentage)}%
              </div>
            )}
            <div className="vs-monthly-savings">
              <Icon name="trendingDown" size={16} />
              <span>{formatCurrency(Math.abs(savings) / 6)}/md.</span>
            </div>
          </div>
        </div>

        <div className="summary-item offer-summary">
          <div className="summary-label">Vores tilbud</div>
          <div className="summary-value">
            <NumberDisplay value={ourOfferTotals.sixMonth} size="xl" color="success" />
          </div>
          <div className="summary-period">6 måneder</div>
          <div className="summary-monthly">
            <div className="monthly-label">
              <Icon name="gift" size={14} />
              <span>Pr. måned hos os:</span>
            </div>
            <div className="monthly-value">
              <NumberDisplay value={ourOfferTotals.monthly || ourOfferTotals.sixMonth / 6} size="lg" color="success" />
            </div>
          </div>
        </div>
      </div>

      {(streamingCoverage.included.length > 0 || 
        ourOfferTotals.telenorDiscount > 0 || 
        cashDiscount > 0) && (
        <div className="highlights-list">
          {streamingCoverage.included.length > 0 && (
            <div className="highlight-item success">
              <Icon name="checkCircle" size={18} className="highlight-icon" />
              <div className="highlight-content">
                <div className="highlight-title">
                  {streamingCoverage.included.length} {streamingCoverage.included.length === 1 ? 'streaming-tjeneste inkluderet' : 'streaming-tjenester inkluderet'}
                </div>
                <div className="highlight-value text-success">Gratis</div>
              </div>
            </div>
          )}
          
          {ourOfferTotals.telenorDiscount > 0 && (
            <div className="highlight-item success">
              <Icon name="users" size={18} className="highlight-icon" />
              <div className="highlight-content">
                <div className="highlight-title">Familie-rabat</div>
                <div className="highlight-value text-success">-{formatCurrency(ourOfferTotals.telenorDiscount)}/md.</div>
              </div>
            </div>
          )}

          {cashDiscount > 0 && (
            <div className="highlight-item success">
              <Icon name="wallet" size={18} className="highlight-icon" />
              <div className="highlight-content">
                <div className="highlight-title">Kontant rabat</div>
                <div className="highlight-value text-success">-{formatCurrency(cashDiscount)}</div>
              </div>
            </div>
          )}

          {buybackAmount > 0 && (
            <div className="highlight-item success">
              <Icon name="refresh" size={18} className="highlight-icon" />
              <div className="highlight-content">
                <div className="highlight-title">RePOWER indbytning</div>
                <div className="highlight-value text-success">-{formatCurrency(buybackAmount)}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default React.memo(OverviewTab);


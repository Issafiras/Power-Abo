/**
 * OverviewTab - Oversigts-fane til ComparisonPanel
 * Viser sammenligning mellem kundens total og vores tilbud
 */

import React from 'react';
import { formatCurrency, calculateSavings } from '../../../utils/calculations';
import Icon from '../../../components/common/Icon';
import NumberDisplay from '../../../components/common/NumberDisplay';

function OverviewTab({ customerTotals, ourOfferTotals, savings, isPositiveSavings, streamingCoverage, cashDiscount }) {
  const savingsPercentage = customerTotals.sixMonth > 0 
    ? ((savings / customerTotals.sixMonth) * 100).toFixed(1)
    : 0;

  return (
    <div className="detailed-comparison">
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
        </div>
      )}
    </div>
  );
}

export default React.memo(OverviewTab);


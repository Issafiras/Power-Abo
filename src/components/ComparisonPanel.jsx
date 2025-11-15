/**
 * ComparisonPanel komponent
 * Sammenligner kundens situation med vores tilbud
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  formatCurrency,
  calculateCustomerTotal,
  calculateOurOfferTotal,
  calculateSavings,
  calculateTotalEarnings,
  calculateSixMonthPrice,
  calculateMonthlyPrice,
  calculateTelenorFamilyDiscount,
  calculateCBBMixPrice,
  checkStreamingCoverageWithCBBMix,
  checkCBBMixCompatibility,
  autoAdjustCashDiscount
} from '../utils/calculations';
import { getStreamingTotal } from '../data/streamingServices';
import Icon from './common/Icon';
import COPY from '../constants/copy';
import AnimatedCounter from './results/AnimatedCounter';
import Tooltip from './common/Tooltip';
import NumberDisplay from './common/NumberDisplay';
import ComparisonChart from './results/ComparisonChart';

function ComparisonPanel({
  cartItems,
  selectedStreaming,
  customerMobileCost,
  numberOfLines = 1,
  originalItemPrice,
  cashDiscount,
  onCashDiscountChange,
  cashDiscountLocked,
  onCashDiscountLockedChange,
  autoAdjust,
  onAutoAdjustChange,
  showCashDiscount,
  onToggleCashDiscount,
  freeSetup,
  onFreeSetupChange
}) {
  const [showEarnings, setShowEarnings] = useState(false);

  // F8 keyboard shortcut til at vise/skjule indtjening
  useEffect(() => {
    function handleKeyPress(e) {
      if (e.key === 'F8') {
        e.preventDefault();
        setShowEarnings(prev => !prev);
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  // Beregn streaming coverage med CBB MIX support - memoized
  const streamingCoverage = useMemo(() => 
    checkStreamingCoverageWithCBBMix(cartItems, selectedStreaming),
    [cartItems, selectedStreaming]
  );
  
  const notIncludedStreamingCost = useMemo(() => 
    getStreamingTotal(streamingCoverage.notIncluded),
    [streamingCoverage.notIncluded]
  );
  
  // Check CBB MIX kompatibilitet - memoized
  const cbbMixCompatibility = useMemo(() => 
    checkCBBMixCompatibility(cartItems),
    [cartItems]
  );

  // Kunde totaler - mobiludgifter er allerede totalt (ikke pr. linje) - memoized
  const streamingCost = useMemo(() => 
    getStreamingTotal(selectedStreaming),
    [selectedStreaming]
  );
  
  const customerTotals = useMemo(() => 
    calculateCustomerTotal(customerMobileCost, streamingCost, originalItemPrice),
    [customerMobileCost, streamingCost, originalItemPrice]
  );

  // Vores tilbud (uden kontant rabat for auto-adjust beregning) - memoized
  const ourOfferWithoutDiscount = useMemo(() => 
    calculateOurOfferTotal(
      cartItems,
      notIncludedStreamingCost,
      0,
      originalItemPrice,
      freeSetup
    ),
    [cartItems, notIncludedStreamingCost, originalItemPrice, freeSetup]
  );

  // Beregn total indtjening - memoized (engangsindtjening, ikke løbende)
  const totalEarnings = useMemo(() => {
    return calculateTotalEarnings(cartItems); // Engangsindtjening
  }, [cartItems]);

  // Auto-adjust kontant rabat - Sælger-strategi: Giv noget af indtjeningen tilbage
  // Bemærk: Indtjening er engangsindtjening, så vi skal konvertere til 6 måneder for sammenligning
  useEffect(() => {
    if (autoAdjust && !cashDiscountLocked && cartItems.length > 0) {
      // Konverter engangsindtjening til 6 måneder for sammenligning (sælger-strategi)
      const earningsForComparison = totalEarnings; // Engangsindtjening bruges direkte
      const neededDiscount = autoAdjustCashDiscount(
        customerTotals.sixMonth,
        ourOfferWithoutDiscount.sixMonth,
        500,
        earningsForComparison
      );
      if (neededDiscount !== (cashDiscount || 0)) {
        onCashDiscountChange(neededDiscount);
      }
    }
  }, [autoAdjust, cashDiscountLocked, customerTotals.sixMonth, ourOfferWithoutDiscount.sixMonth, cartItems.length, cashDiscount, onCashDiscountChange, totalEarnings]);

  // Vores tilbud med kontant rabat - memoized
  const ourOfferTotals = useMemo(() => 
    calculateOurOfferTotal(
      cartItems,
      notIncludedStreamingCost,
      cashDiscount,
      originalItemPrice,
      freeSetup
    ),
    [cartItems, notIncludedStreamingCost, cashDiscount, originalItemPrice, freeSetup]
  );

  // Besparelse - memoized
  const savings = useMemo(() => 
    calculateSavings(customerTotals.sixMonth, ourOfferTotals.sixMonth),
    [customerTotals.sixMonth, ourOfferTotals.sixMonth]
  );
  
  const isPositiveSavings = savings > 0;

  // Beregn faktisk månedlig abonnementspris (før kontant rabat, men efter familie-rabat)
  // Dette er den korrekte månedlige pris for abonnementerne
  const baseMonthlyPlansPrice = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return 0;
    
    // Sum af alle planers månedlige priser (inkl. intro-priser)
    const plansMonthly = cartItems.reduce((total, item) => {
      const planMonthly = calculateMonthlyPrice(item.plan, item.quantity);
      
      // Tilføj CBB Mix pris hvis aktiv (månedlig)
      if (item.plan.cbbMixAvailable && item.cbbMixEnabled && item.cbbMixCount) {
        const mixPrice = calculateCBBMixPrice(item.plan, item.cbbMixCount);
        return total + planMonthly + (mixPrice * item.quantity);
      }
      
      return total + planMonthly;
    }, 0);
    
    // Træk familie-rabat fra (da det er en del af abonnementsprisen)
    const telenorDiscount = calculateTelenorFamilyDiscount(cartItems);
    
    return plansMonthly - telenorDiscount;
  }, [cartItems]);

  if (cartItems.length === 0) {
    return (
      <div className="comparison-panel glass-card-no-hover fade-in-up">
        <div className="section-header">
          <h2>
            <Icon name="chart" size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {COPY.titles.comparison}
          </h2>
          <p className="text-secondary">{COPY.empty.noCartItems}</p>
        </div>
        
        <div className="empty-state animate-scale-in">
          <Icon name="chart" size={64} className="empty-state-icon animate-pulse" style={{ opacity: 0.3 }} aria-hidden="true" />
          <p className="text-secondary">
            {COPY.empty.noData}
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
        <div className="section-header-top">
          <div>
            <h2>
              <Icon name="chart" size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              {COPY.titles.comparison}
            </h2>
            <p className="text-secondary">{COPY.titles.comparisonSubtitle}</p>
          </div>
          {onToggleCashDiscount && (
            <button
              className="cash-discount-toggle-btn"
              onClick={onToggleCashDiscount}
              aria-label={showCashDiscount ? 'Skjul kontant rabat' : 'Vis kontant rabat'}
              title={showCashDiscount ? 'Skjul kontant rabat' : 'Vis kontant rabat'}
            >
              <Icon 
                name="lock" 
                size={20} 
                className={`cash-discount-toggle-icon ${showCashDiscount ? 'active' : ''}`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Kontant rabat sektion (hvis vist) */}
      {showCashDiscount && (
        <>
          <div className="cash-discount-section">
            <div className="cash-discount-header">
              <h3>
                <Icon name="wallet" size={20} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                {COPY.features.cashDiscount}
              </h3>
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
                  <Icon name="lock" size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  <span className="text-sm">{COPY.features.cashDiscountLocked}</span>
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
                  <Icon name="refresh" size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  <span className="text-sm">{COPY.features.autoAdjust}</span>
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

      {/* Gratis oprettelse checkbox */}
      {cartItems.length > 0 && (
        <>
          <div className="free-setup-section">
            <label className="checkbox-wrapper">
              <input
                id="free-setup"
                name="free-setup"
                type="checkbox"
                className="checkbox"
                checked={freeSetup}
                onChange={(e) => onFreeSetupChange(e.target.checked)}
              />
              <Icon name="gift" size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              <span className="text-sm">{COPY.features.freeSetup} (rabat: {formatCurrency(ourOfferTotals.setupFee)})</span>
            </label>
          </div>

          <div className="divider"></div>
        </>
      )}

      {/* Streaming status */}
      {selectedStreaming.length > 0 && (
        <>
          <div className="streaming-status">
            <h3>
              <Icon name="tv" size={20} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              {COPY.features.streamingStatus}
            </h3>
            {streamingCoverage.included.length > 0 && (
              <div className="streaming-status-item covered">
                <Icon name="check" size={18} className="status-icon" />
                <span className="status-text">
                  {streamingCoverage.included.length} tjeneste
                  {streamingCoverage.included.length !== 1 ? 'r' : ''} inkluderet
                  {cartItems.some(item => item.plan.streamingCount > 0) && ' (mix).'}
                </span>
              </div>
            )}
            {streamingCoverage.notIncluded.length > 0 && (
              <div className="streaming-status-item not-covered">
                <Icon name="plus" size={18} className="status-icon" />
                <span className="status-text">
                  {streamingCoverage.notIncluded.length} tjeneste
                  {streamingCoverage.notIncluded.length !== 1 ? 'r' : ''} tillæg 
                  ({formatCurrency(notIncludedStreamingCost)}/md.).
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
            <Icon name="warning" size={32} className="warning-icon" />
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
        <div className="comparison-column customer animate-slide-in-left">
          <div className="column-header">
            <h3>
              <Icon name="user" size={20} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              {COPY.labels.customerColumn}
            </h3>
          </div>
          <div className="column-content">
            <div className="amount-row">
              <span className="amount-label">Mobil/md. {numberOfLines > 1 ? `(total for ${numberOfLines} abonnementer)` : '(total)'}:</span>
              <NumberDisplay value={customerMobileCost || 0} size="lg" color="primary" suffix="/md." />
            </div>
            <div className="amount-row">
              <span className="amount-label">Streaming/md.:</span>
              <NumberDisplay value={streamingCost} size="lg" color="primary" suffix="/md." />
            </div>
            {originalItemPrice > 0 && (
              <div className="amount-row">
                <span className="amount-label">Varens pris:</span>
                <NumberDisplay value={originalItemPrice} size="lg" color="primary" />
              </div>
            )}
            <div className="amount-row total">
              <span className="amount-label font-semibold">Total/md.:</span>
              <NumberDisplay value={customerTotals.monthly} size="xl" color="orange" suffix="/md." />
            </div>
            <div className="amount-row six-month">
              <span className="amount-label">6 måneder:</span>
              <NumberDisplay value={customerTotals.sixMonth} size="4xl" color="orange" />
            </div>
          </div>
        </div>

        {/* VS */}
        <div className="comparison-vs animate-scale-in">
          <Icon name="zap" size={32} className="vs-icon animate-pulse animate-pulse-glow" />
          <div className="vs-text">VS</div>
        </div>

        {/* Vores tilbud kolonne */}
            <div className="comparison-column offer animate-slide-in-right">
              <div className="column-header">
                <h3>
                  <Icon name="briefcase" size={20} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  {COPY.labels.offerColumn}
                </h3>
                {/* Diskret indtjening info - kun synlig når F8 er trykket */}
                {showEarnings && totalEarnings > 0 && (
                  <div className="earnings-tooltip" title={`Indtjening: ${formatCurrency(totalEarnings)} (engangs)`}>
                    <Icon name="wallet" size={14} className="earnings-indicator" />
                  </div>
                )}
              </div>
          <div className="column-content">
            <div className="amount-row">
              <span className="amount-label">Abonnementer/md. (før kontant rabat):</span>
              <NumberDisplay value={baseMonthlyPlansPrice} size="lg" color="primary" suffix="/md." />
            </div>
            {ourOfferTotals.telenorDiscount > 0 && (
              <div className="amount-row discount">
                <span className="amount-label">Telenor rabat:</span>
                <NumberDisplay value={ourOfferTotals.telenorDiscount} size="lg" color="success" suffix="/md." prefix="-" />
              </div>
            )}
            {notIncludedStreamingCost > 0 && (
              <div className="amount-row">
                <span className="amount-label">Streaming tillæg:</span>
                <NumberDisplay value={notIncludedStreamingCost} size="lg" color="primary" suffix="/md." />
              </div>
            )}
            {originalItemPrice > 0 && (
              <div className="amount-row">
                <span className="amount-label">Varens pris:</span>
                <NumberDisplay value={originalItemPrice} size="lg" color="primary" />
              </div>
            )}
            {ourOfferTotals.setupFee > 0 && (
              <div className="amount-row">
                <span className="amount-label">Oprettelsesgebyr:</span>
                <NumberDisplay value={ourOfferTotals.setupFee} size="lg" color="primary" />
              </div>
            )}
            {freeSetup && ourOfferTotals.setupFeeDiscount > 0 && (
              <div className="amount-row discount">
                <span className="amount-label">Gratis oprettelse:</span>
                <NumberDisplay value={ourOfferTotals.setupFeeDiscount} size="lg" color="success" prefix="-" />
              </div>
            )}
            <div className="amount-row total">
              <span className="amount-label font-semibold">Total/md.:</span>
              <NumberDisplay value={ourOfferTotals.monthly} size="xl" color="orange" suffix="/md." />
            </div>
            <div className="amount-row six-month">
              <span className="amount-label">6 måneder:</span>
              <NumberDisplay value={ourOfferTotals.sixMonth} size="4xl" color="orange" />
            </div>
          </div>
        </div>
      </div>

      <div className="divider"></div>

      {/* Visuel sammenligning chart */}
      {customerTotals.sixMonth > 0 && ourOfferTotals.sixMonth > 0 && (
        <ComparisonChart 
          customerTotal={customerTotals.sixMonth}
          ourOfferTotal={ourOfferTotals.sixMonth}
          savings={savings}
        />
      )}

      <div className="divider"></div>

      {/* Detaljerede beregningsvisninger for sælgerne (kun synlig når F8 er trykket) */}
      {showEarnings && (
        <div className="calculation-details">
          <h4 className="calculation-details-title">
            <Icon name="calculator" size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Beregningsdetaljer (for sælger)
          </h4>
          
          <div className="calculation-section">
            <div className="calculation-subtitle">Vores tilbud - beregning trin for trin:</div>
            
            {/* Trin 1: Abonnementer */}
            <div className="calculation-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <div className="step-label">Abonnementer (6 måneder):</div>
                <div className="step-items">
                  {cartItems.map((item, idx) => {
                    const itemTotal = calculateSixMonthPrice(item.plan, item.quantity);
                    // Vis beregning med intro-pris hvis relevant
                    let calculationText = '';
                    if (item.plan.introPrice && item.plan.introMonths) {
                      const introTotal = item.plan.introPrice * item.plan.introMonths * item.quantity;
                      const remainingMonths = 6 - item.plan.introMonths;
                      const normalTotal = item.plan.price * remainingMonths * item.quantity;
                      calculationText = `${formatCurrency(item.plan.introPrice)} × ${item.plan.introMonths}m + ${formatCurrency(item.plan.price)} × ${remainingMonths}m × ${item.quantity}`;
                    } else {
                      calculationText = `${formatCurrency(item.plan.price)}/md × 6 × ${item.quantity}`;
                    }
                    return (
                      <div key={idx} className="step-item">
                        <span className="step-item-label">{item.plan.name} ({item.quantity}x):</span>
                        <span className="step-item-value">{calculationText} = {formatCurrency(itemTotal)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Trin 2: Familie-rabat */}
            {ourOfferTotals.telenorDiscount > 0 && (
              <div className="calculation-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <div className="step-label">Telenor familie-rabat:</div>
                  <div className="step-explanation">
                    {formatCurrency(ourOfferTotals.telenorDiscount)}/md × 6 = {formatCurrency(ourOfferTotals.telenorDiscount * 6)}
                  </div>
                </div>
              </div>
            )}

            {/* Trin 3: Streaming tillæg */}
            {notIncludedStreamingCost > 0 && (
              <div className="calculation-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <div className="step-label">Streaming tillæg:</div>
                  <div className="step-explanation">
                    {formatCurrency(notIncludedStreamingCost)}/md × 6 = {formatCurrency(notIncludedStreamingCost * 6)}
                  </div>
                </div>
              </div>
            )}

            {/* Trin 4: Kontant rabat */}
            {cashDiscount > 0 && (
              <div className="calculation-step discount">
                <div className="step-number">4</div>
                <div className="step-content">
                  <div className="step-label">Kontant rabat:</div>
                  <div className="step-explanation text-success">
                    -{formatCurrency(cashDiscount)}
                  </div>
                </div>
              </div>
            )}

            {/* Trin 5: Engangsbetalinger */}
            {(originalItemPrice > 0 || ourOfferTotals.setupFee > 0) && (
              <div className="calculation-step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <div className="step-label">Engangsbetalinger:</div>
                  <div className="step-items">
                    {originalItemPrice > 0 && (
                      <div className="step-item">
                        <span className="step-item-label">Varens pris:</span>
                        <span className="step-item-value">{formatCurrency(originalItemPrice)}</span>
                      </div>
                    )}
                    {ourOfferTotals.setupFee > 0 && (
                      <div className="step-item">
                        <span className="step-item-label">Oprettelsesgebyr:</span>
                        <span className="step-item-value">
                          {cartItems.reduce((sum, item) => sum + item.quantity, 0)} × {formatCurrency(99)} = {formatCurrency(ourOfferTotals.setupFee)}
                        </span>
                      </div>
                    )}
                    {freeSetup && ourOfferTotals.setupFeeDiscount > 0 && (
                      <div className="step-item discount">
                        <span className="step-item-label">Gratis oprettelse:</span>
                        <span className="step-item-value text-success">-{formatCurrency(ourOfferTotals.setupFeeDiscount)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="calculation-total">
              <div className="total-label">Total (6 måneder):</div>
              <div className="total-value">{formatCurrency(ourOfferTotals.sixMonth)}</div>
            </div>
          </div>

          {/* Besparelse beregning */}
          <div className="calculation-section">
            <div className="calculation-subtitle">Besparelse - beregning:</div>
            <div className="savings-calculation">
              <div className="savings-line">
                <span>Kundens total (6 måneder):</span>
                <span>{formatCurrency(customerTotals.sixMonth)}</span>
              </div>
              <div className="savings-line">
                <span>Vores total (6 måneder):</span>
                <span>{formatCurrency(ourOfferTotals.sixMonth)}</span>
              </div>
              <div className="savings-line total">
                <span>Besparelse:</span>
                <span className={isPositiveSavings ? 'text-success' : 'text-danger'}>
                  {formatCurrency(savings)}
                  {isPositiveSavings ? ' (kunden sparer)' : ' (mersalg)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="divider"></div>

      {/* Diskret indtjening info i bunden - kun synlig når F8 er trykket */}
      {showEarnings && totalEarnings > 0 && (
        <div className="earnings-footer">
          <div className="earnings-footer-content">
            <span className="earnings-label">Indtjening:</span>
            <span className="earnings-value">{formatCurrency(totalEarnings)}</span>
            {cashDiscount > 0 && (
              <>
                <span className="earnings-separator">|</span>
                <span className="earnings-label">Rabat:</span>
                <span className="earnings-value text-success">-{formatCurrency(cashDiscount)}</span>
                <span className="earnings-separator">|</span>
                <span className="earnings-label">Netto:</span>
                <span className="earnings-value font-semibold">{formatCurrency(totalEarnings - cashDiscount)}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Besparelse */}
      <div 
        className={`savings-banner ${isPositiveSavings ? 'positive' : 'negative'}`}
      >
        <div className="savings-label">
          {isPositiveSavings ? (
            <>
              <Icon name="checkCircle" size={20} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              {COPY.labels.savings}
            </>
          ) : (
            <>
              <Icon name="warning" size={20} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              {COPY.labels.mersalg}
            </>
          )}
        </div>
        <div 
          className={`savings-amount ${isPositiveSavings ? 'animate-pulse-glow' : ''}`}
        >
          <NumberDisplay 
            value={Math.abs(savings)} 
            size="5xl" 
            color={isPositiveSavings ? 'success' : 'danger'}
            prefix={isPositiveSavings ? '' : '-'}
          />
        </div>
        <div className="savings-subtitle">
          {COPY.labels.over6Months}
        </div>
        {isPositiveSavings && savings > 0 && (
          <div className="savings-monthly">
            <span className="savings-monthly-label">Besparelse pr. måned:</span>
            <NumberDisplay 
              value={Math.abs(savings) / 6} 
              size="xl" 
              color="success"
              suffix="/md."
            />
          </div>
        )}
      </div>

      <style>{`
        .comparison-panel {
          padding: var(--spacing-2xl);
        }

        .section-header {
          margin-bottom: var(--spacing-2xl);
        }

        .section-header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--spacing-md);
        }

        .section-header h2 {
          margin: 0;
          margin-bottom: var(--spacing-xs);
        }

        .cash-discount-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          padding: 0;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
          flex-shrink: 0;
        }

        .cash-discount-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .cash-discount-toggle-btn:active {
          transform: translateY(0);
        }

        .cash-discount-toggle-icon {
          font-size: 1.25rem;
          line-height: 1;
          opacity: 0.6;
          transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
          display: block;
        }

        .cash-discount-toggle-icon.active {
          opacity: 1;
          filter: brightness(1.2);
        }

        .cash-discount-toggle-btn:hover .cash-discount-toggle-icon {
          opacity: 1;
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

        .cash-discount-info {
          margin-top: var(--spacing-md);
          padding: var(--spacing-md);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-md);
        }

        .free-setup-section {
          margin-bottom: var(--spacing-lg);
        }

        .free-setup-section .checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .free-setup-section .checkbox-wrapper:hover {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .free-setup-section .checkbox:checked + span {
          color: var(--color-success);
          font-weight: var(--font-semibold);
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-xs) 0;
          font-size: var(--font-sm);
        }

        .info-row.highlight {
          padding-top: var(--spacing-sm);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: var(--spacing-xs);
        }

        .info-label {
          color: var(--text-secondary);
        }

        .info-value {
          color: var(--text-primary);
          font-weight: var(--font-medium);
        }

        .earnings-footer {
          margin-top: var(--spacing-md);
          padding: var(--spacing-xs) var(--spacing-sm);
          background: rgba(255, 255, 255, 0.02);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-sm);
          opacity: 0.5;
          transition: opacity 0.2s ease;
        }

        .earnings-footer:hover {
          opacity: 0.8;
        }

        .earnings-footer-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          font-size: var(--font-xs);
          color: var(--text-muted);
          flex-wrap: wrap;
        }

        .earnings-label {
          font-weight: var(--font-normal);
        }

        .earnings-value {
          font-weight: var(--font-medium);
          color: var(--text-secondary);
        }

        .earnings-separator {
          opacity: 0.3;
          margin: 0 var(--spacing-xs);
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
          gap: var(--spacing-md);
          align-items: start;
        }

        .comparison-column {
          background: var(--glass-bg);
          border-radius: var(--radius-lg);
          border: 2px solid var(--glass-border);
          overflow: hidden;
          transition: all var(--transition-base);  /* Max 300ms */
        }

        .comparison-column:hover {
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px) translateZ(0);  /* Reduced motion, GPU accelerated */
          box-shadow: var(--shadow-xl), 0 0 20px rgba(255, 107, 26, 0.1);
        }

        .column-header {
          padding: var(--spacing-sm) var(--spacing-md);
          text-align: center;
          border-bottom: 2px solid var(--glass-border);
          position: relative;
        }

        .column-header h3 {
          margin: 0;
          font-size: var(--font-lg);
        }

        .earnings-tooltip {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          opacity: 0.4;
          transition: opacity 0.2s ease;
          cursor: help;
        }

        .earnings-tooltip:hover {
          opacity: 0.8;
        }

        .earnings-indicator {
          font-size: 0.875rem;
          display: block;
        }

        .column-content {
          padding: var(--spacing-md);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .amount-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2px 0;
        }

        .amount-row.discount {
          font-size: var(--font-sm);
        }

        .amount-row.total {
          padding-top: var(--spacing-xs);
          border-top: 1px solid var(--glass-border);
          margin-top: var(--spacing-xs);
        }

        .amount-row.six-month {
          padding: var(--spacing-sm);
          background: rgba(255, 107, 26, 0.1);
          border-radius: var(--radius-md);
          margin-top: var(--spacing-xs);
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
          padding-top: 2rem;
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
          padding: var(--spacing-3xl) var(--spacing-2xl);
          border-radius: var(--radius-xl);
          text-align: center;
          position: relative;
          overflow: hidden;
          transition: all var(--transition-base);
          margin: var(--spacing-xl) 0;
        }

        .savings-banner:hover {
          transform: scale(1.02) translateZ(0);
        }

        .savings-banner.positive {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(16, 185, 129, 0.15));
          border: 4px solid var(--color-success);
          box-shadow: 
            var(--glow-green), 
            0 10px 40px rgba(16, 185, 129, 0.4),
            0 0 60px rgba(16, 185, 129, 0.2);
          position: relative;
        }

        .savings-banner.positive::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, var(--color-success), rgba(16, 185, 129, 0.5));
          border-radius: var(--radius-xl);
          z-index: -1;
          opacity: 0.3;
          animation: savingsPulse 3s ease-in-out infinite;
        }

        @keyframes savingsPulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.02);
          }
        }

        .savings-banner.positive:hover {
          box-shadow: 
            var(--glow-green), 
            0 20px 60px rgba(16, 185, 129, 0.6),
            0 0 80px rgba(16, 185, 129, 0.3);
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
          font-size: var(--font-2xl);
          font-weight: var(--font-bold);
          margin-bottom: var(--spacing-md);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .savings-amount {
          font-size: var(--font-5xl);
          font-weight: var(--font-extrabold);
          line-height: 1;
          margin-bottom: var(--spacing-md);
        }

        @media (min-width: 901px) {
          .savings-amount {
            font-size: calc(var(--font-5xl) * 1.2);
          }
        }

        .savings-banner.positive .savings-amount {
          color: var(--color-success);
          text-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
        }

        .savings-banner.negative .savings-amount {
          color: var(--color-danger);
        }

        .savings-subtitle {
          font-size: var(--font-lg);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-md);
        }

        .savings-monthly {
          margin-top: var(--spacing-md);
          padding-top: var(--spacing-md);
          border-top: 1px solid rgba(16, 185, 129, 0.3);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
          align-items: center;
        }

        .savings-monthly-label {
          font-size: var(--font-sm);
          color: var(--text-secondary);
          font-weight: var(--font-medium);
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

        /* Beregningsdetaljer - for sælgerne */
        .calculation-details {
          margin: var(--spacing-lg) 0;
          padding: var(--spacing-lg);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-lg);
        }

        .calculation-details-title {
          margin: 0 0 var(--spacing-md) 0;
          font-size: var(--font-lg);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          display: flex;
          align-items: center;
        }

        .calculation-section {
          margin-bottom: var(--spacing-lg);
        }

        .calculation-section:last-child {
          margin-bottom: 0;
        }

        .calculation-subtitle {
          font-size: var(--font-sm);
          font-weight: var(--font-semibold);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-md);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .calculation-step {
          display: flex;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
          padding: var(--spacing-md);
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-md);
          border-left: 3px solid rgba(255, 255, 255, 0.2);
        }

        .calculation-step.discount {
          border-left-color: var(--color-success);
        }

        .step-number {
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          font-weight: var(--font-bold);
          font-size: var(--font-sm);
          flex-shrink: 0;
        }

        .step-content {
          flex: 1;
        }

        .step-label {
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
          font-size: var(--font-sm);
        }

        .step-explanation {
          color: var(--text-secondary);
          font-size: var(--font-sm);
          font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
        }

        .step-items {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .step-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-xs) 0;
          font-size: var(--font-sm);
        }

        .step-item.discount {
          color: var(--color-success);
        }

        .step-item-label {
          color: var(--text-secondary);
        }

        .step-item-value {
          color: var(--text-primary);
          font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
          font-weight: var(--font-medium);
        }

        .calculation-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md);
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-md);
          border-top: 2px solid rgba(255, 255, 255, 0.2);
          margin-top: var(--spacing-md);
        }

        .total-label {
          font-weight: var(--font-bold);
          font-size: var(--font-base);
          color: var(--text-primary);
        }

        .total-value {
          font-weight: var(--font-extrabold);
          font-size: var(--font-xl);
          color: var(--text-primary);
        }

        .savings-calculation {
          padding: var(--spacing-md);
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-md);
        }

        .savings-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-xs) 0;
          font-size: var(--font-sm);
          color: var(--text-secondary);
        }

        .savings-line.total {
          padding-top: var(--spacing-sm);
          margin-top: var(--spacing-xs);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-weight: var(--font-bold);
          font-size: var(--font-base);
          color: var(--text-primary);
        }

        @media (max-width: 900px) {
          .comparison-panel {
            padding: var(--spacing-lg);
          }

          .section-header-top {
            flex-direction: column;
            align-items: flex-start;
          }

          .cash-discount-toggle-btn {
            width: 2.25rem;
            height: 2.25rem;
          }

          .cash-discount-toggle-icon {
            font-size: 1.125rem;
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

          .calculation-details {
            padding: var(--spacing-md);
          }

          .calculation-step {
            flex-direction: column;
            gap: var(--spacing-sm);
          }

          .step-item {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-xs);
          }
        }
      `}</style>
    </div>
  );
}

export default React.memo(ComparisonPanel);


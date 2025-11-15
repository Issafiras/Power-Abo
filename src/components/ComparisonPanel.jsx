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
import { getStreamingTotal, streamingServices as staticStreaming } from '../data/streamingServices';
import Icon from './common/Icon';
import COPY from '../constants/copy';
import NumberDisplay from './common/NumberDisplay';

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
        
        <div className="empty-state">
          <Icon name="chart" size={64} className="empty-state-icon opacity-30" aria-hidden="true" />
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
              <Icon name="chart" size={24} className="icon-inline icon-spacing-md" />
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
                <Icon name="wallet" size={20} className="icon-inline icon-spacing-sm" />
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
                  <Icon name="lock" size={16} className="icon-inline icon-spacing-xs" />
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
                  <Icon name="refresh" size={16} className="icon-inline icon-spacing-xs" />
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

      {/* Detaljeret side-ved-side sammenligning */}
      {/* Get streaming service names for display */}
      {(() => {
        const getStreamingServiceName = (serviceId) => {
          const service = staticStreaming.find(s => s.id === serviceId);
          return service ? service.name : serviceId;
        };

        // Calculate savings percentage
        const savingsPercentage = customerTotals.sixMonth > 0 
          ? ((savings / customerTotals.sixMonth) * 100).toFixed(1)
          : 0;

        return (
          <div className="detailed-comparison">
            {/* Top summary bar */}
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

            <div className="comparison-grid">
              {/* KUNDENS SITUATION */}
              <div className="comparison-column customer-column">
                <div className="column-header">
                  <div className="column-icon-wrapper customer-icon">
                    <Icon name="user" size={28} className="column-icon" />
                  </div>
                  <h3>Kundens situation</h3>
                  <p className="column-subtitle">Hvad kunden betaler i dag</p>
                  <div className="column-badge customer-badge">
                    <Icon name="trendingDown" size={16} />
                    <span>Nuværende udgift</span>
                  </div>
                </div>

                <div className="comparison-content">
                  {/* Mobilabonnementer */}
                  {customerMobileCost > 0 && (
        <div className="comparison-item">
                      <div className="item-header">
                        <Icon name="smartphone" size={18} className="item-icon" />
                        <span className="item-title">Mobilabonnementer</span>
                      </div>
                      <div className="item-details">
                        <div className="item-line">
                          <span className="item-label">{numberOfLines} {numberOfLines === 1 ? 'abonnement' : 'abonnementer'}</span>
                          <span className="item-value">{formatCurrency(customerMobileCost)}/md.</span>
                        </div>
                        <div className="item-total">
                          <span className="item-label">I 6 måneder:</span>
                          <span className="item-value">{formatCurrency(customerMobileCost * 6)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Streaming-tjenester */}
                  {streamingCost > 0 && (
                    <div className="comparison-item">
                      <div className="item-header">
                        <Icon name="tv" size={18} className="item-icon" />
                        <span className="item-title">Streaming-tjenester</span>
                      </div>
                      <div className="item-details">
                        <div className="item-line">
                          <span className="item-label">{selectedStreaming.length} {selectedStreaming.length === 1 ? 'tjeneste' : 'tjenester'}</span>
                          <span className="item-value">{formatCurrency(streamingCost)}/md.</span>
                        </div>
                        {selectedStreaming.length > 0 && (
                          <div className="item-services">
                            {selectedStreaming.map(serviceId => (
                              <span key={serviceId} className="service-badge">
                                {getStreamingServiceName(serviceId)}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="item-total">
                          <span className="item-label">I 6 måneder:</span>
                          <span className="item-value">{formatCurrency(streamingCost * 6)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vare (hvis relevant) */}
                  {originalItemPrice > 0 && (
                    <div className="comparison-item">
                      <div className="item-header">
                        <Icon name="shoppingBag" size={18} className="item-icon" />
                        <span className="item-title">Vare/Produkt</span>
                      </div>
                      <div className="item-details">
                        <div className="item-line">
                          <span className="item-label">Engangsbetaling</span>
                          <span className="item-value">{formatCurrency(originalItemPrice)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Total for kunden */}
                  <div className="comparison-total customer-total">
                    <div className="total-background"></div>
                    <div className="total-content">
                      <div className="total-header">
                        <Icon name="calculator" size={22} className="total-icon" />
                        <span className="total-title">Kundens total</span>
                      </div>
                      <div className="total-value-large">
          <NumberDisplay value={customerTotals.sixMonth} size="3xl" color="orange" />
        </div>
                      <div className="total-breakdown">
                        <div className="breakdown-item">
                          <span className="breakdown-label">Pr. måned:</span>
                          <span className="breakdown-value">{formatCurrency(customerTotals.sixMonth / 6)}</span>
                        </div>
                      </div>
                      <div className="total-period">over 6 måneder</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* VORES TILBUD */}
              <div className="comparison-column offer-column">
                <div className="column-header">
                  <div className="column-icon-wrapper offer-icon">
                    <Icon name="gift" size={28} className="column-icon" />
                  </div>
                  <h3>Vores tilbud</h3>
                  <p className="column-subtitle">Hvad vi kan tilbyde</p>
                  <div className="column-badge offer-badge">
                    <Icon name="checkCircle" size={16} />
                    <span>Bedre værdi</span>
                  </div>
                </div>

                <div className="comparison-content">
                  {/* Abonnementer */}
                  {cartItems.length > 0 && (
        <div className="comparison-item">
                      <div className="item-header">
                        <Icon name="smartphone" size={18} className="item-icon" />
                        <span className="item-title">Abonnementer</span>
        </div>
                      <div className="item-details">
                        {cartItems.map((item, idx) => {
                          const itemSixMonth = calculateSixMonthPrice(item.plan, item.quantity);
                          const itemMonthly = calculateMonthlyPrice(item.plan, item.quantity);
                          
                          // Calculate CBB Mix cost if enabled
                          let cbbMixCost = 0;
                          if (item.plan.cbbMixAvailable && item.cbbMixEnabled && item.cbbMixCount) {
                            const mixPrice = calculateCBBMixPrice(item.plan, item.cbbMixCount);
                            cbbMixCost = mixPrice * item.quantity * 6; // 6 months
                          }

                          return (
                            <div key={idx} className="item-plan">
                              <div className="item-line">
                                <span className="item-label">
                                  {item.plan.name}
                                  {item.quantity > 1 && ` × ${item.quantity}`}
                                  {item.plan.provider && (
                                    <span className="provider-badge">{item.plan.provider.toUpperCase()}</span>
                                  )}
                                </span>
                                <span className="item-value">{formatCurrency(itemMonthly)}/md.</span>
      </div>
                              {item.plan.introPrice && item.plan.introMonths && (
                                <div className="item-intro">
                                  {formatCurrency(item.plan.introPrice)}/md. i {item.plan.introMonths} {item.plan.introMonths === 1 ? 'måned' : 'måneder'}, derefter {formatCurrency(item.plan.price)}/md.
                                </div>
                              )}
                              {cbbMixCost > 0 && (
                                <div className="item-cbb-mix">
                                  + CBB MIX ({item.cbbMixCount} tjenester): {formatCurrency(cbbMixCost / 6)}/md.
                                </div>
                              )}
                              <div className="item-total">
                                <span className="item-label">I 6 måneder:</span>
                                <span className="item-value">{formatCurrency(itemSixMonth + cbbMixCost)}</span>
                              </div>
                            </div>
                          );
                        })}
                        {ourOfferTotals.telenorDiscount > 0 && (
                          <div className="item-discount">
                            <Icon name="users" size={16} className="discount-icon" />
                            <span className="discount-text">Familie-rabat: -{formatCurrency(ourOfferTotals.telenorDiscount)}/md.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Streaming inkluderet */}
                  {streamingCoverage.included.length > 0 && (
                    <div className="comparison-item streaming-included">
                      <div className="item-header">
                        <Icon name="checkCircle" size={18} className="item-icon success" />
                        <span className="item-title">Streaming inkluderet</span>
                      </div>
                      <div className="item-details">
                        <div className="item-line">
                          <span className="item-label">{streamingCoverage.included.length} {streamingCoverage.included.length === 1 ? 'tjeneste inkluderet' : 'tjenester inkluderet'}</span>
                          <span className="item-value text-success">Gratis</span>
                        </div>
                        <div className="item-services">
                          {streamingCoverage.included.map(serviceId => (
                            <span key={serviceId} className="service-badge success">
                              {getStreamingServiceName(serviceId)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Streaming tillæg */}
                  {notIncludedStreamingCost > 0 && (
                    <div className="comparison-item">
                      <div className="item-header">
                        <Icon name="tv" size={18} className="item-icon" />
                        <span className="item-title">Streaming tillæg</span>
                      </div>
                      <div className="item-details">
                        <div className="item-line">
                          <span className="item-label">{streamingCoverage.notIncluded.length} {streamingCoverage.notIncluded.length === 1 ? 'tjeneste' : 'tjenester'}</span>
                          <span className="item-value">{formatCurrency(notIncludedStreamingCost)}/md.</span>
                        </div>
                        {streamingCoverage.notIncluded.length > 0 && (
                          <div className="item-services">
                            {streamingCoverage.notIncluded.map(serviceId => (
                              <span key={serviceId} className="service-badge">
                                {getStreamingServiceName(serviceId)}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="item-total">
                          <span className="item-label">I 6 måneder:</span>
                          <span className="item-value">{formatCurrency(notIncludedStreamingCost * 6)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vare (samme som kunden) */}
                  {originalItemPrice > 0 && (
                    <div className="comparison-item">
                      <div className="item-header">
                        <Icon name="shoppingBag" size={18} className="item-icon" />
                        <span className="item-title">Vare/Produkt</span>
                      </div>
                      <div className="item-details">
                        <div className="item-line">
                          <span className="item-label">Engangsbetaling</span>
                          <span className="item-value">{formatCurrency(originalItemPrice)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Oprettelsesgebyr */}
                  {ourOfferTotals.setupFee > 0 && !freeSetup && (
                    <div className="comparison-item">
                      <div className="item-header">
                        <Icon name="settings" size={18} className="item-icon" />
                        <span className="item-title">Oprettelsesgebyr</span>
                      </div>
                      <div className="item-details">
                        <div className="item-line">
                          <span className="item-label">
                            {cartItems.reduce((sum, item) => sum + item.quantity, 0)} {cartItems.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'abonnement' : 'abonnementer'}
                          </span>
                          <span className="item-value">{formatCurrency(ourOfferTotals.setupFee)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gratis oprettelse */}
                  {freeSetup && ourOfferTotals.setupFeeDiscount > 0 && (
                    <div className="comparison-item discount-item">
                      <div className="item-header">
                        <Icon name="checkCircle" size={18} className="item-icon success" />
                        <span className="item-title">Gratis oprettelse</span>
                      </div>
                      <div className="item-details">
                        <div className="item-line">
                          <span className="item-label">Rabat</span>
                          <span className="item-value text-success">-{formatCurrency(ourOfferTotals.setupFeeDiscount)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Kontant rabat */}
                  {cashDiscount > 0 && (
                    <div className="comparison-item discount-item">
                      <div className="item-header">
                        <Icon name="wallet" size={18} className="item-icon success" />
                        <span className="item-title">Kontant rabat</span>
                      </div>
                      <div className="item-details">
                        <div className="item-line">
                          <span className="item-label">Rabat</span>
                          <span className="item-value text-success">-{formatCurrency(cashDiscount)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Total for vores tilbud */}
                  <div className="comparison-total offer-total">
                    <div className="total-background"></div>
                    <div className="total-content">
                      <div className="total-header">
                        <Icon name="gift" size={22} className="total-icon" />
                        <span className="total-title">Vores total</span>
                      </div>
                      <div className="total-value-large">
                        <NumberDisplay value={ourOfferTotals.sixMonth} size="3xl" color="success" />
                      </div>
                      <div className="total-breakdown">
                        <div className="breakdown-item">
                          <span className="breakdown-label">Pr. måned:</span>
                          <span className="breakdown-value">{formatCurrency(ourOfferTotals.sixMonth / 6)}</span>
                        </div>
                        {savings > 0 && (
                          <div className="breakdown-item savings-breakdown">
                            <Icon name="trendingDown" size={14} />
                            <span className="breakdown-label">Besparelse:</span>
                            <span className="breakdown-value success">{formatCurrency(savings / 6)}/md.</span>
                          </div>
                        )}
                      </div>
                      <div className="total-period">over 6 måneder</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Detaljerede beregningsvisninger for sælgerne (kun synlig når F8 er trykket) */}
      {showEarnings && (
        <div className="calculation-details">
          <h4 className="calculation-details-title">
            <Icon name="calculator" size={18} className="icon-inline icon-spacing-sm" />
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
              <Icon name="checkCircle" size={20} className="icon-inline icon-spacing-sm" />
              {COPY.labels.savings}
            </>
          ) : (
            <>
              <Icon name="warning" size={20} className="icon-inline icon-spacing-sm" />
              {COPY.labels.mersalg}
            </>
          )}
        </div>
        <div 
          className="savings-amount"
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

        /* Detaljeret sammenligning */
        .detailed-comparison {
          margin: var(--spacing-2xl) 0;
        }

        /* Top summary bar */
        .comparison-summary-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--spacing-xl);
          padding: var(--spacing-2xl);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
          border-radius: var(--radius-xl);
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: var(--spacing-2xl);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .summary-item {
          flex: 1;
          text-align: center;
          padding: var(--spacing-lg);
          border-radius: var(--radius-lg);
          transition: all 0.3s ease;
        }

        .summary-item:hover {
          transform: translateY(-2px);
        }

        .customer-summary {
          background: rgba(255, 109, 31, 0.1);
          border: 2px solid rgba(255, 109, 31, 0.3);
        }

        .offer-summary {
          background: rgba(16, 185, 129, 0.1);
          border: 2px solid rgba(16, 185, 129, 0.3);
        }

        .summary-label {
          font-size: var(--font-sm);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
          font-weight: var(--font-semibold);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .summary-value {
          margin: var(--spacing-sm) 0;
        }

        .summary-period {
          font-size: var(--font-xs);
          color: var(--text-tertiary);
          margin-top: var(--spacing-xs);
        }

        .summary-monthly {
          margin-top: var(--spacing-md);
          padding-top: var(--spacing-md);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .monthly-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-xs);
          font-size: var(--font-xs);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
          font-weight: var(--font-medium);
        }

        .monthly-value {
          font-weight: var(--font-bold);
        }

        .summary-vs {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-md);
          padding: 0 var(--spacing-lg);
          min-width: 200px;
        }

        .vs-arrow-wrapper {
          padding: var(--spacing-md);
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .vs-arrow {
          color: var(--text-primary);
          opacity: 0.8;
        }

        .vs-savings {
          text-align: center;
        }

        .vs-savings-label {
          font-size: var(--font-xs);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: var(--font-bold);
        }

        .vs-savings-amount {
          margin: var(--spacing-xs) 0;
        }

        .vs-savings-percentage {
          font-size: var(--font-lg);
          font-weight: var(--font-bold);
          color: var(--color-success);
          margin-top: var(--spacing-xs);
          padding: var(--spacing-xs) var(--spacing-sm);
          background: rgba(16, 185, 129, 0.15);
          border-radius: var(--radius-md);
        }

        .vs-savings-amount.negative .vs-savings-percentage {
          color: var(--color-danger);
          background: rgba(239, 68, 68, 0.15);
        }

        .vs-monthly-savings {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-xs);
          margin-top: var(--spacing-sm);
          padding: var(--spacing-xs) var(--spacing-sm);
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-md);
          font-size: var(--font-sm);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
        }

        .vs-monthly-savings span {
          color: var(--color-success);
        }

        .vs-savings-amount.negative + .vs-monthly-savings span {
          color: var(--color-danger);
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-2xl);
          align-items: start;
        }

        .comparison-column {
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-xl);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: var(--spacing-2xl);
          transition: all 0.3s ease;
        }

        .comparison-column:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }

        .customer-column {
          border-left: 3px solid var(--color-orange);
        }

        .offer-column {
          border-left: 3px solid var(--color-success);
        }

        .column-header {
          text-align: center;
          margin-bottom: var(--spacing-2xl);
          padding-bottom: var(--spacing-xl);
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          position: relative;
        }

        .column-icon-wrapper {
          width: 64px;
          height: 64px;
          margin: 0 auto var(--spacing-md) auto;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all 0.3s ease;
        }

        .customer-icon {
          background: linear-gradient(135deg, rgba(255, 109, 31, 0.2), rgba(255, 109, 31, 0.1));
          border: 3px solid rgba(255, 109, 31, 0.4);
        }

        .offer-icon {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
          border: 3px solid rgba(16, 185, 129, 0.4);
        }

        .comparison-column:hover .column-icon-wrapper {
          transform: scale(1.1);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .column-icon {
          opacity: 0.9;
        }

        .column-header h3 {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: var(--font-2xl);
          font-weight: var(--font-bold);
        }

        .column-subtitle {
          margin: 0 0 var(--spacing-sm) 0;
          color: var(--text-secondary);
          font-size: var(--font-sm);
        }

        .column-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-xs) var(--spacing-md);
          border-radius: var(--radius-full);
          font-size: var(--font-xs);
          font-weight: var(--font-semibold);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: var(--spacing-xs);
        }

        .customer-badge {
          background: rgba(255, 109, 31, 0.15);
          border: 1px solid rgba(255, 109, 31, 0.3);
          color: var(--color-orange);
        }

        .offer-badge {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: var(--color-success);
        }

        .comparison-content {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .comparison-item {
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .comparison-item.streaming-included {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.2);
        }

        .comparison-item.discount-item {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.2);
        }

        .item-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
          padding-bottom: var(--spacing-sm);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .item-icon {
          opacity: 0.8;
        }

        .item-icon.success {
          color: var(--color-success);
        }

        .item-title {
          font-weight: var(--font-semibold);
          font-size: var(--font-base);
          color: var(--text-primary);
        }

        .item-details {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .item-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--spacing-md);
        }

        .item-label {
          color: var(--text-secondary);
          font-size: var(--font-sm);
          flex: 1;
        }

        .item-value {
          color: var(--text-primary);
          font-weight: var(--font-semibold);
          font-size: var(--font-base);
          text-align: right;
        }

        .item-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--spacing-xs);
          padding-top: var(--spacing-sm);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-weight: var(--font-semibold);
        }

        .item-services {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
          margin-top: var(--spacing-xs);
        }

        .service-badge {
          display: inline-block;
          padding: var(--spacing-xs) var(--spacing-sm);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-sm);
          font-size: var(--font-xs);
          color: var(--text-secondary);
        }

        .service-badge.success {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.3);
          color: var(--color-success);
        }

        .item-plan {
          margin-bottom: var(--spacing-md);
          padding-bottom: var(--spacing-md);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .item-plan:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }

        .provider-badge {
          display: inline-block;
          margin-left: var(--spacing-xs);
          padding: 2px var(--spacing-xs);
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-xs);
          font-size: var(--font-xs);
          font-weight: var(--font-bold);
          text-transform: uppercase;
        }

        .item-intro {
          font-size: var(--font-xs);
          color: var(--text-secondary);
          margin-top: var(--spacing-xs);
          font-style: italic;
        }

        .item-cbb-mix {
          font-size: var(--font-xs);
          color: var(--text-secondary);
          margin-top: var(--spacing-xs);
        }

        .item-discount {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-sm);
          background: rgba(16, 185, 129, 0.1);
          border-radius: var(--radius-md);
          margin-top: var(--spacing-sm);
        }

        .discount-icon {
          color: var(--color-success);
        }

        .discount-text {
          color: var(--color-success);
          font-weight: var(--font-semibold);
          font-size: var(--font-sm);
        }

        .comparison-total {
          margin-top: var(--spacing-xl);
          position: relative;
          border-radius: var(--radius-xl);
          overflow: hidden;
          text-align: center;
        }

        .total-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.1;
          transition: opacity 0.3s ease;
        }

        .customer-total .total-background {
          background: linear-gradient(135deg, rgba(255, 109, 31, 0.3), rgba(255, 109, 31, 0.1));
          border: 3px solid rgba(255, 109, 31, 0.4);
        }

        .offer-total .total-background {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.1));
          border: 3px solid rgba(16, 185, 129, 0.4);
        }

        .comparison-total:hover .total-background {
          opacity: 0.15;
        }

        .total-content {
          position: relative;
          z-index: 1;
          padding: var(--spacing-2xl);
        }

        .total-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-lg);
        }

        .total-icon {
          opacity: 0.9;
        }

        .total-title {
          font-weight: var(--font-bold);
          font-size: var(--font-lg);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .total-value-large {
          margin: var(--spacing-lg) 0;
        }

        .total-breakdown {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          margin: var(--spacing-lg) 0;
          padding: var(--spacing-md);
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-md);
        }

        .breakdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--spacing-md);
          font-size: var(--font-sm);
        }

        .breakdown-item.savings-breakdown {
          padding-top: var(--spacing-sm);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: var(--spacing-xs);
        }

        .breakdown-item.savings-breakdown .breakdown-label {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          color: var(--color-success);
        }

        .breakdown-label {
          color: var(--text-secondary);
        }

        .breakdown-value {
          font-weight: var(--font-semibold);
          color: var(--text-primary);
        }

        .breakdown-value.success {
          color: var(--color-success);
        }

        .total-period {
          color: var(--text-secondary);
          font-size: var(--font-sm);
          margin-top: var(--spacing-sm);
          font-weight: var(--font-medium);
        }

        /* Simple comparison (fallback) */
        .simple-comparison {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xl);
          margin: var(--spacing-xl) 0;
        }

        .comparison-label {
          font-size: var(--font-sm);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-md);
          font-weight: var(--font-medium);
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
            0 10px 40px rgba(16, 185, 129, 0.4),
            0 0 60px rgba(16, 185, 129, 0.2);
          position: relative;
        }

        /* Fjernet pulse animation - Performance First */
        .savings-banner.positive::before {
          display: none; /* Fjernet animation layer */
        }

        .savings-banner.positive:hover {
          box-shadow: 
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

          .detailed-comparison {
            margin: var(--spacing-lg) 0;
          }

          .comparison-summary-bar {
            flex-direction: column;
            gap: var(--spacing-lg);
            padding: var(--spacing-lg);
          }

          .summary-vs {
            padding: var(--spacing-md) 0;
            min-width: 100%;
          }

          .vs-arrow-wrapper {
            transform: rotate(90deg);
          }

          .comparison-grid {
            grid-template-columns: 1fr;
            gap: var(--spacing-xl);
          }

          .comparison-column {
            padding: var(--spacing-lg);
          }

          .column-header h3 {
            font-size: var(--font-xl);
          }

          .comparison-item {
            padding: var(--spacing-md);
          }

          .comparison-total {
            padding: var(--spacing-lg);
          }

          .item-services {
            gap: var(--spacing-xs);
          }

          .service-badge {
            font-size: 10px;
            padding: 3px var(--spacing-xs);
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


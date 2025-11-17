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
  autoAdjustCashDiscount,
  calculateMonthlyBreakdown
} from '../../utils/calculations';
import { getStreamingTotal, getServiceById, streamingServices as staticStreaming } from '../../data/streamingServices';
import Icon from '../../components/common/Icon';
import COPY from '../../constants/copy';
import NumberDisplay from '../../components/common/NumberDisplay';

// Overview Tab Component
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

// Price Breakdown Tab Component
function PriceBreakdownTab({ cartItems, customerTotals, ourOfferTotals, streamingCost, notIncludedStreamingCost, cashDiscount, originalItemPrice }) {
  const savings = useMemo(() => 
    calculateSavings(customerTotals.sixMonth, ourOfferTotals.sixMonth),
    [customerTotals.sixMonth, ourOfferTotals.sixMonth]
  );
  const telenorDiscount = useMemo(() => calculateTelenorFamilyDiscount(cartItems), [cartItems]);
  
  // Beregn måned-for-måned opdeling
  const monthlyBreakdown = useMemo(() => {
    const months = [];
    for (let month = 1; month <= 6; month++) {
      let customerMonth = customerTotals.monthly;
      let ourMonth = ourOfferTotals.monthly;
      
      // Hvis der er intro-priser, juster for første måneder
      cartItems.forEach(item => {
        if (item.plan.introPrice && item.plan.introMonths && month <= item.plan.introMonths) {
          const introPrice = item.plan.introPrice * item.quantity;
          const normalPrice = item.plan.price * item.quantity;
          ourMonth = ourMonth - (normalPrice - introPrice) / 6; // Juster gennemsnit
        }
      });
      
      months.push({ month, customer: customerMonth, ours: ourMonth });
    }
    return months;
  }, [cartItems, customerTotals, ourOfferTotals]);

  return (
    <div className="price-breakdown-tab">
      {/* Månedlig opdeling */}
      <div className="breakdown-section">
        <h3 className="breakdown-section-title">
          <Icon name="calendar" size={18} className="icon-inline icon-spacing-sm" />
          Månedlig opdeling
        </h3>
        
        <div className="breakdown-grid">
          <div className="breakdown-column">
            <div className="breakdown-column-header">Kundens omkostninger</div>
            <div className="breakdown-row">
              <span className="breakdown-label">Mobil abonnement</span>
              <span className="breakdown-value">{formatCurrency(customerTotals.monthly - streamingCost)}/md.</span>
            </div>
            <div className="breakdown-row">
              <span className="breakdown-label">Streaming-tjenester</span>
              <span className="breakdown-value">{formatCurrency(streamingCost)}/md.</span>
            </div>
            <div className="breakdown-row breakdown-total">
              <span className="breakdown-label">Total pr. måned</span>
              <span className="breakdown-value">{formatCurrency(customerTotals.monthly)}/md.</span>
            </div>
          </div>

          <div className="breakdown-column">
            <div className="breakdown-column-header">Vores tilbud</div>
            <div className="breakdown-row">
              <span className="breakdown-label">Abonnementer</span>
              <span className="breakdown-value">{formatCurrency(ourOfferTotals.monthly - notIncludedStreamingCost)}/md.</span>
            </div>
            {notIncludedStreamingCost > 0 && (
              <div className="breakdown-row">
                <span className="breakdown-label">Streaming tillæg</span>
                <span className="breakdown-value">{formatCurrency(notIncludedStreamingCost)}/md.</span>
              </div>
            )}
            {telenorDiscount > 0 && (
              <div className="breakdown-row breakdown-discount">
                <span className="breakdown-label">Familie-rabat</span>
                <span className="breakdown-value text-success">-{formatCurrency(telenorDiscount)}/md.</span>
              </div>
            )}
            <div className="breakdown-row breakdown-total">
              <span className="breakdown-label">Total pr. måned</span>
              <span className="breakdown-value">{formatCurrency(ourOfferTotals.monthly)}/md.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6-måneders opgørelse */}
      <div className="breakdown-section">
        <h3 className="breakdown-section-title">
          <Icon name="clock" size={18} className="icon-inline icon-spacing-sm" />
          6-måneders opgørelse
        </h3>
        
        <div className="monthly-breakdown-table">
          <div className="monthly-breakdown-header">
            <div className="monthly-breakdown-cell">Måned</div>
            <div className="monthly-breakdown-cell">Kundens pris</div>
            <div className="monthly-breakdown-cell">Vores pris</div>
            <div className="monthly-breakdown-cell">Forskel</div>
          </div>
          {monthlyBreakdown.map(({ month, customer, ours }) => (
            <div key={month} className="monthly-breakdown-row">
              <div className="monthly-breakdown-cell">{month}</div>
              <div className="monthly-breakdown-cell">{formatCurrency(customer)}</div>
              <div className="monthly-breakdown-cell">{formatCurrency(ours)}</div>
              <div className={`monthly-breakdown-cell ${customer - ours > 0 ? 'text-success' : customer - ours < 0 ? 'text-danger' : ''}`}>
                {formatCurrency(customer - ours)}
              </div>
            </div>
          ))}
          <div className="monthly-breakdown-footer">
            <div className="monthly-breakdown-cell">Total 6 måneder</div>
            <div className="monthly-breakdown-cell">{formatCurrency(customerTotals.sixMonth)}</div>
            <div className="monthly-breakdown-cell">{formatCurrency(ourOfferTotals.sixMonth)}</div>
            <div className={`monthly-breakdown-cell ${savings > 0 ? 'text-success' : savings < 0 ? 'text-danger' : ''}`}>
              {formatCurrency(savings)}
            </div>
          </div>
        </div>

        {originalItemPrice > 0 && (
          <div className="breakdown-note">
            <Icon name="info" size={16} className="icon-inline icon-spacing-xs" />
            <span>Engangsbetaling på {formatCurrency(originalItemPrice)} er inkluderet i totalen</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Streaming Tab Component
function StreamingTab({ streamingCoverage, cartItems, selectedStreaming, notIncludedStreamingCost }) {
  const includedServices = useMemo(() => {
    return streamingCoverage.included.map(id => getServiceById(id)).filter(Boolean);
  }, [streamingCoverage.included]);

  const notIncludedServices = useMemo(() => {
    return streamingCoverage.notIncluded.map(id => getServiceById(id)).filter(Boolean);
  }, [streamingCoverage.notIncluded]);

  // Find CBB Mix detaljer
  const cbbMixDetails = useMemo(() => {
    const cbbMixItems = cartItems.filter(item => item.plan.cbbMixAvailable && item.cbbMixEnabled);
    if (cbbMixItems.length === 0) return null;

    let totalSlots = 0;
    cbbMixItems.forEach(item => {
      totalSlots += item.cbbMixCount * item.quantity;
    });

    const cbbMixServices = includedServices.filter((_, index) => {
      let planStreamingCount = 0;
      cartItems.forEach(item => {
        if (item.plan.streamingCount) planStreamingCount += item.plan.streamingCount * item.quantity;
      });
      return index >= planStreamingCount && index < planStreamingCount + totalSlots;
    });

    return { slots: totalSlots, services: cbbMixServices };
  }, [cartItems, includedServices]);

  return (
    <div className="streaming-tab">
      {/* Inkluderede tjenester */}
      <div className="streaming-section">
        <h3 className="streaming-section-title">
          <Icon name="checkCircle" size={18} className="icon-inline icon-spacing-sm" />
          Inkluderede tjenester ({includedServices.length})
        </h3>
        
        {includedServices.length === 0 ? (
          <div className="streaming-empty">
            <Icon name="info" size={24} className="icon-inline icon-spacing-sm" />
            <span>Ingen streaming-tjenester er inkluderet i de valgte planer</span>
          </div>
        ) : (
          <div className="streaming-list">
            {includedServices.map((service, index) => {
              // Tjek om tjenesten kommer fra plan streamingCount
              let source = 'Plan';
              const planStreamingCount = cartItems.reduce((sum, item) => {
                return sum + (item.plan.streamingCount ? item.plan.streamingCount * item.quantity : 0);
              }, 0);
              
              if (index >= planStreamingCount) {
                source = 'CBB Mix';
              }

              return (
                <div key={service.id} className="streaming-item included">
                  <div className="streaming-item-logo">
                    {service.logo ? (
                      <img src={service.logo} alt={service.name} />
                    ) : (
                      <div className="streaming-item-logo-text" style={{ color: service.color, backgroundColor: service.bgColor }}>
                        {service.logoText || service.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="streaming-item-info">
                    <div className="streaming-item-name">{service.name}</div>
                    <div className="streaming-item-source">{source}</div>
                  </div>
                  <div className="streaming-item-price">
                    <span className="text-success">Inkluderet</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {cbbMixDetails && (
          <div className="cbb-mix-info">
            <Icon name="info" size={16} className="icon-inline icon-spacing-xs" />
            <span>CBB Mix inkluderer {cbbMixDetails.slots} {cbbMixDetails.slots === 1 ? 'tjeneste' : 'tjenester'} via CBB Mix abonnement</span>
          </div>
        )}
      </div>

      {/* Ikke-inkluderede tjenester */}
      {notIncludedServices.length > 0 && (
        <div className="streaming-section">
          <h3 className="streaming-section-title">
            <Icon name="alertCircle" size={18} className="icon-inline icon-spacing-sm" />
            Ikke-inkluderede tjenester ({notIncludedServices.length})
          </h3>
          
          <div className="streaming-list">
            {notIncludedServices.map(service => (
              <div key={service.id} className="streaming-item not-included">
                <div className="streaming-item-logo">
                  {service.logo ? (
                    <img src={service.logo} alt={service.name} />
                  ) : (
                    <div className="streaming-item-logo-text" style={{ color: service.color, backgroundColor: service.bgColor }}>
                      {service.logoText || service.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="streaming-item-info">
                  <div className="streaming-item-name">{service.name}</div>
                  <div className="streaming-item-category">{service.category}</div>
                </div>
                <div className="streaming-item-price">
                  {formatCurrency(service.price)}/md.
                </div>
              </div>
            ))}
          </div>

          <div className="streaming-total">
            <div className="streaming-total-label">Total for ikke-inkluderede:</div>
            <div className="streaming-total-value">{formatCurrency(notIncludedStreamingCost)}/md.</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Specifications Tab Component
function SpecificationsTab({ cartItems }) {
  const totalLines = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const allFeatures = useMemo(() => {
    const featuresSet = new Set();
    cartItems.forEach(item => {
      if (item.plan.features) {
        item.plan.features.forEach(feature => featuresSet.add(feature));
      }
    });
    return Array.from(featuresSet);
  }, [cartItems]);

  return (
    <div className="specifications-tab">
      {/* Plan detaljer */}
      <div className="specs-section">
        <h3 className="specs-section-title">
          <Icon name="list" size={18} className="icon-inline icon-spacing-sm" />
          Plan detaljer
        </h3>
        
        <div className="specs-list">
          {cartItems.map((item, index) => (
            <div key={index} className="spec-item">
              <div className="spec-header">
                {item.plan.logo && (
                  <img src={item.plan.logo} alt={item.plan.provider} className="spec-logo" />
                )}
                <div className="spec-title">
                  <div className="spec-name">{item.plan.name}</div>
                  <div className="spec-provider">{item.plan.provider}</div>
                </div>
                <div className="spec-quantity">
                  <Icon name="smartphone" size={16} className="icon-inline icon-spacing-xs" />
                  <span>{item.quantity} {item.quantity === 1 ? 'linje' : 'linjer'}</span>
                </div>
              </div>
              
              <div className="spec-details">
                <div className="spec-detail-row">
                  <span className="spec-detail-label">Data:</span>
                  <span className="spec-detail-value">{item.plan.data}</span>
                </div>
                <div className="spec-detail-row">
                  <span className="spec-detail-label">Månedlig pris:</span>
                  <span className="spec-detail-value">
                    {item.plan.introPrice && item.plan.introMonths ? (
                      <>
                        {formatCurrency(item.plan.introPrice)} i {item.plan.introMonths} {item.plan.introMonths === 1 ? 'måned' : 'måneder'}, 
                        derefter {formatCurrency(item.plan.price)}
                      </>
                    ) : (
                      formatCurrency(item.plan.price)
                    )}
                    /md.
                  </span>
                </div>
                {item.plan.cbbMixAvailable && item.cbbMixEnabled && (
                  <div className="spec-detail-row">
                    <span className="spec-detail-label">CBB Mix:</span>
                    <span className="spec-detail-value">
                      {item.cbbMixCount} {item.cbbMixCount === 1 ? 'tjeneste' : 'tjenester'} 
                      ({formatCurrency(calculateCBBMixPrice(item.plan, item.cbbMixCount))}/md.)
                    </span>
                  </div>
                )}
              </div>

              {item.plan.features && item.plan.features.length > 0 && (
                <div className="spec-features">
                  {item.plan.features.map((feature, fIndex) => (
                    <span key={fIndex} className="spec-feature-tag">
                      <Icon name="check" size={12} className="icon-inline icon-spacing-xs" />
                      {feature}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Samlet oversigt */}
      <div className="specs-section">
        <h3 className="specs-section-title">
          <Icon name="barChart" size={18} className="icon-inline icon-spacing-sm" />
          Samlet oversigt
        </h3>
        
        <div className="specs-summary">
          <div className="specs-summary-item">
            <div className="specs-summary-label">Total antal linjer</div>
            <div className="specs-summary-value">{totalLines}</div>
          </div>
          {allFeatures.length > 0 && (
            <div className="specs-summary-item">
              <div className="specs-summary-label">Features</div>
              <div className="specs-summary-features">
                {allFeatures.map((feature, index) => (
                  <span key={index} className="specs-summary-feature">{feature}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
  onToggleCashDiscount
}) {
  const [showEarnings, setShowEarnings] = useState(false);
  const [activeTab, setActiveTab] = useState('oversigt');

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
      originalItemPrice
    ),
    [cartItems, notIncludedStreamingCost, originalItemPrice]
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
      originalItemPrice
    ),
    [cartItems, notIncludedStreamingCost, cashDiscount, originalItemPrice]
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
            padding: var(--spacing-lg);
          }

          .section-header {
            margin-bottom: var(--spacing-md);
          }

          .empty-state {
            padding: var(--spacing-xl);
            text-align: center;
          }

          .empty-state-icon {
            font-size: var(--font-4xl);
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

      {/* Tabs navigation */}
      <div className="comparison-tabs-wrapper">
        <div className="comparison-tabs">
          <button
            className={`comparison-tab ${activeTab === 'oversigt' ? 'comparison-tab-active' : ''}`}
            onClick={() => setActiveTab('oversigt')}
            aria-pressed={activeTab === 'oversigt'}
          >
            <Icon name="chart" size={16} className="tab-icon" />
            <span>Oversigt</span>
          </button>
          <button
            className={`comparison-tab ${activeTab === 'prisopdeling' ? 'comparison-tab-active' : ''}`}
            onClick={() => setActiveTab('prisopdeling')}
            aria-pressed={activeTab === 'prisopdeling'}
          >
            <Icon name="wallet" size={16} className="tab-icon" />
            <span>Prisopdeling</span>
          </button>
          <button
            className={`comparison-tab ${activeTab === 'streaming' ? 'comparison-tab-active' : ''}`}
            onClick={() => setActiveTab('streaming')}
            aria-pressed={activeTab === 'streaming'}
          >
            <Icon name="play" size={16} className="tab-icon" />
            <span>Streaming</span>
          </button>
          <button
            className={`comparison-tab ${activeTab === 'specifikationer' ? 'comparison-tab-active' : ''}`}
            onClick={() => setActiveTab('specifikationer')}
            aria-pressed={activeTab === 'specifikationer'}
          >
            <Icon name="info" size={16} className="tab-icon" />
            <span>Specifikationer</span>
          </button>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'oversigt' && (
        <OverviewTab
          customerTotals={customerTotals}
          ourOfferTotals={ourOfferTotals}
          savings={savings}
          isPositiveSavings={isPositiveSavings}
          streamingCoverage={streamingCoverage}
          cashDiscount={cashDiscount}
        />
      )}

      {activeTab === 'prisopdeling' && (
        <PriceBreakdownTab
          cartItems={cartItems}
          customerTotals={customerTotals}
          ourOfferTotals={ourOfferTotals}
          streamingCost={streamingCost}
          notIncludedStreamingCost={notIncludedStreamingCost}
          cashDiscount={cashDiscount}
          originalItemPrice={originalItemPrice}
        />
      )}

      {activeTab === 'streaming' && (
        <StreamingTab
          streamingCoverage={streamingCoverage}
          cartItems={cartItems}
          selectedStreaming={selectedStreaming}
          notIncludedStreamingCost={notIncludedStreamingCost}
        />
      )}

      {activeTab === 'specifikationer' && (
        <SpecificationsTab
          cartItems={cartItems}
        />
      )}


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

      {/* Besparelse - kun vis i Oversigt tab */}
      {activeTab === 'oversigt' && (
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
      )}

      <style>{`
        .comparison-panel {
          padding: var(--spacing-lg);
        }

        .section-header {
          margin-bottom: var(--spacing-md);
        }

        .section-header h2 {
          font-size: var(--font-2xl);
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

        .free-setup-info {
          margin-top: var(--spacing-md);
          padding: var(--spacing-md);
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: var(--radius-md);
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

        /* Tabs styling */
        .comparison-tabs-wrapper {
          margin: var(--spacing-xl) 0;
        }

        .comparison-tabs {
          display: flex;
          gap: var(--spacing-xs);
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-xl);
          padding: var(--spacing-xs);
          box-shadow: 
            0 2px 16px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .comparison-tab {
          flex: 1;
          background: transparent;
          border: none;
          border-radius: var(--radius-lg);
          padding: var(--spacing-md) var(--spacing-lg);
          color: var(--text-secondary);
          font-size: var(--font-sm);
          font-weight: var(--font-medium);
          cursor: pointer;
          transition: all var(--transition-base);
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
          letter-spacing: -0.01em;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
        }

        .comparison-tab:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }

        .comparison-tab-active {
          background: linear-gradient(135deg, #FF6D1F 0%, #FF8F57 100%);
          color: white;
          box-shadow: 
            0 4px 16px rgba(255, 109, 31, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.1) inset;
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-weight: var(--font-semibold);
        }

        .comparison-tab .tab-icon {
          font-size: 1rem;
        }

        /* Tab content styling */
        .price-breakdown-tab,
        .streaming-tab,
        .specifications-tab {
          margin: var(--spacing-xl) 0;
        }

        .breakdown-section,
        .streaming-section,
        .specs-section {
          margin-bottom: var(--spacing-2xl);
        }

        .breakdown-section:last-child,
        .streaming-section:last-child,
        .specs-section:last-child {
          margin-bottom: 0;
        }

        .breakdown-section-title,
        .streaming-section-title,
        .specs-section-title {
          font-size: var(--font-lg);
          font-weight: var(--font-semibold);
          margin: 0 0 var(--spacing-lg) 0;
          color: var(--text-primary);
          display: flex;
          align-items: center;
        }

        .breakdown-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-lg);
        }

        .breakdown-column {
          padding: var(--spacing-lg);
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .breakdown-column-header {
          font-size: var(--font-base);
          font-weight: var(--font-semibold);
          margin-bottom: var(--spacing-md);
          padding-bottom: var(--spacing-sm);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .breakdown-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-sm) 0;
          font-size: var(--font-sm);
        }

        .breakdown-row.breakdown-total {
          margin-top: var(--spacing-md);
          padding-top: var(--spacing-md);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-weight: var(--font-semibold);
        }

        .breakdown-row.breakdown-discount {
          color: var(--color-success);
        }

        .breakdown-label {
          color: var(--text-secondary);
        }

        .breakdown-value {
          color: var(--text-primary);
          font-weight: var(--font-medium);
        }

        .monthly-breakdown-table {
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .monthly-breakdown-header,
        .monthly-breakdown-row,
        .monthly-breakdown-footer {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
        }

        .monthly-breakdown-header {
          background: rgba(255, 255, 255, 0.05);
          font-weight: var(--font-semibold);
          font-size: var(--font-sm);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .monthly-breakdown-row {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .monthly-breakdown-row:last-of-type {
          border-bottom: none;
        }

        .monthly-breakdown-footer {
          background: rgba(255, 255, 255, 0.05);
          font-weight: var(--font-semibold);
          border-top: 2px solid rgba(255, 255, 255, 0.1);
          margin-top: var(--spacing-xs);
        }

        .monthly-breakdown-cell {
          font-size: var(--font-sm);
        }

        .breakdown-note {
          margin-top: var(--spacing-md);
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-md);
          font-size: var(--font-sm);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
        }

        .streaming-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .streaming-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .streaming-item.included {
          background: rgba(16, 185, 129, 0.08);
          border-color: rgba(16, 185, 129, 0.2);
        }

        .streaming-item-logo {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          border-radius: var(--radius-md);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .streaming-item-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .streaming-item-logo-text {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--font-xl);
          font-weight: var(--font-bold);
        }

        .streaming-item-info {
          flex: 1;
        }

        .streaming-item-name {
          font-size: var(--font-base);
          font-weight: var(--font-medium);
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .streaming-item-source,
        .streaming-item-category {
          font-size: var(--font-xs);
          color: var(--text-secondary);
        }

        .streaming-item-price {
          font-size: var(--font-base);
          font-weight: var(--font-semibold);
        }

        .streaming-empty {
          padding: var(--spacing-xl);
          text-align: center;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .streaming-total {
          margin-top: var(--spacing-lg);
          padding: var(--spacing-md);
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-lg);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: var(--font-semibold);
        }

        .cbb-mix-info {
          margin-top: var(--spacing-md);
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(59, 130, 246, 0.08);
          border-radius: var(--radius-md);
          font-size: var(--font-sm);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
        }

        .specs-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .spec-item {
          padding: var(--spacing-lg);
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .spec-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }

        .spec-logo {
          width: 40px;
          height: 40px;
          object-fit: contain;
        }

        .spec-title {
          flex: 1;
        }

        .spec-name {
          font-size: var(--font-base);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
        }

        .spec-provider {
          font-size: var(--font-xs);
          color: var(--text-secondary);
          text-transform: capitalize;
        }

        .spec-quantity {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--font-sm);
          color: var(--text-secondary);
        }

        .spec-details {
          margin-bottom: var(--spacing-md);
        }

        .spec-detail-row {
          display: flex;
          justify-content: space-between;
          padding: var(--spacing-xs) 0;
          font-size: var(--font-sm);
        }

        .spec-detail-label {
          color: var(--text-secondary);
        }

        .spec-detail-value {
          color: var(--text-primary);
          font-weight: var(--font-medium);
        }

        .spec-features {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
        }

        .spec-feature-tag {
          display: inline-flex;
          align-items: center;
          padding: var(--spacing-xs) var(--spacing-sm);
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-md);
          font-size: var(--font-xs);
          color: var(--text-secondary);
        }

        .specs-summary {
          padding: var(--spacing-lg);
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .specs-summary-item {
          margin-bottom: var(--spacing-md);
        }

        .specs-summary-item:last-child {
          margin-bottom: 0;
        }

        .specs-summary-label {
          font-size: var(--font-sm);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
        }

        .specs-summary-value {
          font-size: var(--font-xl);
          font-weight: var(--font-bold);
          color: var(--text-primary);
        }

        .specs-summary-features {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
        }

        .specs-summary-feature {
          padding: var(--spacing-xs) var(--spacing-sm);
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-md);
          font-size: var(--font-sm);
          color: var(--text-secondary);
        }

        /* Detaljeret sammenligning */
        .detailed-comparison {
          margin: var(--spacing-lg) 0;
        }

        /* Top summary bar */
        .comparison-summary-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--spacing-lg);
          padding: var(--spacing-lg);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
          border-radius: var(--radius-xl);
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: var(--spacing-lg);
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

        /* Kompakt highlight liste */
        .highlights-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          margin-top: var(--spacing-xl);
        }

        .highlight-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md) var(--spacing-lg);
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .highlight-item:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateX(4px);
        }

        .highlight-item.success {
          background: rgba(16, 185, 129, 0.08);
          border-color: rgba(16, 185, 129, 0.2);
        }

        .highlight-item.success:hover {
          background: rgba(16, 185, 129, 0.12);
        }

        .highlight-icon {
          color: var(--color-success);
          flex-shrink: 0;
        }

        .highlight-content {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--spacing-md);
        }

        .highlight-title {
          font-size: var(--font-sm);
          color: var(--text-secondary);
          font-weight: var(--font-medium);
        }

        .highlight-value {
          font-size: var(--font-base);
          font-weight: var(--font-semibold);
        }

        .savings-banner {
          padding: var(--spacing-xl) var(--spacing-lg);
          border-radius: var(--radius-xl);
          text-align: center;
          position: relative;
          overflow: hidden;
          transition: all var(--transition-base);
          margin: var(--spacing-lg) 0;
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
          .comparison-tabs {
            gap: var(--spacing-xs);
            padding: var(--spacing-xs);
          }

          .comparison-tab {
            padding: var(--spacing-sm) var(--spacing-md);
            font-size: var(--font-xs);
          }

          .breakdown-grid {
            grid-template-columns: 1fr;
          }

          .monthly-breakdown-header,
          .monthly-breakdown-row,
          .monthly-breakdown-footer {
            grid-template-columns: 1fr;
            gap: var(--spacing-xs);
          }

          .monthly-breakdown-cell {
            font-size: var(--font-xs);
          }
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

          .highlights-list {
            gap: var(--spacing-sm);
          }

          .highlight-item {
            padding: var(--spacing-sm) var(--spacing-md);
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


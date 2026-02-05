/**
 * ComparisonPanel komponent
 * Sammenligner kundens situation med vores tilbud
 */

import React, { useEffect, useMemo, useState, useRef } from 'react';
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
import { toast } from '../../utils/toast';
// Comparison panel styles moved to components.css

// Tab komponenter - lazy loaded for bedre code-splitting
import { OverviewTab, PriceBreakdownTab, StreamingTab, SpecificationsTab } from './tabs';

function ComparisonPanel({
  cartItems,
  selectedStreaming,
  customerMobileCost,
  broadbandCost,
  numberOfLines = 1,
  originalItemPrice,
  buybackAmount = 0,
  cashDiscount,
  onCashDiscountChange,
  cashDiscountLocked,
  onCashDiscountLockedChange,
  autoAdjust,
  onAutoAdjustChange,
  showCashDiscount,
  onToggleCashDiscount,
  showEarnings = false
}) {
  const [activeTab, setActiveTab] = useState('oversigt');

  // Beregn streaming coverage med CBB MIX support - memoized
  const streamingCoverage = useMemo(() =>
    checkStreamingCoverageWithCBBMix(cartItems, selectedStreaming),
    [cartItems, selectedStreaming]
  );

  const notIncludedStreamingCost = useMemo(() => {
    // 1. Fuld pris for tjenester der slet ikke er dækket af Telmore/CBB slots
    const baseCost = getStreamingTotal(streamingCoverage.notIncluded);
    
    // 2. Add-on merpris for tjenester der koster mere end dækningen (fx Viaplay opgraderinger)
    // Selv hvis tjenesten er "inkluderet" i en slot, skal merprisen (fx 350 kr for Premium) lægges oveni
    const excessCost = streamingCoverage.included.reduce((total, id) => {
      const service = getServiceById(id);
      // Hvis prisen er højere end den værdi Telmore dækker (149 kr), beregn differencen
      if (service && service.coveredValue != null && service.price > service.coveredValue) {
        return total + (service.price - service.coveredValue);
      }
      return total;
    }, 0);

    return baseCost + excessCost;
  }, [streamingCoverage.notIncluded, streamingCoverage.included]);

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
    calculateCustomerTotal(customerMobileCost + (broadbandCost || 0), streamingCost, originalItemPrice),
    [customerMobileCost, broadbandCost, streamingCost, originalItemPrice]
  );

  // Vores tilbud (uden kontant rabat for auto-adjust beregning) - memoized
  const ourOfferWithoutDiscount = useMemo(() =>
    calculateOurOfferTotal(
      cartItems,
      notIncludedStreamingCost,
      0,
      originalItemPrice,
      buybackAmount
    ),
    [cartItems, notIncludedStreamingCost, originalItemPrice, buybackAmount]
  );

  // Beregn total indtjening - memoized (engangsindtjening, ikke løbende)
  const totalEarnings = useMemo(() => {
    return calculateTotalEarnings(cartItems); // Engangsindtjening
  }, [cartItems]);

  // Auto-adjust kontant rabat - Sælger-strategi: Giv noget af indtjeningen tilbage
  // Bemærk: Indtjening er engangsindtjening, så vi skal konvertere til 6 måneder for sammenligning
  // Auto-adjust kontant rabat - Sælger-strategi: Giv noget af indtjeningen tilbage
  // Bemærk: Indtjening er engangsindtjening, så vi skal konvertere til 6 måneder for sammenligning
  // Use a ref to track previous autoAdjust state to show toast only on toggle
  const prevAutoAdjustRef = useRef(autoAdjust);

  useEffect(() => {
    // Check if just toggled on
    const wasAutoAdjust = prevAutoAdjustRef.current;
    prevAutoAdjustRef.current = autoAdjust;
    const justToggledOn = !wasAutoAdjust && autoAdjust;

    if (autoAdjust && !cashDiscountLocked && cartItems.length > 0) {
      // Konverter engangsindtjening til 6 måneder for sammenligning (sælger-strategi)
      const earningsForComparison = totalEarnings; // Engangsindtjening bruges direkte
      // Use the helper to determine optimal discount
      const neededDiscount = autoAdjustCashDiscount(
        customerTotals.sixMonth,
        ourOfferWithoutDiscount.sixMonth,
        500,
        earningsForComparison
      );

      // If calculated discount differs from current, update it
      // Strict check against cashDiscount to allow setting 0 instead of null
      if (neededDiscount !== (cashDiscount ?? -1)) { // ?? -1 to ensure null !== 0 triggers update
        onCashDiscountChange(neededDiscount);

        // Show feedback if just toggled on
        if (justToggledOn) {
          if (neededDiscount > 0) {
            toast(COPY.success.discountApplied(neededDiscount), 'success');
          } else {
            // Needed is 0, but maybe we just set it to 0 from null/something else
            toast('Auto-justering: Prisen er allerede optimal', 'success');
          }
        }
      } else if (justToggledOn) {
        // No change needed, but user just clicked it. Give feedback!
        if (neededDiscount === 0) {
          toast('Auto-justering: Ingen yderligere rabat nødvendig', 'info');
        } else {
          toast('Auto-justering: Prisen er opdateret', 'info');
        }
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
      buybackAmount
    ),
    [cartItems, notIncludedStreamingCost, cashDiscount, originalItemPrice, buybackAmount]
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
          originalItemPrice={originalItemPrice}
          buybackAmount={buybackAmount}
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
          buybackAmount={buybackAmount}
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

    </div>
  );
}

export default React.memo(ComparisonPanel);


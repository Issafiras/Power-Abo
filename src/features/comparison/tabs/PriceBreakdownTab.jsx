/**
 * PriceBreakdownTab - Prisopdeling-fane til ComparisonPanel
 * Viser detaljeret månedlig og 6-måneders prisopdeling
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, calculateSavings, calculateTelenorFamilyDiscount } from '../../../utils/calculations';
import Icon from '../../../components/common/Icon';

function PriceBreakdownTab({ cartItems, customerTotals, ourOfferTotals, streamingCost, notIncludedStreamingCost, cashDiscount, originalItemPrice, buybackAmount = 0 }) {
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

        <motion.div
          className="breakdown-grid"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          initial="hidden"
          animate="show"
        >
          <div className="breakdown-column">
            <div className="breakdown-column-header">Kundens omkostninger</div>
            <motion.div className="breakdown-row" variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}>
              <span className="breakdown-label">Mobil abonnement</span>
              <span className="breakdown-value">{formatCurrency(customerTotals.monthly - streamingCost)}/md.</span>
            </motion.div>
            <motion.div className="breakdown-row" variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}>
              <span className="breakdown-label">Streaming-tjenester</span>
              <span className="breakdown-value">{formatCurrency(streamingCost)}/md.</span>
            </motion.div>
            <motion.div className="breakdown-row breakdown-total" variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}>
              <span className="breakdown-label">Total pr. måned</span>
              <span className="breakdown-value">{formatCurrency(customerTotals.monthly)}/md.</span>
            </motion.div>
          </div>

          <div className="breakdown-column">
            <div className="breakdown-column-header">Vores tilbud</div>
            <motion.div className="breakdown-row" variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}>
              <span className="breakdown-label">Abonnementer</span>
              <span className="breakdown-value">{formatCurrency(ourOfferTotals.monthly - notIncludedStreamingCost)}/md.</span>
            </motion.div>
            {notIncludedStreamingCost > 0 && (
              <motion.div className="breakdown-row" variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}>
                <span className="breakdown-label">Streaming tillæg</span>
                <span className="breakdown-value">{formatCurrency(notIncludedStreamingCost)}/md.</span>
              </motion.div>
            )}
            {telenorDiscount > 0 && (
              <motion.div className="breakdown-row breakdown-discount" variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}>
                <span className="breakdown-label">Familie-rabat</span>
                <span className="breakdown-value text-success">-{formatCurrency(telenorDiscount)}/md.</span>
              </motion.div>
            )}
            <motion.div className="breakdown-row breakdown-total" variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}>
              <span className="breakdown-label">Total pr. måned</span>
              <span className="breakdown-value">{formatCurrency(ourOfferTotals.monthly)}/md.</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* 6-måneders opgørelse */}
      <div className="breakdown-section">
        <h3 className="breakdown-section-title">
          <Icon name="clock" size={18} className="icon-inline icon-spacing-sm" />
          6-måneders opgørelse
        </h3>

        <motion.div
          className="monthly-breakdown-table"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          initial="hidden"
          animate="show"
        >
          <div className="monthly-breakdown-header">
            <div className="monthly-breakdown-cell">Måned</div>
            <div className="monthly-breakdown-cell">Kundens pris</div>
            <div className="monthly-breakdown-cell">Vores pris</div>
            <div className="monthly-breakdown-cell">Forskel</div>
          </div>
          {monthlyBreakdown.map(({ month, customer, ours }) => (
            <motion.div key={month} className="monthly-breakdown-row" variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
              <div className="monthly-breakdown-cell">{month}</div>
              <div className="monthly-breakdown-cell">{formatCurrency(customer)}</div>
              <div className="monthly-breakdown-cell">{formatCurrency(ours)}</div>
              <div className={`monthly-breakdown-cell ${customer - ours > 0 ? 'text-success' : customer - ours < 0 ? 'text-danger' : ''}`}>
                {formatCurrency(customer - ours)}
              </div>
            </motion.div>
          ))}
          <motion.div className="monthly-breakdown-footer" variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
            <div className="monthly-breakdown-cell">Total 6 måneder</div>
            <div className="monthly-breakdown-cell">{formatCurrency(customerTotals.sixMonth)}</div>
            <div className="monthly-breakdown-cell">{formatCurrency(ourOfferTotals.sixMonth)}</div>
            <div className={`monthly-breakdown-cell ${savings > 0 ? 'text-success' : savings < 0 ? 'text-danger' : ''}`}>
              {formatCurrency(savings)}
            </div>
          </motion.div>
        </motion.div>

        {originalItemPrice > 0 && (
          <div className="breakdown-note">
            <Icon name="info" size={16} className="icon-inline icon-spacing-xs" />
            <span>Engangsbetaling på {formatCurrency(originalItemPrice)} er inkluderet i totalen</span>
          </div>
        )}

        {buybackAmount > 0 && (
          <div className="breakdown-note success">
            <Icon name="refresh" size={16} className="icon-inline icon-spacing-xs" />
            <span>RePOWER indbytning på {formatCurrency(buybackAmount)} er trukket fra totalen</span>
          </div>
        )}
      </div>
    </div >
  );
}

export default React.memo(PriceBreakdownTab);

/**
 * MobileStickySummary komponent
 * Viser en fast bjælke i bunden på mobil med de vigtigste tal
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, calculateCustomerTotal, calculateOurOfferTotal, calculateSavings, calculateTotalEarnings } from '../../utils/calculations';
import { getStreamingTotal } from '../../data/streamingServices';
import Icon from '../common/Icon';

export default function MobileStickySummary({ 
  cartItems, 
  selectedStreaming, 
  customerMobileCost, 
  broadbandCost,
  originalItemPrice,
  buybackAmount,
  cashDiscount,
  showEarnings 
}) {
  // Beregn tal (samme logik som i ComparisonPanel)
  const streamingCost = useMemo(() => getStreamingTotal(selectedStreaming), [selectedStreaming]);
  
  const customerTotals = useMemo(() => 
    calculateCustomerTotal(customerMobileCost + (broadbandCost || 0), streamingCost, originalItemPrice),
    [customerMobileCost, broadbandCost, streamingCost, originalItemPrice]
  );

  const streamingCoverage = useMemo(() => {
    // Vi behøver ikke fuld coverage her, bare totalen for ikke-inkluderet
    // For enkelhedens skyld bruger vi en simplificeret beregning eller sender det med som prop
    // Men for at holde den standalone beregner vi det her
    const includedStreaming = new Set();
    cartItems.forEach(item => {
      if (item.plan.streaming) item.plan.streaming.forEach(s => includedStreaming.add(s));
    });
    const notIncluded = selectedStreaming.filter(id => !includedStreaming.has(id));
    return getStreamingTotal(notIncluded);
  }, [cartItems, selectedStreaming]);

  const ourOfferTotals = useMemo(() => 
    calculateOurOfferTotal(cartItems, streamingCoverage, cashDiscount, originalItemPrice, buybackAmount),
    [cartItems, streamingCoverage, cashDiscount, originalItemPrice, buybackAmount]
  );

  const savings = useMemo(() => 
    calculateSavings(customerTotals.sixMonth, ourOfferTotals.sixMonth),
    [customerTotals.sixMonth, ourOfferTotals.sixMonth]
  );

  const totalEarnings = useMemo(() => calculateTotalEarnings(cartItems), [cartItems]);

  const isPositiveSavings = savings > 0;

  // Vis kun hvis der er noget i kurven
  if (cartItems.length === 0) return null;

  const scrollToComparison = () => {
    const element = document.getElementById('comparison-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div 
      className="mobile-sticky-summary"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="mobile-summary-content">
        <div className="mobile-summary-info" onClick={scrollToComparison}>
          <div className="mobile-summary-label">
            {isPositiveSavings ? 'Besparelse (6 mdr)' : 'Forskel (6 mdr)'}
          </div>
          <div className={`mobile-summary-amount ${isPositiveSavings ? 'positive' : 'negative'}`}>
            {isPositiveSavings ? '-' : '+'}{formatCurrency(Math.abs(savings))}
          </div>
          {showEarnings && (
            <div className="mobile-summary-earnings">
              Indtjening: {formatCurrency(totalEarnings - cashDiscount)}
            </div>
          )}
        </div>
        
        <button className="mobile-summary-cta" onClick={scrollToComparison}>
          <Icon name="chart" size={20} />
          <span>Se tilbud</span>
        </button>
      </div>

      <style>{`
        .mobile-sticky-summary {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(20, 20, 20, 0.95);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-top: 1px solid rgba(255, 255, 255, 0.15);
          padding: 12px 16px;
          padding-bottom: max(12px, env(safe-area-inset-bottom));
          z-index: 1000;
          display: none;
          box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.6);
        }

        @media (max-width: 900px) {
          .mobile-sticky-summary {
            display: block;
          }
        }

        .mobile-summary-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          max-width: 600px;
          margin: 0 auto;
        }

        .mobile-summary-info {
          flex: 1;
          cursor: pointer;
          min-height: 44px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .mobile-summary-label {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-bottom: 1px;
          font-weight: 700;
        }

        .mobile-summary-amount {
          font-size: 1.25rem;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .mobile-summary-amount.positive {
          color: #10b981;
          text-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
        }

        .mobile-summary-amount.negative {
          color: #ef4444;
        }

        .mobile-summary-earnings {
          font-size: 10px;
          color: #FF6D1F;
          margin-top: 2px;
          font-weight: 700;
        }

        .mobile-summary-cta {
          background: linear-gradient(135deg, #FF6D1F 0%, #FF8F57 100%);
          border: none;
          border-radius: 12px;
          color: white;
          padding: 0 20px;
          height: 44px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 4px 15px rgba(255, 109, 31, 0.4);
          white-space: nowrap;
        }

        .mobile-summary-cta:active {
          transform: scale(0.95);
        }
      `}</style>
    </motion.div>
  );
}

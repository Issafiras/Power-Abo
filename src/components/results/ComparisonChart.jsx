/**
 * ComparisonChart komponent - Redesign
 * Moderne side-by-side sammenligning med animerede bars og tydelige indikatorer
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import NumberDisplay from '../common/NumberDisplay';
import Icon from '../common/Icon';

function ComparisonChart({ customerTotal, ourOfferTotal, savings }) {
  const isPositiveSavings = savings > 0;
  const maxValue = Math.max(customerTotal, ourOfferTotal);
  const savingsPercentage = maxValue > 0 ? (Math.abs(savings) / maxValue) * 100 : 0;
  
  // Beregn procent af den højeste værdi
  const customerPercentage = maxValue > 0 ? (customerTotal / maxValue) * 100 : 0;
  const ourOfferPercentage = maxValue > 0 ? (ourOfferTotal / maxValue) * 100 : 0;

  return (
    <motion.div 
      className="comparison-chart-v2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header med icon */}
      <div className="comparison-chart-v2__header">
        <div className="comparison-chart-v2__header-content">
          <Icon name="chart" size={24} className="comparison-chart-v2__icon" />
          <h4 className="comparison-chart-v2__title">Visuel Sammenligning</h4>
        </div>
        {Math.abs(savings) > 0 && (
          <motion.div 
            className={`comparison-chart-v2__badge ${isPositiveSavings ? 'comparison-chart-v2__badge--positive' : 'comparison-chart-v2__badge--negative'}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30, delay: 0.8 }}
          >
            <Icon 
              name={isPositiveSavings ? 'checkCircle' : 'warning'} 
              size={16} 
              style={{ marginRight: '6px' }} 
            />
            {isPositiveSavings ? 'Besparelse' : 'Forskel'}
          </motion.div>
        )}
      </div>

      {/* Side-by-side comparison */}
      <div className="comparison-chart-v2__comparison">
        {/* Customer column */}
        <div 
          className="comparison-chart-v2__column comparison-chart-v2__column--customer"
        >
          <div className="comparison-chart-v2__column-header">
            <Icon name="user" size={20} className="comparison-chart-v2__column-icon" />
            <span className="comparison-chart-v2__column-label">Kunde (nu)</span>
          </div>
          
          <div className="comparison-chart-v2__value">
            <NumberDisplay value={customerTotal} size="2xl" color="primary" />
            <span className="comparison-chart-v2__period">over 6 måneder</span>
          </div>

          <div className="comparison-chart-v2__bar-container">
            <motion.div 
              className="comparison-chart-v2__bar comparison-chart-v2__bar--customer"
              initial={{ width: 0 }}
              animate={{ width: `${customerPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            >
              <div className="comparison-chart-v2__bar-fill comparison-chart-v2__bar-fill--customer" />
              <div className="comparison-chart-v2__bar-glow comparison-chart-v2__bar-glow--customer" />
              <motion.span 
                className="comparison-chart-v2__bar-percentage"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                {customerPercentage.toFixed(0)}%
              </motion.span>
            </motion.div>
          </div>
        </div>

        {/* VS divider */}
        <motion.div 
          className="comparison-chart-v2__vs"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <div className="comparison-chart-v2__vs-line" />
          <div className="comparison-chart-v2__vs-icon">
            <Icon name="zap" size={28} />
          </div>
          <div className="comparison-chart-v2__vs-line" />
        </motion.div>

        {/* Our offer column */}
        <div 
          className="comparison-chart-v2__column comparison-chart-v2__column--offer"
        >
          <div className="comparison-chart-v2__column-header">
            <Icon name="briefcase" size={20} className="comparison-chart-v2__column-icon" />
            <span className="comparison-chart-v2__column-label">Vores tilbud</span>
          </div>
          
          <div className="comparison-chart-v2__value">
            <NumberDisplay value={ourOfferTotal} size="2xl" color="orange" />
            <span className="comparison-chart-v2__period">over 6 måneder</span>
          </div>

          <div className="comparison-chart-v2__bar-container">
            <motion.div 
              className="comparison-chart-v2__bar comparison-chart-v2__bar--offer"
              initial={{ width: 0 }}
              animate={{ width: `${ourOfferPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.8 }} // Start later than customer bar
            >
              <div className="comparison-chart-v2__bar-fill comparison-chart-v2__bar-fill--offer" />
              <div className="comparison-chart-v2__bar-glow comparison-chart-v2__bar-glow--offer" />
              <motion.span 
                className="comparison-chart-v2__bar-percentage"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
              >
                {ourOfferPercentage.toFixed(0)}%
              </motion.span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Savings highlight */}
      {Math.abs(savings) > 0 && (
        <motion.div 
          className={`comparison-chart-v2__savings ${isPositiveSavings ? 'comparison-chart-v2__savings--positive' : 'comparison-chart-v2__savings--negative'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, type: "spring" }}
        >
          <div className="comparison-chart-v2__savings-content">
            <div className="comparison-chart-v2__savings-icon">
              <Icon 
                name={isPositiveSavings ? 'trendingDown' : 'alertTriangle'} 
                size={32} 
              />
            </div>
            <div className="comparison-chart-v2__savings-info">
              <div className="comparison-chart-v2__savings-label">
                {isPositiveSavings ? 'Du sparer' : 'Du betaler ekstra'}
              </div>
              <div className="comparison-chart-v2__savings-amount">
                <NumberDisplay 
                  value={Math.abs(savings)} 
                  size="3xl" 
                  color={isPositiveSavings ? 'success' : 'danger'}
                  prefix={isPositiveSavings ? '' : '+'}
                />
              </div>
              <div className="comparison-chart-v2__savings-subtitle">
                {isPositiveSavings 
                  ? `Pr. måned: ${formatCurrency(Math.abs(savings) / 6)}` 
                  : 'Over 6 måneder'
                }
              </div>
            </div>
          </div>

          {/* Savings bar indicator */}
          <div className="comparison-chart-v2__savings-bar-container">
            <motion.div 
              className={`comparison-chart-v2__savings-bar ${isPositiveSavings ? 'comparison-chart-v2__savings-bar--positive' : 'comparison-chart-v2__savings-bar--negative'}`}
              initial={{ width: 0 }}
              animate={{ width: `${savingsPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 2.0 }}
            >
              <div className="comparison-chart-v2__savings-fill" />
            </motion.div>
          </div>
        </motion.div>
      )}

      <style>{`
        .comparison-chart-v2 {
          padding: var(--spacing-2xl);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
          border-radius: var(--radius-xl);
          border: 1px solid rgba(255, 255, 255, 0.08);
          margin: var(--spacing-xl) 0;
          position: relative;
          overflow: hidden;
        }

        .comparison-chart-v2::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--color-orange), var(--color-telenor), var(--color-cbb));
          opacity: 0.3;
        }

        .comparison-chart-v2__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-xl);
          padding-bottom: var(--spacing-md);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .comparison-chart-v2__header-content {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .comparison-chart-v2__icon {
          color: var(--color-orange);
        }

        .comparison-chart-v2__title {
          font-size: var(--font-2xl);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          margin: 0;
          letter-spacing: var(--letter-spacing-tight);
          line-height: var(--leading-tight);
        }

        .comparison-chart-v2__badge {
          display: inline-flex;
          align-items: center;
          padding: var(--spacing-xs) var(--spacing-md);
          border-radius: var(--radius-full);
          font-size: var(--font-sm);
          font-weight: var(--font-semibold);
          gap: var(--spacing-xs);
        }

        .comparison-chart-v2__badge--positive {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
          border: 1px solid var(--color-success);
          color: var(--color-success);
        }

        .comparison-chart-v2__badge--negative {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1));
          border: 1px solid var(--color-danger);
          color: var(--color-danger);
        }

        .comparison-chart-v2__comparison {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: var(--spacing-xl);
          align-items: center;
          margin-bottom: var(--spacing-xl);
        }

        .comparison-chart-v2__column {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .comparison-chart-v2__column-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--font-sm);
          font-weight: var(--font-semibold);
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: var(--letter-spacing-wide);
        }

        .comparison-chart-v2__column-icon {
          opacity: 0.7;
        }

        .comparison-chart-v2__value {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .comparison-chart-v2__period {
          font-size: var(--font-xs);
          color: var(--text-muted);
          font-weight: var(--font-normal);
        }

        .comparison-chart-v2__bar-container {
          width: 100%;
          height: 64px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: var(--radius-lg);
          overflow: hidden;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .comparison-chart-v2__bar {
          height: 100%;
          position: relative;
          min-width: 80px;
          display: flex;
          align-items: center;
          padding: 0 var(--spacing-md);
        }

        .comparison-chart-v2__bar-fill {
          position: absolute;
          inset: 0;
          border-radius: var(--radius-lg);
          transition: all 0.3s ease;
        }

        .comparison-chart-v2__bar-fill--customer {
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.08));
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .comparison-chart-v2__bar-fill--offer {
          background: linear-gradient(90deg, var(--color-orange), var(--color-orange-dark));
          box-shadow: 
            0 0 20px rgba(255, 109, 31, 0.5),
            inset 0 0 20px rgba(255, 255, 255, 0.1);
        }

        .comparison-chart-v2__bar-glow {
          position: absolute;
          inset: -2px;
          border-radius: var(--radius-lg);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .comparison-chart-v2__bar-glow--offer {
          background: radial-gradient(circle, rgba(255, 109, 31, 0.4) 0%, transparent 70%);
        }

        .comparison-chart-v2__bar:hover .comparison-chart-v2__bar-glow {
          opacity: 1;
        }

        .comparison-chart-v2__bar-percentage {
          position: relative;
          z-index: 2;
          font-size: var(--font-lg);
          font-weight: var(--font-bold);
          color: white;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
          font-family: var(--font-family-mono);
          letter-spacing: -0.02em;
        }

        .comparison-chart-v2__vs {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
          position: relative;
        }

        .comparison-chart-v2__vs-line {
          width: 2px;
          height: 40px;
          background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        }

        .comparison-chart-v2__vs-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--color-orange), var(--color-orange-dark));
          border-radius: 50%;
          color: white;
          box-shadow: 
            0 0 24px rgba(255, 109, 31, 0.5),
            0 4px 16px rgba(0, 0, 0, 0.3);
        }

        .comparison-chart-v2__savings {
          padding: var(--spacing-xl);
          border-radius: var(--radius-lg);
          border: 2px solid;
          position: relative;
          overflow: hidden;
        }

        .comparison-chart-v2__savings--positive {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08));
          border-color: var(--color-success);
        }

        .comparison-chart-v2__savings--negative {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.08));
          border-color: var(--color-danger);
        }

        .comparison-chart-v2__savings-content {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-md);
        }

        .comparison-chart-v2__savings-icon {
          flex-shrink: 0;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .comparison-chart-v2__savings--positive .comparison-chart-v2__savings-icon {
          color: var(--color-success);
        }

        .comparison-chart-v2__savings--negative .comparison-chart-v2__savings-icon {
          color: var(--color-danger);
        }

        .comparison-chart-v2__savings-info {
          flex: 1;
        }

        .comparison-chart-v2__savings-label {
          font-size: var(--font-sm);
          font-weight: var(--font-semibold);
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: var(--letter-spacing-wide);
          margin-bottom: var(--spacing-xs);
        }

        .comparison-chart-v2__savings-amount {
          margin-bottom: var(--spacing-xs);
        }

        .comparison-chart-v2__savings-subtitle {
          font-size: var(--font-sm);
          color: var(--text-muted);
        }

        .comparison-chart-v2__savings-bar-container {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-full);
          overflow: hidden;
          position: relative;
        }

        .comparison-chart-v2__savings-bar {
          height: 100%;
          position: relative;
          border-radius: var(--radius-full);
        }

        .comparison-chart-v2__savings-fill {
          position: absolute;
          inset: 0;
          border-radius: var(--radius-full);
          transition: all 0.3s ease;
        }

        .comparison-chart-v2__savings-bar--positive .comparison-chart-v2__savings-fill {
          background: linear-gradient(90deg, var(--color-success), var(--color-success-light));
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.6);
        }

        .comparison-chart-v2__savings-bar--negative .comparison-chart-v2__savings-fill {
          background: linear-gradient(90deg, var(--color-danger), var(--color-danger-light));
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.6);
        }

        @media (max-width: 900px) {
          .comparison-chart-v2 {
            padding: var(--spacing-lg);
          }

          .comparison-chart-v2__comparison {
            grid-template-columns: 1fr;
            gap: var(--spacing-lg);
          }

          .comparison-chart-v2__vs {
            flex-direction: row;
            height: 40px;
          }

          .comparison-chart-v2__vs-line {
            width: 40px;
            height: 2px;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          }

          .comparison-chart-v2__vs-icon {
            width: 48px;
            height: 48px;
          }

          .comparison-chart-v2__bar-container {
            height: 56px;
          }

          .comparison-chart-v2__savings-content {
            flex-direction: column;
            text-align: center;
          }

          .comparison-chart-v2__savings-icon {
            width: 56px;
            height: 56px;
          }
        }
      `}</style>
    </motion.div>
  );
}

// Helper function for formatting currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export default ComparisonChart;

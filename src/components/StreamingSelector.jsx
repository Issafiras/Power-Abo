/**
 * StreamingSelector komponent
 * Multi-select grid af streaming-tjenester
 */

import { streamingServices, getStreamingTotal } from '../data/streamingServices';
import { formatCurrency } from '../utils/calculations';

export default function StreamingSelector({ 
  selectedStreaming, 
  onStreamingToggle,
  customerMobileCost,
  onMobileCostChange 
}) {
  const streamingTotal = getStreamingTotal(selectedStreaming);
  const monthlyTotal = (customerMobileCost || 0) + streamingTotal;
  const sixMonthTotal = monthlyTotal * 6;

  const handleMobileCostChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    onMobileCostChange(value);
  };

  return (
    <div className="streaming-selector glass-card-no-hover fade-in-up">
      <div className="section-header">
        <h2>📊 Kundens Nuværende Situation</h2>
        <p className="text-secondary">
          Vælg kundens aktuelle streaming-tjenester og mobiludgifter
        </p>
      </div>

      {/* Mobil udgifter input */}
      <div className="mobile-cost-input">
        <label htmlFor="mobile-cost" className="input-label">
          💳 Nuværende mobiludgifter pr. måned
        </label>
        <div className="input-with-currency">
          <input
            id="mobile-cost"
            type="number"
            className="input"
            placeholder="299"
            value={customerMobileCost || ''}
            onChange={handleMobileCostChange}
            min="0"
            step="10"
          />
          <span className="currency-suffix">kr/md</span>
        </div>
      </div>

      <div className="divider"></div>

      {/* Streaming grid */}
      <div className="streaming-grid">
        {streamingServices.map((service, index) => {
          const isSelected = selectedStreaming.includes(service.id);
          
          return (
            <button
              key={service.id}
              onClick={() => onStreamingToggle(service.id)}
              className={`streaming-card glass-card stagger-item ${isSelected ? 'selected' : ''}`}
              style={{ 
                animationDelay: `${index * 50}ms`,
                '--brand-color': service.color || 'var(--color-orange)',
                '--brand-bg': service.bgColor || 'var(--glass-bg)'
              }}
              aria-pressed={isSelected}
            >
              <div className="streaming-icon" style={{ 
                background: service.bgColor
              }}>
                {service.logo ? (
                  <img 
                    src={service.logo} 
                    alt={service.name}
                    className="streaming-logo-img"
                  />
                ) : (
                  <span className="logo-musik" style={{ color: service.color }}>
                    {service.logoText}
                  </span>
                )}
              </div>
              <div className="streaming-name">{service.name}</div>
              <div className="streaming-price">{formatCurrency(service.price)}/md</div>
              {isSelected && (
                <div className="streaming-checkmark bounce-in">✓</div>
              )}
            </button>
          );
        })}
      </div>

      <div className="divider"></div>

      {/* Totaler */}
      <div className="totals-summary">
        <div className="total-row">
          <span className="total-label">Mobil pr. måned:</span>
          <span className="total-value">{formatCurrency(customerMobileCost || 0)}</span>
        </div>
        <div className="total-row">
          <span className="total-label">Streaming pr. måned:</span>
          <span className="total-value">{formatCurrency(streamingTotal)}</span>
        </div>
        <div className="total-row highlight">
          <span className="total-label font-bold">Total pr. måned:</span>
          <span className="total-value font-bold text-2xl">
            {formatCurrency(monthlyTotal)}
          </span>
        </div>
        <div className="total-row six-month">
          <span className="total-label">6-måneders total:</span>
          <span className="total-value text-3xl font-extrabold text-gradient">
            {formatCurrency(sixMonthTotal)}
          </span>
        </div>
      </div>

      <style jsx>{`
        .streaming-selector {
          padding: var(--spacing-2xl);
        }

        .section-header {
          margin-bottom: var(--spacing-xl);
        }

        .section-header h2 {
          margin-bottom: var(--spacing-sm);
        }

        .mobile-cost-input {
          margin-bottom: var(--spacing-lg);
        }

        .input-label {
          display: block;
          margin-bottom: var(--spacing-sm);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
        }

        .input-with-currency {
          position: relative;
        }

        .currency-suffix {
          position: absolute;
          right: var(--spacing-md);
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          font-weight: var(--font-semibold);
          pointer-events: none;
        }

        .input-with-currency input {
          padding-right: 5rem;
        }

        .streaming-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: var(--spacing-md);
        }

        .streaming-card {
          position: relative;
          padding: var(--spacing-lg);
          text-align: center;
          cursor: pointer;
          transition: all var(--transition-smooth);
          border: 2px solid transparent;
        }

        .streaming-card:hover {
          transform: translateY(-4px) scale(1.03);
          border-color: var(--color-orange);
          box-shadow: var(--shadow-lg), 0 0 20px rgba(255, 107, 26, 0.2);
        }

        .streaming-card:active {
          transform: translateY(-2px) scale(0.98);
        }

        .streaming-card.selected {
          border-color: var(--color-orange);
          background: rgba(255, 107, 26, 0.15);
          box-shadow: var(--glow-orange), 0 0 30px rgba(255, 107, 26, 0.3);
          transform: scale(1.02);
        }

        .streaming-card.selected:hover {
          transform: translateY(-4px) scale(1.05);
        }

        .streaming-icon {
          font-size: var(--font-4xl);
          font-weight: var(--font-extrabold);
          margin-bottom: var(--spacing-md);
          width: 100px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          transition: all var(--transition-smooth);
          margin-left: auto;
          margin-right: auto;
        }

        .streaming-card:hover .streaming-icon {
          transform: scale(1.08);
          box-shadow: var(--shadow-2xl), 0 0 30px rgba(255, 107, 26, 0.3);
        }

        /* Logo billede styles */
        .streaming-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 12px;
          transition: all var(--transition-smooth);
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }

        .streaming-card:hover .streaming-logo-img {
          transform: scale(1.05);
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
        }

        .streaming-card.selected .streaming-logo-img {
          filter: drop-shadow(0 4px 12px rgba(255, 107, 26, 0.5));
        }

        /* Musik - Note symbol (fallback for services uden billede) */
        .logo-musik {
          font-size: 3rem;
        }

        .streaming-name {
          font-weight: var(--font-semibold);
          margin-bottom: var(--spacing-xs);
          color: var(--text-primary);
          font-size: var(--font-sm);
        }

        .streaming-price {
          color: var(--text-secondary);
          font-size: var(--font-sm);
        }

        .streaming-checkmark {
          position: absolute;
          top: var(--spacing-sm);
          right: var(--spacing-sm);
          width: 28px;
          height: 28px;
          background: var(--color-success);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: var(--font-bold);
          box-shadow: var(--glow-green), 0 0 15px rgba(16, 185, 129, 0.5);
          animation: bounceIn var(--duration-slow) var(--ease-out-back), pulse 2s ease-in-out infinite;
        }

        .totals-summary {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-sm) 0;
        }

        .total-row.highlight {
          padding: var(--spacing-md);
          background: var(--glass-bg);
          border-radius: var(--radius-md);
        }

        .total-row.six-month {
          padding: var(--spacing-lg);
          background: linear-gradient(135deg, rgba(255, 107, 26, 0.1), rgba(255, 107, 26, 0.05));
          border-radius: var(--radius-lg);
          border: 2px solid rgba(255, 107, 26, 0.3);
        }

        .total-label {
          color: var(--text-secondary);
        }

        .total-value {
          color: var(--text-primary);
        }

        @media (max-width: 900px) {
          .streaming-selector {
            padding: var(--spacing-lg);
          }

          .streaming-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: var(--spacing-sm);
          }

          .streaming-card {
            padding: var(--spacing-md);
          }

          .streaming-icon {
            width: 60px;
            height: 60px;
          }

          .logo-musik {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}


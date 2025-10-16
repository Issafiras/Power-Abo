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
                background: service.bgColor,
                color: service.color
              }}>
                {/* Netflix - Bare N */}
                {service.id === 'netflix' && (
                  <span className="logo-netflix">{service.logoText}</span>
                )}
                
                {/* Viaplay - Cirkel med play + tekst */}
                {service.id === 'viaplay' && (
                  <div className="logo-viaplay">
                    <div className="viaplay-circle" style={{ background: service.circleColor }}>
                      {service.logoIcon}
                    </div>
                    <div className="viaplay-text">{service.logoText}</div>
                  </div>
                )}
                
                {/* HBO Max - HBO stor + max lille */}
                {service.id === 'hbo-max' && (
                  <div className="logo-hbo-max">
                    <div className="hbo-text">{service.logoTop}</div>
                    <div className="max-text">{service.logoBottom}</div>
                  </div>
                )}
                
                {/* TV2 - V2 i rød cirkel */}
                {service.id === 'tv2-play' && (
                  <div className="logo-tv2-play">
                    <div className="tv2-circle" style={{ background: service.circleColor }}>
                      {service.logoText}
                    </div>
                  </div>
                )}
                
                {/* Saxo - saxo tekst */}
                {service.id === 'saxo' && (
                  <span className="logo-saxo">{service.logoText}</span>
                )}
                
                {/* Disney+ - Disney+ med bue */}
                {service.id === 'disney-plus' && (
                  <span className="logo-disney-plus">{service.logoText}</span>
                )}
                
                {/* SkyShowtime - sky + SHO i cirkel */}
                {service.id === 'skyshowtime' && (
                  <div className="logo-skyshowtime">
                    <div className="sky-main">
                      <span className="sky-text">{service.logoText}</span>
                      <span className="sho-circle">{service.logoCircle}</span>
                    </div>
                  </div>
                )}
                
                {/* Prime Video - prime/video med smile */}
                {service.id === 'prime-video' && (
                  <div className="logo-prime-video">
                    <div className="prime-text">{service.logoTop}</div>
                    <div className="video-text">{service.logoBottom}</div>
                    {service.hasSmile && <div className="prime-smile">⌣</div>}
                  </div>
                )}
                
                {/* Musik - Note symbol */}
                {service.id === 'musik' && (
                  <span className="logo-musik">{service.logoText}</span>
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
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          transition: all var(--transition-smooth);
          margin-left: auto;
          margin-right: auto;
        }

        .streaming-card:hover .streaming-icon {
          transform: scale(1.1);
          box-shadow: var(--shadow-xl);
        }

        /* Brand-specifikke logo styles */
        
        /* Netflix - Rød N */
        .logo-netflix {
          font-size: 4rem;
          font-weight: 900;
          font-family: 'Arial Black', sans-serif;
        }

        /* Viaplay - Cirkel + tekst */
        .logo-viaplay {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .viaplay-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
        }

        .viaplay-text {
          font-size: 1.1rem;
          font-weight: 600;
          text-transform: lowercase;
        }

        /* HBO Max - To linjer */
        .logo-hbo-max {
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 1;
        }

        .hbo-text {
          font-size: 2.2rem;
          font-weight: 900;
          font-family: 'Arial Black', sans-serif;
          letter-spacing: 2px;
        }

        .max-text {
          font-size: 1.8rem;
          font-weight: 300;
          font-family: Arial, sans-serif;
          letter-spacing: 1px;
          margin-top: -4px;
        }

        /* TV2 - V2 i rød cirkel */
        .logo-tv2-play {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tv2-circle {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 900;
          font-family: 'Arial Black', sans-serif;
        }

        /* Saxo - saxo tekst */
        .logo-saxo {
          font-size: 2rem;
          font-weight: 900;
          font-family: Arial, sans-serif;
          text-transform: lowercase;
          letter-spacing: -1px;
        }

        /* Disney+ */
        .logo-disney-plus {
          font-size: 1.6rem;
          font-weight: 700;
          font-family: 'Arial', sans-serif;
        }

        /* SkyShowtime - sky + SHO */
        .logo-skyshowtime {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sky-main {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .sky-text {
          font-size: 1.6rem;
          font-weight: 900;
          font-family: 'Arial Black', sans-serif;
          text-transform: lowercase;
        }

        .sho-circle {
          font-size: 0.9rem;
          font-weight: 900;
          padding: 4px 6px;
          border: 2px solid white;
          border-radius: 50%;
          font-family: 'Arial Black', sans-serif;
        }

        /* Prime Video - prime/video + smile */
        .logo-prime-video {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1;
        }

        .prime-text {
          font-size: 1.4rem;
          font-weight: 700;
          font-family: Arial, sans-serif;
          text-transform: lowercase;
        }

        .video-text {
          font-size: 1.4rem;
          font-weight: 700;
          font-family: Arial, sans-serif;
          text-transform: lowercase;
        }

        .prime-smile {
          font-size: 1.8rem;
          margin-top: -4px;
          width: 100%;
          text-align: right;
        }

        /* Musik */
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
            font-size: var(--font-3xl);
            width: 60px;
            height: 60px;
          }

          /* Mobile responsive logo sizes */
          .logo-netflix {
            font-size: 2.5rem;
          }

          .viaplay-circle {
            width: 30px;
            height: 30px;
            font-size: 1rem;
          }

          .viaplay-text {
            font-size: 0.8rem;
          }

          .hbo-text {
            font-size: 1.5rem;
          }

          .max-text {
            font-size: 1.2rem;
          }

          .tv2-circle {
            width: 40px;
            height: 40px;
            font-size: 1.5rem;
          }

          .logo-saxo {
            font-size: 1.4rem;
          }

          .logo-disney-plus {
            font-size: 1.1rem;
          }

          .sky-text {
            font-size: 1.2rem;
          }

          .sho-circle {
            font-size: 0.7rem;
            padding: 3px 4px;
          }

          .prime-text,
          .video-text {
            font-size: 1rem;
          }

          .prime-smile {
            font-size: 1.4rem;
          }

          .logo-musik {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}


/**
 * CBBMixSelector komponent
 * Vælg antal CBB MIX tjenester (2-8)
 */

import { formatCurrency } from '../utils/calculations';

export default function CBBMixSelector({ 
  selectedCount, 
  onCountChange, 
  cbbMixPricing,
  disabled = false
}) {
  const mixOptions = [
    { count: 2, label: '2 tjenester', price: cbbMixPricing[2] },
    { count: 3, label: '3 tjenester', price: cbbMixPricing[3] },
    { count: 4, label: '4 tjenester', price: cbbMixPricing[4] },
    { count: 5, label: '5 tjenester', price: cbbMixPricing[5] },
    { count: 6, label: '6 tjenester', price: cbbMixPricing[6] },
    { count: 7, label: '7 tjenester', price: cbbMixPricing[7] },
    { count: 8, label: '8 tjenester', price: cbbMixPricing[8] }
  ];

  return (
    <div className="cbb-mix-selector">
      <div className="mix-header">
        <h4 className="mix-title">🎬 Vælg antal CBB MIX tjenester</h4>
        <p className="mix-description">
          Vælg mellem 2-8 streaming-tjenester til din CBB MIX pakke (160 kr/md per tjeneste)
        </p>
      </div>
      
      <div className="mix-options">
        {mixOptions.map((option) => (
          <button
            key={option.count}
            className={`mix-option ${selectedCount === option.count ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={() => !disabled && onCountChange(option.count)}
            disabled={disabled}
          >
            <div className="mix-option-content">
              <span className="mix-count">{option.label}</span>
              <span className="mix-price">{formatCurrency(option.price)}/md</span>
            </div>
            {selectedCount === option.count && (
              <div className="mix-check">✓</div>
            )}
          </button>
        ))}
      </div>
      
      {selectedCount > 0 && (
        <div className="mix-summary">
          <div className="mix-total">
            <span className="mix-total-label">CBB MIX total:</span>
            <span className="mix-total-price">
              {formatCurrency(cbbMixPricing[selectedCount])}/md
            </span>
          </div>
          <p className="mix-note">
            Du kan skifte mellem tjenesterne løbende uden binding
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * SpecificationsTab - Specifikationer-fane til ComparisonPanel
 * Viser detaljer om valgte planer og features
 */

import React, { useMemo } from 'react';
import { formatCurrency, calculateCBBMixPrice } from '../../../utils/calculations';
import Icon from '../../../components/common/Icon';

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

export default React.memo(SpecificationsTab);


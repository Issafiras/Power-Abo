/**
 * StreamingTab - Streaming-fane til ComparisonPanel
 * Viser inkluderede og ikke-inkluderede streaming-tjenester
 */

import React, { useMemo } from 'react';
import { formatCurrency } from '../../../utils/calculations';
import { getServiceById } from '../../../data/streamingServices';
import Icon from '../../../components/common/Icon';

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

export default React.memo(StreamingTab);


import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CHANGELOG, CURRENT_VERSION } from '../../constants/changelog';
import Icon from './Icon';

function WhatsNewModal({ onClose }) {
  const modalRef = useRef(null);
  const latestUpdate = CHANGELOG[0];

  // Luk ved klik udenfor
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return createPortal(
    <div className="modal-overlay fade-in" style={{ zIndex: 9999 }}>
      <div className="modal-content" ref={modalRef} style={{ maxWidth: '500px' }}>
        <div className="modal-header" style={{ marginBottom: '20px' }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '8px' }}>Version {CURRENT_VERSION}</span>
            <h2 style={{ margin: 0 }}>{latestUpdate.title}</h2>
          </div>
          <button className="close-btn" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px' }}>
            <Icon name="x" size={24} />
          </button>
        </div>

        <div className="features-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {latestUpdate.features.map((feature, index) => (
            <div key={index} className="feature-item" style={{ display: 'flex', gap: '16px' }}>
              <div className="feature-icon-wrapper" style={{ 
                background: 'rgba(255, 109, 31, 0.1)', 
                color: 'var(--color-orange)',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon name={feature.icon} size={20} />
              </div>
              <div className="feature-text">
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{feature.title}</h4>
                <p className="text-secondary" style={{ margin: 0, fontSize: '14px', lineHeight: '1.4' }}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer" style={{ marginTop: '30px' }}>
          <button className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>
            Fedt, lad mig prøve det!
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default WhatsNewModal;
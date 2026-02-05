import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CHANGELOG, CURRENT_VERSION } from '../../constants/changelog';
import Icon from './Icon';

function WhatsNewModal({ onClose }) {
  const modalRef = useRef(null);
  const latestUpdate = CHANGELOG[0];

  // Lock body scroll when modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <AnimatePresence>
      <div className="variant-modal-backdrop" onClick={onClose}>
        <motion.div 
          className="variant-modal" 
          ref={modalRef}
          onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          style={{ maxWidth: '500px' }}
        >
          <button className="variant-modal-close" onClick={onClose} aria-label="Luk">
            <Icon name="x" size={24} />
          </button>

          <div className="variant-modal-header" style={{ textAlign: 'left', marginBottom: '24px' }}>
            <span className="badge badge-primary" style={{ marginBottom: '12px' }}>Version {CURRENT_VERSION}</span>
            <h2 className="variant-modal-title" style={{ fontSize: '1.75rem' }}>{latestUpdate.title}</h2>
          </div>

          <div className="features-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {latestUpdate.features.map((feature, index) => (
              <div key={index} className="feature-item" style={{ display: 'flex', gap: '16px' }}>
                <div className="feature-icon-wrapper" style={{ 
                  background: 'rgba(255, 109, 31, 0.1)', 
                  color: 'var(--color-orange)',
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon name={feature.icon} size={22} />
                </div>
                <div className="feature-text">
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>{feature.title}</h4>
                  <p className="text-secondary" style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="modal-footer" style={{ marginTop: '32px' }}>
            <button className="btn btn-primary" onClick={onClose} style={{ width: '100%', minHeight: '48px' }}>
              Fedt, lad mig prøve det!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

export default WhatsNewModal;
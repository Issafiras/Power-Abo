import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon';
import { formatCurrency } from '../../../utils/calculations';

export default function ViaplayVariantsModal({
  open,
  onClose,
  variants = [],
  selectedStreaming = [],
  onSelectVariant
}) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  // Parent service info
  const parentService = {
    name: 'Viaplay',
    bgColor: '#1F2833'
  };

  const modalContent = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="variant-modal-backdrop"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <motion.div
            className="variant-modal"
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <button className="variant-modal-close" onClick={onClose} aria-label="Luk">
              <Icon name="x" size={24} />
            </button>

            <div className="variant-modal-header">
              <div style={{
                display: 'inline-flex',
                padding: '16px',
                borderRadius: '24px',
                background: parentService.bgColor,
                marginBottom: '20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
              }}>
                <img
                  src="https://issafiras.github.io/Power-Abo/logos/Viaplay.png"
                  alt="Viaplay"
                  style={{ height: '48px', display: 'block' }}
                />
              </div>
              <h3 className="variant-modal-title">Vælg din Viaplay pakke</h3>
              <p className="text-secondary" style={{ maxWidth: '400px', margin: '0 auto 24px' }}>
                Eksklusivt tilkøb for Telmore Play kunder. Spar penge på sport og film.
              </p>
            </div>

            <div className="variant-options-grid" style={{ paddingTop: '12px', gap: '24px' }}>
              {variants.map(v => {
                const isSelected = selectedStreaming.includes(v.id);
                const isPremium = v.name.toLowerCase().includes('premium') || v.id.includes('premium');

                return (
                  <motion.div
                    key={v.id}
                    className={`variant-option-card ${isSelected ? 'selected' : ''} ${isPremium ? 'premium-tier' : ''}`}
                    onClick={() => onSelectVariant?.(v.id)}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ padding: '24px 16px' }}
                  >
                    {isPremium && (
                      <div style={{
                        position: 'absolute',
                        top: '-14px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(to right, #fbbf24, #d97706)',
                        color: '#000',
                        fontSize: '10px',
                        fontWeight: '800',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        zIndex: '10',
                        whiteSpace: 'nowrap',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}>
                        🔥 Mest Populær
                      </div>
                    )}

                    <div className="variant-option-name" style={{ padding: '0 10px', marginBottom: '8px' }}>
                      {v.name.replace('Viaplay', '').trim() || v.name}
                    </div>

                    <div className="variant-option-price" style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '2px' }}>TELMORE PRIS</div>
                      {formatCurrency(v.price)}
                      <span style={{ fontSize: '0.5em', fontWeight: 'normal', opacity: 0.7, marginLeft: '2px' }}>/md.</span>
                    </div>

                    {v.description && (
                      <div className="variant-option-description" style={{ fontSize: '0.8rem', minHeight: '5.5em', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        {v.description.split(/, | og /).map((feature, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Icon name="check" size={10} color="var(--color-primary)" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    )}

                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 shadow-md z-20"
                      >
                        <Icon name="check" size={12} />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                className="btn btn-ghost text-red-500 hover:bg-red-500/10 transition-colors"
                onClick={onClose}
              >
                Annullér
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

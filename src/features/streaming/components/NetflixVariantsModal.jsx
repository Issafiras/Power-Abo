import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon';
import { formatCurrency } from '../../../utils/calculations';

export default function NetflixVariantsModal({
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

  // Find parent service info (Netflix) for styling
  const parentService = variants.length > 0 ? {
    name: 'Netflix',
    logo: variants[0].logo,
    bgColor: variants[0].bgColor || '#000000'
  } : { name: 'Netflix', bgColor: '#000000' };

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
                  src="https://issafiras.github.io/Power-Abo/logos/Netflix.png"
                  alt="Netflix"
                  style={{ height: '48px', display: 'block' }}
                />
              </div>
              <h3 className="variant-modal-title">Vælg dit Netflix abonnement</h3>
              <p className="text-secondary" style={{ maxWidth: '400px', margin: '0 auto 24px' }}>
                Få den fulde oplevelse med det abonnement der passer dig bedst.
              </p>
            </div>

            <div className="variant-options-grid" style={{ paddingTop: '12px', gap: '24px' }}>
              {variants.map(v => {
                const isSelected = selectedStreaming.includes(v.id);
                // "Premium" check - based on name or price
                const isPremium = v.name.toLowerCase().includes('premium') || v.price >= 169;

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
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg z-10 whitespace-nowrap border border-yellow-200">
                        ⭐ Anbefalet
                      </div>
                    )}

                    <div className="variant-option-name" style={{ padding: '0 10px', marginBottom: '8px' }}>
                      {v.name.replace('Netflix', '').trim() || v.name}
                    </div>

                    <div className="variant-option-price" style={{ marginBottom: '12px' }}>
                      {formatCurrency(v.price)}
                      <span style={{ fontSize: '0.5em', fontWeight: 'normal', opacity: 0.7, marginLeft: '2px' }}>/md.</span>
                    </div>

                    {v.description && (
                      <div className="variant-option-description" style={{ fontSize: '0.85rem', minHeight: '2.8em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {v.description}
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
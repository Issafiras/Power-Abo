import React from 'react';
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
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="scanner-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Netflix varianter"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            // klik udenfor modal lukker
            if (e.target === e.currentTarget) onClose?.();
          }}
        >
          <motion.div
            className="scanner-modal"
            initial={{ y: 20, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.98, opacity: 0 }}
          >
            <div className="scanner-header">
              <span className="icon-with-text">
                <Icon name="tv" size={20} className="icon-inline icon-spacing-xs" />
                Netflix – vælg variant
              </span>
              <div className="flex gap-sm">
                <button className="btn" onClick={onClose}>Luk</button>
              </div>
            </div>

            <div style={{ padding: 'var(--spacing-md)' }}>
              <div className="grid" style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
                {variants.map(v => {
                  const selected = selectedStreaming.includes(v.id);
                  return (
                    <button
                      key={v.id}
                      className={`streaming-card-premium ${selected ? 'selected' : ''}`}
                      onClick={() => onSelectVariant?.(v.id)}
                      aria-pressed={selected}
                      style={{
                        width: '100%',
                        justifyContent: 'space-between',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 'var(--spacing-md)'
                      }}
                      type="button"
                    >
                      <div style={{ textAlign: 'left' }}>
                        <div className="streaming-name">{v.name}</div>
                        {v.description && (
                          <div style={{ opacity: 0.85, fontSize: '0.9rem', marginTop: 4 }}>
                            {v.description}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <div className="streaming-price">{formatCurrency(v.price)}/md.</div>
                        {selected && (
                          <span className="checkmark-badge" style={{ position: 'static' }}>
                            <Icon name="check" size={12} color="white" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="scanner-footer" style={{ marginTop: 'var(--spacing-md)' }}>
                <button className="btn" onClick={onClose} type="button">Annullér</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Simpel Toast komponent - erstatter react-hot-toast
 * Ultra let og hurtig
 */

import { useState, useEffect } from 'react';
import Icon from './Icon';

let toastId = 0;
const toasts = [];
const listeners = new Set();

function addToast(message, type = 'success') {
  const id = toastId++;
  const toast = { id, message, type };
  toasts.push(toast);
  listeners.forEach(listener => listener([...toasts]));
  
  setTimeout(() => {
    removeToast(id);
  }, 3000);
}

function removeToast(id) {
  const index = toasts.findIndex(t => t.id === id);
  if (index !== -1) {
    toasts.splice(index, 1);
    listeners.forEach(listener => listener([...toasts]));
  }
}

export function toast(message, type = 'success') {
  addToast(message, type);
}

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState([]);

  useEffect(() => {
    const listener = (newToasts) => setCurrentToasts(newToasts);
    listeners.add(listener);
    setCurrentToasts([...toasts]);
    return () => listeners.delete(listener);
  }, []);

  if (currentToasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {currentToasts.map(({ id, message, type }) => (
        <div
          key={id}
          className={`toast toast-${type}`}
          role="alert"
        >
          <Icon name={type === 'error' ? 'alert-circle' : 'check'} size={20} />
          <span>{message}</span>
        </div>
      ))}
      <style>{`
        .toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none;
        }

        .toast {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--glass-bg);
          color: var(--text-primary);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          backdrop-filter: blur(12px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          font-size: var(--font-base);
          font-weight: var(--font-medium);
          max-width: 400px;
          pointer-events: auto;
          animation: toastSlideIn 0.2s ease-out;
        }

        .toast-success {
          border-color: var(--color-success);
        }

        .toast-error {
          border-color: var(--color-danger);
        }

        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 900px) {
          .toast-container {
            bottom: 16px;
            right: 16px;
            left: 16px;
          }

          .toast {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}


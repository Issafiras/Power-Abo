/**
 * ToastContainer komponent - adskilt fra toast funktion for at fikse hot reload
 */

import { useState, useEffect } from 'react';
import Icon from './Icon';
import { removeToast, toasts, listeners } from '../../utils/toast';

function getIconName(type) {
  switch (type) {
    case 'error':
      return 'error';
    case 'warning':
      return 'alert';
    case 'info':
      return 'info';
    case 'success':
    default:
      return 'check';
  }
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
      {currentToasts.map(({ id, message, type, isRemoving }) => (
        <div
          key={id}
          className={`toast toast-${type} ${isRemoving ? 'toast-removing' : ''}`}
          role="alert"
        >
          <Icon name={getIconName(type)} size={20} className="toast-icon" />
          <span className="toast-message">{message}</span>
          <button
            className="toast-close"
            onClick={() => removeToast(id)}
            aria-label="Luk besked"
            type="button"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

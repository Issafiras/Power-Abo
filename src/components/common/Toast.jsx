/**
 * Forbedret Toast komponent - erstatter react-hot-toast
 * Ultra let og hurtig med forbedret API og funktionalitet
 */

import { useState, useEffect } from 'react';
import Icon from './Icon';

let toastId = 0;
const toasts = [];
const listeners = new Set();
const timeouts = new Map();

function addToast(message, type = 'success', duration = 3000) {
  const id = toastId++;
  const toast = { id, message, type, isRemoving: false };
  toasts.push(toast);
  listeners.forEach(listener => listener([...toasts]));
  
  // Gem timeout ID så vi kan annullere den hvis toast lukkes manuelt
  const timeoutId = setTimeout(() => {
    removeToast(id);
  }, duration);
  timeouts.set(id, timeoutId);
  
  return id;
}

function removeToast(id) {
  const index = toasts.findIndex(t => t.id === id);
  if (index !== -1) {
    // Marker toast som fjernes for fade-out animation
    toasts[index].isRemoving = true;
    listeners.forEach(listener => listener([...toasts]));
    
    // Annuller timeout hvis den stadig kører
    const timeoutId = timeouts.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeouts.delete(id);
    }
    
    // Fjern toast efter fade-out animation
    setTimeout(() => {
      const removeIndex = toasts.findIndex(t => t.id === id);
      if (removeIndex !== -1) {
        toasts.splice(removeIndex, 1);
        listeners.forEach(listener => listener([...toasts]));
      }
    }, 300); // Match fade-out animation duration
  }
}

function getIconName(type) {
  switch (type) {
    case 'error':
      return 'warning';
    case 'warning':
      return 'warning';
    case 'info':
      return 'info';
    case 'success':
    default:
      return 'check';
  }
}

// Hovedfunktion med bagudkompatibilitet
function toastFunction(message, type = 'success') {
  return addToast(message, type);
}

// Nye convenience metoder
toastFunction.success = (message, duration) => addToast(message, 'success', duration);
toastFunction.error = (message, duration) => addToast(message, 'error', duration);
toastFunction.warning = (message, duration) => addToast(message, 'warning', duration);
toastFunction.info = (message, duration) => addToast(message, 'info', duration);

// Export toast funktionen
// eslint-disable-next-line react-refresh/only-export-components
export const toast = toastFunction;

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

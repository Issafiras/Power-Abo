/**
 * Toast funktion - adskilt fra komponent for at fikse hot reload
 * Ultra let og hurtig med forbedret API og funktionalitet
 */

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

// Hovedfunktion med bagudkompatibilitet
function toastFunction(message, type = 'success') {
  return addToast(message, type);
}

// Nye convenience metoder
toastFunction.success = (message, duration) => addToast(message, 'success', duration);
toastFunction.error = (message, duration) => addToast(message, 'error', duration);
toastFunction.warning = (message, duration) => addToast(message, 'warning', duration);
toastFunction.info = (message, duration) => addToast(message, 'info', duration);

// Bagudkompatibilitet - warning kan også kaldes som warn
toastFunction.warn = toastFunction.warning;

// Export toast funktionen
export const toast = toastFunction;

// Export interne funktioner for ToastContainer komponenten
export { addToast, removeToast, toasts, listeners };

/**
 * main.jsx - Entry point
 * Initialiserer React og renderer App
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ToastContainer } from './components/common/Toast';
import App from './App';
import './styles/main.css';

let fadeTimeoutId = null;
let removalTimeoutId = null;

function scheduleLoadingScreenRemoval() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const loadingScreen = document.getElementById('loading-screen');
  if (!loadingScreen) {
    return;
  }

  fadeTimeoutId = window.setTimeout(() => {
    loadingScreen.classList.add('fade-out');
    removalTimeoutId = window.setTimeout(() => {
      loadingScreen.remove();
    }, 500);
  }, 500);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    scheduleLoadingScreenRemoval();
  } else {
    const handleReady = () => {
      scheduleLoadingScreenRemoval();
      document.removeEventListener('DOMContentLoaded', handleReady);
    };
    document.addEventListener('DOMContentLoaded', handleReady, { once: true });
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastContainer />
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    if (fadeTimeoutId) {
      window.clearTimeout(fadeTimeoutId);
      fadeTimeoutId = null;
    }
    if (removalTimeoutId) {
      window.clearTimeout(removalTimeoutId);
      removalTimeoutId = null;
    }
  }, { once: true });
}


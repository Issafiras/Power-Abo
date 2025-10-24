/**
 * main.jsx - Entry point
 * Initialiserer React og renderer App
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Load critical CSS first
import './styles/optimized.css';

// Lazy load non-critical CSS
const loadNonCriticalCSS = () => {
  import('./styles/main.css');
};

// Load non-critical CSS after initial render
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadNonCriticalCSS);
} else {
  loadNonCriticalCSS();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


// POWER Calculator v10.0 - Main Application
import { App } from './app.js';
import { initDatabase } from './database.js';
import { initUI } from './ui.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize database
    await initDatabase();
    
    // Initialize UI components
    initUI();
    
    // Start the main application
    App.init();
    
    // Show welcome message
    App.showToast('🎉 Velkommen til POWER v10.0! Klik på "Start Guide" for at komme i gang.', 'success', 5000);
    
    console.log('POWER Calculator v10.0 initialized successfully');
  } catch (error) {
    console.error('Failed to initialize POWER Calculator:', error);
    App.showToast('Fejl ved initialisering af applikationen', 'error', 5000);
  }
});

// Export for global access
window.PowerApp = App;

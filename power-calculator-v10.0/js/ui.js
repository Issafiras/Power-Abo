// UI initialization and event handlers for POWER Calculator v10.0

export function initUI() {
  // Initialize theme
  initTheme();
  
  // Initialize keyboard shortcuts
  initKeyboardShortcuts();
  
  // Initialize event listeners
  initEventListeners();
}

function initTheme() {
  const themeBtn = document.getElementById('themeBtn');
  const savedTheme = localStorage.getItem('power-theme') || 'dark';
  
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  if (themeBtn) {
    themeBtn.setAttribute('aria-pressed', savedTheme === 'light');
    themeBtn.addEventListener('click', toggleTheme);
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('power-theme', newTheme);
  
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.setAttribute('aria-pressed', newTheme === 'light');
  }
}

function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for shortcuts help
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      toggleShortcutsHelp();
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
      closeAllModals();
    }
    
    // Ctrl/Cmd + R for reset
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      resetCalculator();
    }
  });
}

function initEventListeners() {
  // Reset button
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetCalculator);
  }
  
  // Help menu
  const helpBtn = document.getElementById('helpBtn');
  if (helpBtn) {
    helpBtn.addEventListener('click', toggleHelpDropdown);
  }
  
  // Guide button
  const guideBtn = document.getElementById('guideBtn');
  if (guideBtn) {
    guideBtn.addEventListener('click', openGuide);
  }
  
  // Shortcuts button
  const shortcutsBtn = document.getElementById('shortcutsBtn');
  if (shortcutsBtn) {
    shortcutsBtn.addEventListener('click', toggleShortcutsHelp);
  }
}

function toggleHelpDropdown() {
  const dropdown = document.querySelector('.help-dropdown');
  if (dropdown) {
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  }
}

function openGuide() {
  // Implementation will be added when App is imported
  if (window.PowerApp && window.PowerApp.openGuide) {
    window.PowerApp.openGuide();
  }
}

function toggleShortcutsHelp() {
  const shortcutsHelp = document.getElementById('shortcutsHelp');
  if (shortcutsHelp) {
    shortcutsHelp.classList.toggle('open');
  }
}

function closeAllModals() {
  // Close all open modals
  const modals = document.querySelectorAll('.guide, .present, .shortcuts-help, .slide-container');
  modals.forEach(modal => {
    modal.classList.remove('open');
  });
}

function resetCalculator() {
  // Reset all inputs and calculations
  const curTotal = document.getElementById('curTotal');
  if (curTotal) curTotal.value = '';
  
  // Clear streaming selections
  const streamingItems = document.querySelectorAll('.stream-item.selected');
  streamingItems.forEach(item => {
    item.classList.remove('selected');
  });
  
  // Clear cart
  const cartContainer = document.getElementById('cartContainer');
  if (cartContainer) {
    cartContainer.innerHTML = `
      <div class="cart-empty">
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <div class="empty-text">Vælg abonnementer ovenfor</div>
        </div>
      </div>
    `;
  }
  
  // Reset totals
  const customerTotal = document.getElementById('customerTotal');
  const ourTotal = document.getElementById('ourTotal');
  const savings = document.getElementById('savings');
  
  if (customerTotal) customerTotal.textContent = '0 kr';
  if (ourTotal) ourTotal.textContent = '0 kr';
  if (savings) savings.textContent = '0 kr';
  
  // Reset rebate
  const rebate = document.getElementById('rebate');
  if (rebate) rebate.value = '0';
  
  if (window.PowerApp && window.PowerApp.showToast) {
    window.PowerApp.showToast('Kalkulatoren er nulstillet', 'info', 2000);
  }
}

// main.js - App initialisering og hotkeys

import { getState, setState, reset, fromShareLink, toShareLink } from './state.js'
import * as ui from './ui.js'

function init() {
  // Prøv at loade fra URL-parametre
  const loaded = fromShareLink()
  
  if (!loaded) {
    // Ingen parametre - start med tom state
    reset()
  }
  
  // Setup UI
  ui.init()
  
  // Setup hotkeys
  setupHotkeys()
  
  // Setup theme toggle
  setupTheme()
}

function setupHotkeys() {
  document.addEventListener('keydown', (e) => {
    // Ignorer hvis bruger skriver i input-felt
    if (e.target.matches('input, select, textarea')) {
      return
    }
    
    const key = e.key.toLowerCase()
    
    // 1, 2, 3: Spring til trin
    if (key === '1') {
      ui.setStep(1)
    } else if (key === '2') {
      ui.setStep(2)
    } else if (key === '3') {
      ui.setStep(3)
    }
    
    // R: Reset
    else if (key === 'r') {
      if (confirm('Nulstil alt?')) {
        reset()
        ui.setStep(1)
        ui.render()
      }
    }
    
    // S: Del/gem link
    else if (key === 's') {
      const link = toShareLink()
      if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
          showToast('Link kopieret!')
        })
      } else {
        prompt('Kopiér link:', link)
      }
    }
    
    // P: Print
    else if (key === 'p') {
      window.print()
    }
    
    // Arrow keys: Naviger mellem trin
    else if (e.key === 'ArrowLeft') {
      const current = ui.getCurrentStep()
      if (current > 1) {
        ui.setStep(current - 1)
      }
    } else if (e.key === 'ArrowRight') {
      const current = ui.getCurrentStep()
      if (current < 3) {
        ui.setStep(current + 1)
      }
    }
  })
}

function setupTheme() {
  const toggleBtn = document.getElementById('theme-toggle')
  if (!toggleBtn) return
  
  // Hent gemt tema eller brug dark som standard
  const savedTheme = localStorage.getItem('theme') || 'dark'
  document.documentElement.setAttribute('data-theme', savedTheme)
  updateThemeIcon(savedTheme)
  
  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme')
    const newTheme = current === 'dark' ? 'light' : 'dark'
    
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
    updateThemeIcon(newTheme)
  })
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('theme-toggle')
  if (btn) {
    btn.textContent = theme === 'dark' ? '☀️' : '🌙'
  }
}

function showToast(message) {
  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.textContent = message
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.classList.add('show')
  }, 10)
  
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => toast.remove(), 300)
  }, 2000)
}

// Start app når DOM er klar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}


// ui.js - UI rendering og interaktion

import { getState, setState, reset, toShareLink } from './state.js'
import { findBestSolution } from './calc.js'
import { STREAMING_SERVICES } from './streams.js'
import { PLANS } from './plans.js'

let currentStep = 1

export function init() {
  setupEventListeners()
  render()
}

export function setStep(step) {
  currentStep = step
  render()
}

export function render() {
  renderStepIndicator()
  renderCurrentStep()
  updateNavButtons()
}

function renderStepIndicator() {
  const container = document.getElementById('step-indicator')
  if (!container) return
  
  container.innerHTML = `
    <div class="step ${currentStep === 1 ? 'active' : ''}">1. Mobil</div>
    <div class="step ${currentStep === 2 ? 'active' : ''}">2. Streaming</div>
    <div class="step ${currentStep === 3 ? 'active' : ''}">3. Resultat</div>
  `
}

function renderCurrentStep() {
  const container = document.getElementById('step-content')
  if (!container) return
  
  if (currentStep === 1) {
    renderStep1(container)
  } else if (currentStep === 2) {
    renderStep2(container)
  } else if (currentStep === 3) {
    renderStep3(container)
  }
}

function renderStep1(container) {
  const state = getState()
  const householdSize = state.household.size || 1
  const currentMonthlyPrice = state.household.currentMonthlyPrice || 0
  
  container.innerHTML = `
    <div class="step-panel">
      <h2>Trin 1: Nuværende situation</h2>
      <p class="muted">Fortæl os om jeres nuværende mobilsituation</p>
      
      <div class="input-group">
        <label for="household-size">
          <strong>Hvor mange personer er i husstanden?</strong>
          <span class="muted">Inkl. børn der skal have mobil</span>
        </label>
        <input 
          type="number" 
          id="household-size" 
          min="1" 
          max="10" 
          value="${householdSize}"
          onchange="window.updateHouseholdSize(this.value)"
          placeholder="F.eks. 4"
        />
      </div>
      
      <div class="input-group">
        <label for="current-price">
          <strong>Hvad betaler I i alt for mobil i dag?</strong>
          <span class="muted">Samlet månedlig pris for alle abonnementer</span>
        </label>
        <div class="price-input">
          <input 
            type="number" 
            id="current-price" 
            min="0" 
            step="10"
            value="${currentMonthlyPrice}"
            onchange="window.updateCurrentPrice(this.value)"
            placeholder="F.eks. 1200"
          />
          <span class="price-suffix">kr/md</span>
        </div>
      </div>
      
      <div class="info-box">
        <strong>💡 Tips:</strong> 
        ${householdSize > 1 
          ? `Med ${householdSize} personer kan I få en god samlerabat!`
          : 'Jo flere personer, desto større samlerabat kan I opnå'
        }
      </div>
    </div>
  `
}

function renderStep2(container) {
  const state = getState()
  const streams = state.streams || {}
  
  container.innerHTML = `
    <div class="step-panel">
      <h2>Trin 2: Streaming-tjenester</h2>
      <p class="muted">Hvilke streaming-tjenester har I i dag?</p>
      
      <div class="streaming-grid">
        ${STREAMING_SERVICES.map(service => {
          const selected = streams[service.id] || false
          return `
            <div class="stream-chip ${selected ? 'selected' : ''}" 
                 data-service="${service.id}"
                 onclick="window.toggleStreamSimple('${service.id}')">
              <div class="stream-icon" style="background: ${service.color}">${service.icon}</div>
              <div class="stream-label">${service.label}</div>
              <div class="stream-price">${service.monthlyPrice} kr/md</div>
              ${selected ? '<div class="stream-badge">✓</div>' : ''}
            </div>
          `
        }).join('')}
      </div>
      
      <div class="info-box">
        <strong>💡 Tips:</strong> Vælg alle de tjenester I har i dag - vi finder den bedste løsning
      </div>
    </div>
  `
}

function renderStep3(container) {
  const state = getState()
  const result = findBestSolution(state)
  
  if (!result) {
    container.innerHTML = `
      <div class="step-panel">
        <h2>Trin 3: Jeres løsning</h2>
        <div class="info-box">
          <strong>⚠️ Mangler information</strong>
          <p>Gå tilbage og udfyld antal personer og nuværende pris.</p>
        </div>
      </div>
    `
    return
  }
  
  const { current, recommended, savings, provider } = result
  const isSaving = savings.total6m > 0
  
  container.innerHTML = `
    <div class="step-panel" id="result-panel">
      <h2>Jeres løsning: ${provider.name}</h2>
      <p class="muted">Baseret på ${state.household.size} personer</p>
      
      <!-- Sammenligning: Nu vs. Vores løsning -->
      <div class="comparison-container">
        <div class="comparison-card current">
          <h3>I dag</h3>
          <div class="comparison-price">${current.monthly.toLocaleString('da-DK')} kr/md</div>
          <div class="comparison-breakdown">
            <div class="comparison-row">
              <span>Mobil:</span>
              <span>${current.mobileMonthly.toLocaleString('da-DK')} kr/md</span>
            </div>
            <div class="comparison-row">
              <span>Streaming:</span>
              <span>${current.streamingMonthly.toLocaleString('da-DK')} kr/md</span>
            </div>
          </div>
          <div class="comparison-total">
            <strong>Total (6 mdr):</strong>
            <span>${current.total6m.toLocaleString('da-DK')} kr</span>
          </div>
        </div>
        
        <div class="comparison-arrow ${isSaving ? 'saving' : ''}">
          ${isSaving ? '→' : '='}
        </div>
        
        <div class="comparison-card recommended ${isSaving ? 'highlight' : ''}">
          <h3>Vores løsning - ${provider.name}</h3>
          <div class="comparison-price">${recommended.monthly.toLocaleString('da-DK')} kr/md</div>
          <div class="comparison-breakdown">
            ${recommended.details.isFamilyPackage ? `
              <div class="comparison-row">
                <span>1× ${recommended.details.streamingPlan.brand} ${recommended.details.streamingPlan.name}:</span>
                <span>${recommended.details.streamingPlan.price} kr/md</span>
              </div>
              <div class="comparison-row">
                <span>${state.household.size - 1}× ${recommended.details.nonStreamingPlan.brand} ${recommended.details.nonStreamingPlan.name}:</span>
                <span>${recommended.details.nonStreamingPlan.price * (state.household.size - 1)} kr/md</span>
              </div>
              ${recommended.details.familyDiscount > 0 ? `
                <div class="comparison-row discount">
                  <span>Telenor familiepris rabat:</span>
                  <span>-${recommended.details.familyDiscount} kr/md</span>
                </div>
              ` : ''}
            ` : `
              <div class="comparison-row">
                <span>${state.household.size}× ${recommended.details.plan.brand} ${recommended.details.plan.name}:</span>
                <span>${recommended.mobileBeforeDiscount.toLocaleString('da-DK')} kr/md</span>
              </div>
            `}
            ${result.hasStreamingIncluded ? `
              <div class="comparison-row" style="color: var(--good);">
                <span>Streaming inkluderet ✓</span>
                <span>0 kr/md</span>
              </div>
            ` : recommended.streamingMonthly > 0 ? `
              <div class="comparison-row">
                <span>Streaming (ikke inkl.):</span>
                <span>${recommended.streamingMonthly.toLocaleString('da-DK')} kr/md</span>
              </div>
            ` : ''}
          </div>
          <div class="comparison-total">
            <strong>Total (6 mdr):</strong>
            <span>${recommended.total6m.toLocaleString('da-DK')} kr</span>
          </div>
        </div>
      </div>
      
      <!-- Besparelse -->
      <div class="savings-card ${isSaving ? 'positive' : 'neutral'}">
        ${isSaving ? `
          <div class="savings-header">
            <span class="savings-icon">🎉</span>
            <h3>I sparer ${savings.monthly.toLocaleString('da-DK')} kr/md</h3>
          </div>
          <div class="savings-total">
            <strong>Total besparelse over 6 måneder:</strong>
            <span class="savings-amount">${savings.total6m.toLocaleString('da-DK')} kr</span>
          </div>
          ${result.meetsMinSavings 
            ? '<div class="badge success">✓ Minimum 500 kr opnået</div>'
            : '<div class="badge warning">⚠ Under 500 kr minimum</div>'
          }
        ` : `
          <div class="savings-header">
            <h3>Samme pris med vores løsning</h3>
          </div>
          <p class="muted">I får samme pris, men med vores service og support!</p>
        `}
        ${result.hasStreamingIncluded && current.streamingMonthly > 0 ? `
          <div style="margin-top: 1rem; padding: 1rem; background: rgba(16, 185, 129, 0.1); border-radius: var(--radius); border: 1px solid var(--good);">
            <strong style="color: var(--good);">💰 Bonus besparelse:</strong>
            <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">
              Streaming er inkluderet! I sparer yderligere ${current.streamingMonthly.toLocaleString('da-DK')} kr/md 
              (${(current.streamingMonthly * 6).toLocaleString('da-DK')} kr over 6 mdr)
            </p>
          </div>
        ` : ''}
      </div>
      
      <!-- Løsningsdetaljer -->
      <div class="solution-details">
        <h3>Løsningen indeholder:</h3>
        <ul class="solution-list">
          ${recommended.details.isFamilyPackage ? `
            <li><strong>Smart familiepakke for ${state.household.size} personer</strong></li>
            <li>1× ${recommended.details.streamingPlan.brand} ${recommended.details.streamingPlan.name} (med streaming)</li>
            <li>${state.household.size - 1}× ${recommended.details.nonStreamingPlan.brand} ${recommended.details.nonStreamingPlan.name}</li>
            ${recommended.details.isTelenorFamily ? `
              <li><strong>Telenor familiepris:</strong> ${recommended.details.familyDiscount} kr/md rabat</li>
            ` : ''}
          ` : `
            <li><strong>${state.household.size}× ${recommended.details.plan.brand} ${recommended.details.plan.name}</strong></li>
            ${recommended.details.plan.introPrice ? `
              <li><strong>Startpris:</strong> ${recommended.details.plan.introPrice} kr/md i ${recommended.details.plan.introMonths} måneder</li>
            ` : ''}
            <li><strong>Features:</strong> ${recommended.details.plan.features.join(', ')}</li>
          `}
          ${result.hasStreamingIncluded ? `
            <li style="color: var(--good);"><strong>✓ Streaming inkluderet!</strong> Sparer ${current.streamingMonthly.toLocaleString('da-DK')} kr/md</li>
          ` : recommended.selectedStreams.length > 0 ? `
            <li><strong>Streaming-tjenester (ikke inkl.):</strong> ${recommended.selectedStreams.map(s => s.label).join(', ')}</li>
          ` : ''}
        </ul>
      </div>
      
      <div class="result-actions">
        <button class="btn primary" onclick="window.printResult()">🖨️ Print tilbud</button>
        <button class="btn" onclick="window.shareResult()">📤 Del</button>
        <button class="btn" onclick="window.resetApp()">🔄 Ny kunde</button>
      </div>
    </div>
  `
}

function updateNavButtons() {
  const prevBtn = document.getElementById('btn-prev')
  const nextBtn = document.getElementById('btn-next')
  
  if (prevBtn) {
    prevBtn.disabled = currentStep === 1
    prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-flex'
  }
  
  if (nextBtn) {
    nextBtn.textContent = currentStep === 3 ? 'Afslut' : 'Næste →'
    if (currentStep === 3) {
      nextBtn.style.display = 'none'
    } else {
      nextBtn.style.display = 'inline-flex'
    }
  }
}

function setupEventListeners() {
  const prevBtn = document.getElementById('btn-prev')
  const nextBtn = document.getElementById('btn-next')
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--
        render()
      }
    })
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentStep < 3) {
        currentStep++
        render()
      }
    })
  }
}

// Global funktioner til at manipulere state (kaldes fra onclick i HTML)
window.updateHouseholdSize = function(size) {
  const numSize = parseInt(size, 10)
  if (numSize < 1) return
  
  setState({ household: { ...getState().household, size: numSize } })
  render()
}

window.updateCurrentPrice = function(price) {
  const numPrice = parseInt(price, 10) || 0
  setState({ household: { ...getState().household, currentMonthlyPrice: numPrice } })
}

window.toggleStreamSimple = function(serviceId) {
  const state = getState()
  const streams = { ...state.streams }
  
  // Toggle on/off
  streams[serviceId] = !streams[serviceId]
  
  setState({ streams })
  render()
}

window.printResult = function() {
  window.print()
}

window.shareResult = function() {
  const link = toShareLink()
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(link).then(() => {
      alert('Link kopieret til udklipsholder!')
    })
  } else {
    prompt('Kopiér dette link:', link)
  }
}

window.resetApp = function() {
  if (confirm('Er du sikker på du vil nulstille?')) {
    reset()
    currentStep = 1
    render()
  }
}

export function getCurrentStep() {
  return currentStep
}


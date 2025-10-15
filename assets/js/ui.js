// ui.js - UI rendering og interaktion

import { getState, setState, reset, toShareLink } from './state.js'
import { calculateAll } from './calc.js'
import { STREAMING_SERVICES } from './streams.js'

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
  const lines = state.household.lines || []
  
  container.innerHTML = `
    <div class="step-panel">
      <h2>Trin 1: Udbyder & Mobillinjer</h2>
      <p class="muted">Vælg udbyder og tilføj mobillinjer for at beregne samlerabat</p>
      
      <div class="provider-selector">
        <label for="provider-select">Vælg teleselskab:</label>
        <select id="provider-select" onchange="window.changeProvider(this.value)">
          <option value="telenor" ${state.provider === 'telenor' ? 'selected' : ''}>Telenor</option>
          <option value="telmore" ${state.provider === 'telmore' ? 'selected' : ''}>Telmore</option>
          <option value="cbb" ${state.provider === 'cbb' ? 'selected' : ''}>CBB</option>
        </select>
      </div>
      
      <div id="lines-list" class="lines-list">
        ${lines.map((line, idx) => `
          <div class="line-row" data-idx="${idx}">
            <div class="line-info">
              <strong>${line.label}</strong>
              <span class="muted">${line.planType}</span>
            </div>
            <div class="line-price">${line.monthlyPrice} kr/md</div>
            <button class="btn-icon" onclick="window.removeLine(${idx})" aria-label="Fjern linje">×</button>
          </div>
        `).join('')}
      </div>
      
      <div class="add-line-form">
        <input type="text" id="line-label" placeholder="F.eks. Mor, Far, Barn 1..." />
        <select id="line-plan">
          <option value="">Vælg abonnement</option>
          <option value="basic:199">Basic (10 GB) - 199 kr/md</option>
          <option value="standard:299">Standard (50 GB) - 299 kr/md</option>
          <option value="premium:399">Premium (Fri data) - 399 kr/md</option>
        </select>
        <button class="btn primary" onclick="window.addLine()">Tilføj linje</button>
      </div>
      
      <div class="info-box" id="provider-info">
        <strong>💡 Tips:</strong> Minimum 2 linjer giver samlerabat
      </div>
    </div>
  `
  
  updateProviderInfo()
}

function updateProviderInfo() {
  const state = getState()
  const infoBox = document.getElementById('provider-info')
  
  if (!infoBox) return
  
  const rabatter = {
    telenor: [
      '2 linjer: 100 kr/md rabat (600 kr/6 mdr)',
      '3 linjer: 150 kr/md rabat (900 kr/6 mdr)',
      '4+ linjer: 200 kr/md rabat (1200 kr/6 mdr)'
    ],
    telmore: [
      '2 linjer: 80 kr/md rabat (480 kr/6 mdr)',
      '3 linjer: 130 kr/md rabat (780 kr/6 mdr)',
      '4+ linjer: 180 kr/md rabat (1080 kr/6 mdr)'
    ],
    cbb: [
      '2 linjer: 70 kr/md rabat (420 kr/6 mdr)',
      '3 linjer: 120 kr/md rabat (720 kr/6 mdr)',
      '4+ linjer: 160 kr/md rabat (960 kr/6 mdr)'
    ]
  }
  
  const providerNames = {
    telenor: 'Telenor',
    telmore: 'Telmore',
    cbb: 'CBB'
  }
  
  const info = rabatter[state.provider] || []
  const name = providerNames[state.provider] || state.provider
  
  infoBox.innerHTML = `
    <strong>💡 ${name} samlerabat:</strong>
    <ul style="margin: 0.5rem 0 0 0; padding-left: 1.5rem;">
      ${info.map(r => `<li>${r}</li>`).join('')}
    </ul>
  `
}

function renderStep2(container) {
  const state = getState()
  const streams = state.streams || {}
  
  container.innerHTML = `
    <div class="step-panel">
      <h2>Trin 2: Streaming-tjenester</h2>
      <p class="muted">Vælg hvilke tjenester husstanden abonnerer på</p>
      
      <div class="streaming-grid">
        ${STREAMING_SERVICES.map(service => {
          const count = streams[service.id] || 0
          return `
            <div class="stream-chip ${count > 0 ? 'selected' : ''}" 
                 data-service="${service.id}"
                 onclick="window.toggleStream('${service.id}')">
              <div class="stream-icon" style="background: ${service.color}">${service.icon}</div>
              <div class="stream-label">${service.label}</div>
              <div class="stream-price">${service.monthlyPrice} kr/md</div>
              ${count > 0 ? `<div class="stream-count">${count}×</div>` : ''}
            </div>
          `
        }).join('')}
      </div>
      
      <div class="info-box">
        <strong>💡 Tips:</strong> Klik flere gange for at tilføje flere abonnementer af samme tjeneste
      </div>
    </div>
  `
}

function renderStep3(container) {
  const state = getState()
  const result = calculateAll(state)
  const { summary, meetsMinSavings, suggestions, providerBenefits, streamsData } = result
  
  container.innerHTML = `
    <div class="step-panel" id="result-panel">
      <h2>Resultat: 6-måneders oversigt</h2>
      
      <div class="result-card ${meetsMinSavings ? 'success' : 'warning'}">
        <div class="result-header">
          <h3>Total omkostning (6 måneder)</h3>
          <div class="result-total">${summary.total6m.toLocaleString('da-DK')} kr</div>
        </div>
        
        <div class="result-breakdown">
          <div class="result-row">
            <span>Mobil (før rabat):</span>
            <span>${result.baseTotal6m.toLocaleString('da-DK')} kr</span>
          </div>
          
          ${providerBenefits.totalDiscount6m > 0 ? `
            <div class="result-row discount">
              <span>${providerBenefits.providerName || state.provider} samlerabat (${providerBenefits.tier}):</span>
              <span>-${providerBenefits.totalDiscount6m.toLocaleString('da-DK')} kr</span>
            </div>
          ` : ''}
          
          <div class="result-row">
            <span>Mobil (efter rabat):</span>
            <span>${result.totalAfterDiscount6m.toLocaleString('da-DK')} kr</span>
          </div>
          
          ${streamsData.total6m > 0 ? `
            <div class="result-row">
              <span>Streaming (${streamsData.selected.length} tjenester):</span>
              <span>${streamsData.total6m.toLocaleString('da-DK')} kr</span>
            </div>
          ` : ''}
        </div>
        
        <div class="result-savings ${meetsMinSavings ? 'good' : 'bad'}">
          <strong>Total besparelse (6 mdr):</strong>
          <span class="savings-amount">${summary.totalSavings6m.toLocaleString('da-DK')} kr</span>
          ${meetsMinSavings 
            ? '<span class="badge success">✓ Minimum 500 kr opnået</span>'
            : '<span class="badge warning">⚠ Minimum 500 kr ikke nået</span>'
          }
        </div>
        
        ${!meetsMinSavings && suggestions.length > 0 ? `
          <div class="suggestions">
            <strong>Forslag til forbedring:</strong>
            <ul>
              ${suggestions.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
      
      <div class="result-actions">
        <button class="btn" onclick="window.printResult()">🖨️ Print</button>
        <button class="btn" onclick="window.shareResult()">📤 Del</button>
        <button class="btn" onclick="window.resetApp()">🔄 Ny beregning</button>
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
window.changeProvider = function(provider) {
  setState({ provider })
  render()
}

window.addLine = function() {
  const labelInput = document.getElementById('line-label')
  const planSelect = document.getElementById('line-plan')
  
  const label = labelInput.value.trim()
  const planValue = planSelect.value
  
  if (!label || !planValue) {
    alert('Udfyld både navn og abonnement')
    return
  }
  
  const [planType, price] = planValue.split(':')
  const state = getState()
  const lines = [...state.household.lines, {
    label,
    planType: planType.charAt(0).toUpperCase() + planType.slice(1),
    monthlyPrice: parseInt(price, 10)
  }]
  
  setState({ household: { lines } })
  
  labelInput.value = ''
  planSelect.value = ''
  
  render()
}

window.removeLine = function(idx) {
  const state = getState()
  const lines = state.household.lines.filter((_, i) => i !== idx)
  setState({ household: { lines } })
  render()
}

window.toggleStream = function(serviceId) {
  const state = getState()
  const streams = { ...state.streams }
  
  streams[serviceId] = (streams[serviceId] || 0) + 1
  
  // Max 5 af samme tjeneste
  if (streams[serviceId] > 5) {
    streams[serviceId] = 0
  }
  
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


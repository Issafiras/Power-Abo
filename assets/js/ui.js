// ui.js - UI rendering og interaktion

import { getState, setState, reset, toShareLink } from './state.js'
import { findBestSolution, getSmartRecommendations } from './calc.js'
import { STREAMING_SERVICES } from './streams.js'
import { PLANS } from './plans.js'
import { generateComparisonChart, generateMonthlyTrendChart, generateSavingsBreakdown } from './charts.js'
import { findTopSolutions, compareProviders } from './compare.js'

// currentStep fjernet - bruger single-page layout

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

// renderCurrentStep fjernet - bruger renderSinglePage

function renderSinglePage(container) {
  const state = getState()
  const householdSize = state.household.size || 1
  const currentMonthlyPrice = state.household.currentMonthlyPrice || 0
  const streams = state.streams || {}
  const selectedCount = Object.values(streams).filter(Boolean).length
  
  // Find resultat hvis vi har nok data
  const result = (householdSize > 0 && currentMonthlyPrice > 0) ? findBestSolution(state) : null
  const smartRecs = result ? getSmartRecommendations(state) : []

  container.innerHTML = `
    <div class="single-page-container">
      <!-- Input sektion -->
      <div class="input-section">
        <h2>🎯 Find den bedste løsning</h2>
        <p class="muted">Udfyld jeres nuværende situation - vi finder automatisk den bedste løsning</p>
        
        <div class="input-grid">
          <div class="input-group">
            <label for="household-size">
              <strong>👨‍👩‍👧‍👦 Antal personer</strong>
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
              <strong>💰 Nuværende mobil-pris</strong>
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
        </div>

        <!-- Streaming sektion -->
        <div class="streaming-section">
          <h3>📺 Streaming-tjenester</h3>
          <p class="muted">Hvilke streaming-tjenester har I i dag?</p>
          
          ${selectedCount > 0 ? `
            <div class="streaming-summary">
              <strong>${selectedCount} ${selectedCount === 1 ? 'tjeneste' : 'tjenester'} valgt</strong>
              ${selectedCount >= 2 ? `
                <span class="badge success">✓ Berettiget til CBB MIX</span>
              ` : ''}
            </div>
          ` : ''}

          <div class="streaming-grid">
            ${STREAMING_SERVICES.map(service => {
              const selected = streams[service.id] || false
              return `
                <div class="stream-chip ${selected ? 'selected' : ''}"
                     data-service="${service.id}"
                     onclick="window.toggleStreamSimple('${service.id}')">
                  <div class="stream-icon" style="background: ${service.color}">${service.icon}</div>
                  <div class="stream-info">
                    <div class="stream-label">${service.label}</div>
                    <div class="stream-desc">${service.description}</div>
                    <div class="stream-price">${service.monthlyPrice} kr/md</div>
                  </div>
                  ${selected ? '<div class="stream-badge">✓</div>' : ''}
                  ${service.cbbMix ? '<div class="cbb-mix-badge">CBB MIX</div>' : ''}
                </div>
              `
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Resultat sektion -->
      ${result ? `
        <div class="result-section">
          ${smartRecs.length > 0 ? `
            <div class="smart-recs">
              ${smartRecs.slice(0, 2).map(rec => `
                <div class="smart-rec" style="border-color: ${rec.color};">
                  <span class="rec-icon">${rec.icon}</span>
                  <div class="rec-content">
                    <strong>${rec.title}</strong>
                    <p class="muted">${rec.description}</p>
                  </div>
                  ${rec.savings ? `<div class="rec-savings">${rec.savings}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          <h2>
            ${result.recommended.details.isCbbMix ? '🎬 CBB MIX Løsning' : `Jeres løsning: ${result.provider.name}`}
            ${result.recommended.details.isCbbMix ? '<span class="badge" style="background: var(--good); color: white; margin-left: 1rem;">STREAMING INKL.</span>' : ''}
          </h2>
          <p class="muted">Optimal løsning for ${state.household.size} ${state.household.size === 1 ? 'person' : 'personer'}</p>

          <!-- Sammenligning: Nu vs. Vores løsning -->
          <div class="comparison-container">
            <div class="comparison-card current">
              <h3>I dag</h3>
              <div class="comparison-price">${result.current.monthly.toLocaleString('da-DK')} kr/md</div>
              <div class="comparison-breakdown">
                <div class="comparison-row">
                  <span>Mobil:</span>
                  <span>${result.current.mobileMonthly.toLocaleString('da-DK')} kr/md</span>
                </div>
                <div class="comparison-row">
                  <span>Streaming:</span>
                  <span>${result.current.streamingMonthly.toLocaleString('da-DK')} kr/md</span>
                </div>
              </div>
              <div class="comparison-total">
                <strong>Total (6 mdr):</strong>
                <span>${result.current.total6m.toLocaleString('da-DK')} kr</span>
              </div>
            </div>

            <div class="comparison-arrow ${result.savings.total6m > 0 ? 'saving' : ''}">
              ${result.savings.total6m > 0 ? '→' : '='}
            </div>

            <div class="comparison-card recommended ${result.savings.total6m > 0 ? 'highlight' : ''}">
              <h3>Vores løsning - ${result.provider.name}</h3>
              <div class="comparison-price">${result.recommended.monthly.toLocaleString('da-DK')} kr/md</div>
              <div class="comparison-breakdown">
                ${result.recommended.details.isFamilyPackage ? `
                  <div class="comparison-row">
                    <span>1× ${result.recommended.details.streamingPlan.brand} ${result.recommended.details.streamingPlan.name}:</span>
                    <span>${result.recommended.details.streamingPlan.price} kr/md</span>
                  </div>
                  <div class="comparison-row">
                    <span>${state.household.size - 1}× ${result.recommended.details.nonStreamingPlan.brand} ${result.recommended.details.nonStreamingPlan.name}:</span>
                    <span>${result.recommended.details.nonStreamingPlan.price * (state.household.size - 1)} kr/md</span>
                  </div>
                  ${result.recommended.details.familyDiscount > 0 ? `
                    <div class="comparison-row discount">
                      <span>Telenor familiepris rabat:</span>
                      <span>-${result.recommended.details.familyDiscount} kr/md</span>
                    </div>
                  ` : ''}
                ` : `
                  <div class="comparison-row">
                    <span>${state.household.size}× ${result.recommended.details.plan.brand} ${result.recommended.details.plan.name}:</span>
                    <span>${result.recommended.mobileBeforeDiscount.toLocaleString('da-DK')} kr/md</span>
                  </div>
                `}
                ${result.hasStreamingIncluded ? `
                  <div class="comparison-row" style="color: var(--good);">
                    <span>Streaming inkluderet ✓</span>
                    <span>0 kr/md</span>
                  </div>
                ` : result.recommended.streamingMonthly > 0 ? `
                  <div class="comparison-row">
                    <span>Streaming (ikke inkl.):</span>
                    <span>${result.recommended.streamingMonthly.toLocaleString('da-DK')} kr/md</span>
                  </div>
                ` : ''}
              </div>
              <div class="comparison-total">
                <strong>Total (6 mdr):</strong>
                <span>${result.recommended.total6m.toLocaleString('da-DK')} kr</span>
              </div>
            </div>
          </div>

          <!-- Besparelse -->
          <div class="savings-card ${result.savings.total6m > 0 ? 'positive' : 'neutral'}">
            ${result.savings.total6m > 0 ? `
              <div class="savings-header">
                <span class="savings-icon">🎉</span>
                <h3>I sparer ${result.savings.monthly.toLocaleString('da-DK')} kr/md</h3>
              </div>
              <div class="savings-total">
                <strong>Total besparelse over 6 måneder:</strong>
                <span class="savings-amount">${result.savings.total6m.toLocaleString('da-DK')} kr</span>
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
            ${result.hasStreamingIncluded && result.current.streamingMonthly > 0 ? `
              <div style="margin-top: 1rem; padding: 1rem; background: rgba(16, 185, 129, 0.1); border-radius: var(--radius); border: 1px solid var(--good);">
                <strong style="color: var(--good);">💰 Bonus besparelse:</strong>
                <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">
                  Streaming er inkluderet! I sparer yderligere ${result.current.streamingMonthly.toLocaleString('da-DK')} kr/md
                  (${(result.current.streamingMonthly * 6).toLocaleString('da-DK')} kr over 6 mdr)
                </p>
              </div>
            ` : ''}
          </div>

          <!-- Kontant rabat -->
          <div class="cash-rebate-section">
            <div class="section-header">
              <h3>💰 Kontant rabat ved skifte (valgfrit)</h3>
              <button class="btn-toggle ${state.cashRebate > 0 ? 'active' : ''}" onclick="window.toggleRebateInput()">
                ${state.cashRebate > 0 ? 'Skjul' : 'Tilføj rabat'}
              </button>
            </div>
            
            <div id="rebate-input" class="rebate-input" style="display: ${state.cashRebate > 0 ? 'block' : 'none'}">
              <div class="input-group">
                <label for="cash-rebate">
                  <strong>Engangsbeløb ved skifte</strong>
                  <span class="muted">Dette beløb trækkes fra den samlede 6-måneders pris</span>
                </label>
                <div class="price-input">
                  <input 
                    type="number" 
                    id="cash-rebate" 
                    min="0" 
                    step="50"
                    value="${state.cashRebate || 0}"
                    onchange="window.updateCashRebate(this.value)"
                    placeholder="F.eks. 500"
                  />
                  <span class="price-suffix">kr</span>
                </div>
              </div>
              
              ${state.cashRebate > 0 ? `
                <div class="rebate-impact">
                  <div class="rebate-row">
                    <span>Total før rabat:</span>
                    <span>${result.recommended.total6m.toLocaleString('da-DK')} kr</span>
                  </div>
                  <div class="rebate-row discount">
                    <span>Kontant rabat:</span>
                    <span>-${state.cashRebate.toLocaleString('da-DK')} kr</span>
                  </div>
                  <div class="rebate-row total">
                    <span><strong>Total efter rabat:</strong></span>
                    <span><strong>${(result.recommended.total6m - state.cashRebate).toLocaleString('da-DK')} kr</strong></span>
                  </div>
                  <div class="rebate-row savings">
                    <span><strong>Total besparelse:</strong></span>
                    <span class="savings-highlight"><strong>${(result.savings.total6m + state.cashRebate).toLocaleString('da-DK')} kr</strong></span>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Visualiseringer og sammenligning -->
          <div class="advanced-actions">
            <button class="btn ${state.showCharts ? 'active' : ''}" onclick="window.toggleCharts()">
              📊 ${state.showCharts ? 'Skjul' : 'Vis'} grafer
            </button>
            <button class="btn ${state.showComparison ? 'active' : ''}" onclick="window.toggleComparison()">
              🔍 ${state.showComparison ? 'Skjul' : 'Sammenlign'} udbydere
            </button>
          </div>
          
          ${state.showCharts ? `
            <div class="charts-section">
              <h3>📊 Visualiseringer</h3>
              
              <div class="chart-grid">
                <div class="chart-card">
                  <h4>Sammenligning (6 måneder)</h4>
                  ${generateComparisonChart(result.current.total6m, result.recommended.total6m, result.savings.total6m)}
                </div>
                
                <div class="chart-card">
                  <h4>Månedlig trend</h4>
                  ${generateMonthlyTrendChart(result.current.monthly, result.recommended.monthly)}
                </div>
              </div>
              
              ${result.hasStreamingIncluded && result.current.streamingMonthly > 0 ? `
                <div class="chart-card">
                  <h4>Besparelse fordeling</h4>
                  ${generateSavingsBreakdown(
                    result.savings.monthly, 
                    result.hasStreamingIncluded ? result.current.streamingMonthly : 0,
                    state.cashRebate / 6
                  )}
                </div>
              ` : ''}
            </div>
          ` : ''}
          
          ${state.showComparison ? `
            <div class="comparison-section">
              <h3>🔍 Sammenlign alle udbydere</h3>
              <p class="muted">Se hvordan Telenor, Telmore og CBB står i forhold til hinanden</p>
              
              <div id="provider-comparison" class="provider-comparison-grid">
                ${renderProviderComparison(state)}
              </div>
            </div>
          ` : ''}
        </div>
      ` : `
        <div class="result-section">
          <div class="info-box">
            <strong>💡 Udfyld informationen ovenfor</strong>
            <p>Indtast antal personer og nuværende pris for at se jeres optimale løsning!</p>
          </div>
        </div>
      `}
    </div>
  `
}

// renderStep2 fjernet - integreret i renderSinglePage

// renderStep3 fjernet - integreret i renderSinglePage

function renderProviderComparison(state) {
  const selectedStreams = STREAMING_SERVICES.filter(s => state.streams[s.id])
  const comparison = compareProviders(state.household.size, state.household.currentMonthlyPrice, selectedStreams)
  
  return comparison.map(prov => `
    <div class="provider-card ${prov.rank === 1 ? 'winner' : ''}" style="border-color: ${prov.color}">
      ${prov.rank === 1 ? '<div class="winner-badge">🏆 BEDST</div>' : ''}
      ${prov.rank === 2 ? '<div class="rank-badge">🥈 #2</div>' : ''}
      ${prov.rank === 3 ? '<div class="rank-badge">🥉 #3</div>' : ''}
      
      <div class="provider-header" style="background: linear-gradient(135deg, ${prov.color}, rgba(255,255,255,0.1))">
        <h4>${prov.provider}</h4>
      </div>
      
      <div class="provider-body">
        <div class="provider-plan">
          <strong>${prov.solution.plan?.name || 'Familie-pakke'}</strong>
          ${prov.solution.plan?.introPrice ? `
            <div class="intro-price">Intro: ${prov.solution.plan.introPrice} kr/md</div>
          ` : ''}
        </div>
        
        <div class="provider-price">
          ${prov.solution.totalMonthly.toLocaleString('da-DK')} kr/md
        </div>
        
        <div class="provider-savings ${prov.solution.savingsMonthly > 0 ? 'positive' : 'negative'}">
          ${prov.solution.savingsMonthly > 0 ? '↓' : '↑'} 
          ${Math.abs(prov.solution.savingsMonthly).toLocaleString('da-DK')} kr/md
        </div>
        
        <div class="provider-total">
          <strong>6 mdr:</strong> ${prov.solution.total6m.toLocaleString('da-DK')} kr
        </div>
        
        <div class="provider-features">
          ${prov.solution.hasStreaming ? '<span class="feature-badge">📺 Streaming inkl.</span>' : ''}
          ${prov.solution.type === 'family' ? '<span class="feature-badge">👨‍👩‍👧‍👦 Familie</span>' : ''}
          ${prov.solution.plan?.cbbMix ? '<span class="feature-badge">🎬 CBB MIX</span>' : ''}
        </div>
        
        <div class="provider-earnings">
          <span class="muted">Indtjening:</span> ${prov.solution.earnings.toLocaleString('da-DK')} kr
        </div>
      </div>
    </div>
  `).join('')
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

window.toggleRebateInput = function() {
  const state = getState()
  if (state.cashRebate > 0) {
    setState({ cashRebate: 0 })
  }
  render()
}

window.updateCashRebate = function(value) {
  const rebate = parseInt(value, 10) || 0
  setState({ cashRebate: rebate })
  render()
}

window.toggleCharts = function() {
  const state = getState()
  setState({ showCharts: !state.showCharts })
  render()
}

window.toggleComparison = function() {
  const state = getState()
  setState({ showComparison: !state.showComparison })
  render()
}

// Legacy - ikke brugt i single-page
export function getCurrentStep() {
  return 1
}


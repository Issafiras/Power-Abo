// POWER Calculator v10.0 - Main Application Logic
import { getPlans, getStreamingServices, getBrands, getStreamingCategories } from './database.js';

export const App = (()=>{
  // Database references
  let PLANS = [];
  let STREAMING_SERVICES = [];
  let BRANDS = {};
  let STREAMING_CATEGORIES = {};

  function loadFallbackData() {
    console.log('⚠️ Using fallback embedded data');
    
    // Fallback PLANS data - will be set below
    PLANS = [
    // Telenor pakker
    {id:"ten-20", brand:"Telenor", name:"20 GB", dataGB:20, unlimited:false, price:149, earnings:700, features:["5G", "eSIM", "EU Roaming", "Familie"], color:"#38bdf8"},
    {id:"ten-70", brand:"Telenor", name:"70 GB", dataGB:70, unlimited:false, price:199, earnings:900, features:["5G", "eSIM", "EU Roaming", "Familie"], color:"#38bdf8"},
    {id:"ten-120", brand:"Telenor", name:"120 GB", dataGB:120, unlimited:false, price:239, earnings:1200, features:["5G", "eSIM", "EU Roaming", "Familie"], color:"#38bdf8"},
    {id:"ten-unl", brand:"Telenor", name:"Fri data", dataGB:Infinity, unlimited:true, price:289, earnings:1300, features:["5G", "eSIM", "EU Roaming", "Familie"], color:"#38bdf8"},
    
    // Telmore pakker
    {id:"tel-30", brand:"Telmore", name:"30 GB", dataGB:30, unlimited:false, price:129, earnings:400, features:["5G", "EU Roaming"], color:"#ff8b4a"},
    {id:"tel-70", brand:"Telmore", name:"70 GB", dataGB:70, unlimited:false, price:149, earnings:700, features:["5G", "EU Roaming"], color:"#ff8b4a", introPrice:74, introMonths:3},
    {id:"tel-60", brand:"Telmore", name:"60 GB", dataGB:60, unlimited:false, price:169, earnings:700, features:["5G", "EU Roaming"], color:"#ff8b4a"},
    {id:"tel-100", brand:"Telmore", name:"100 GB", dataGB:100, unlimited:false, price:219, earnings:700, features:["5G", "EU Roaming", "HBO Max"], color:"#ff8b4a", introPrice:99, introMonths:1},
    {id:"tel-unl", brand:"Telmore", name:"Fri data", dataGB:Infinity, unlimited:true, price:229, earnings:700, features:["5G", "EU Roaming"], color:"#ff8b4a"},
    {id:"tel-play-100", brand:"Telmore", name:"100 GB + 2 tjenester", dataGB:100, unlimited:false, price:299, earnings:1000, features:["5G", "EU Roaming", "Streaming inkl."], color:"#ff8b4a", introPrice:99, introMonths:1},
    {id:"tel-play-3", brand:"Telmore", name:"Fri data + 3 tjenester", dataGB:Infinity, unlimited:true, price:399, earnings:1100, features:["5G", "EU Roaming", "Streaming (3 valgfrie)"], color:"#ff8b4a", introPrice:99, introMonths:1},
    {id:"tel-play-4", brand:"Telmore", name:"Fri data + 4 tjenester", dataGB:Infinity, unlimited:true, price:449, earnings:1100, features:["5G", "EU Roaming", "Streaming (4 valgfrie)"], color:"#ff8b4a", introPrice:99, introMonths:1},
    {id:"tel-play-5", brand:"Telmore", name:"Fri data + 5 tjenester", dataGB:Infinity, unlimited:true, price:499, earnings:1100, features:["5G", "EU Roaming", "Streaming (5 valgfrie)"], color:"#ff8b4a", introPrice:99, introMonths:1},
                {id:"tel-premium", brand:"Telmore", name:"Premium", dataGB:Infinity, unlimited:true, price:559, earnings:1100, features:["5G", "EU Roaming (94 GB)", "8 Streaming tjenester", "Premium"], color:"#ff8b4a"},
                {id:"tel-ultimate", brand:"Telmore", name:"Ultimate", dataGB:Infinity, unlimited:true, price:599, earnings:1100, features:["5G", "EU Roaming (94 GB)", "9 Streaming tjenester", "Ultimate"], color:"#ff8b4a"},
    
    // CBB pakker
    {id:"cbb-60", brand:"CBB", name:"60 GB", dataGB:60, unlimited:false, price:109, earnings:300, features:["5G", "EU Roaming"], color:"#a78bfa"},
    {id:"cbb-200", brand:"CBB", name:"200 GB", dataGB:200, unlimited:false, price:129, earnings:500, features:["5G", "EU Roaming"], color:"#a78bfa"},
    {id:"cbb-500", brand:"CBB", name:"500 GB", dataGB:500, unlimited:false, price:149, earnings:800, features:["5G", "EU Roaming"], color:"#a78bfa"},
    {id:"cbb-100", brand:"CBB", name:"100 GB (World-data)", dataGB:100, unlimited:false, price:199, earnings:800, features:["5G", "EU Roaming"], color:"#a78bfa"}
  ];

    ];
    
    // Fallback STREAMING_SERVICES data
    STREAMING_SERVICES = [
    {id:"netflix", name:"Netflix", price:139, icon:"<div class='streaming-logo netflix'>N</div>", color:"#e50914"},
    {id:"viaplay", name:"Viaplay", price:149, icon:"<div class='streaming-logo viaplay'>viaplay</div>", color:"#00d4aa"},
    {id:"hbo", name:"HBO Max", price:119, icon:"<div class='streaming-logo hbo'>HBO<br>max</div>", color:"#673ab7"},
    {id:"tv2play", name:"TV2 Play", price:99, icon:"<div class='streaming-logo tv2play'>TV2<br>Play</div>", color:"#ff6b35"},
    {id:"saxo", name:"Saxo", price:79, icon:"<div class='streaming-logo saxo'>saxo</div>", color:"#c41e3a"},
    {id:"disney", name:"Disney+", price:129, icon:"<div class='streaming-logo disney'>Disney+</div>", color:"#0066cc"},
    {id:"skyshowtime", name:"SkyShowtime", price:89, icon:"<div class='streaming-logo skyshowtime'>skySHO</div>", color:"#6b46c1"},
    {id:"prime", name:"Prime Video", price:59, icon:"<div class='streaming-logo prime'>prime</div>", color:"#0f7ae5"},
    {id:"musik", name:"Musik tjeneste", price:109, icon:"<div class='streaming-logo musik'>🎵</div>", color:"#1e40af"},
    {
      id:"cbbmix", 
      name:"CBB MIX", 
      type:"bundle",
      baseRequirement:"Kræver CBB mobilabonnement (min. 99 kr./md.) eller internet",
      pricing: {
        2: 160,
        3: 210,
        4: 260,
        5: 310,
        6: 360,
        7: 410,
        8: 460
      },
      price:160, // Default til 2 tjenester
      selectedCount: 2, // Default antal tjenester
      includedServices: [
        "Netflix Standard (opgradering til Premium mulig)",
        "TV2 Play Basis Partner uden reklamer (inkl. CMore + SF Kids, opgradering til Favorit/Favorit + Sport mulig)",
        "Viaplay Film & Serier",
        "HBO Max Standard (ingen sport)",
        "Podimo Premium",
        "Mofibo 20 timer (opgradering til 50 eller 100 timer mulig)",
        "Nordisk Film+",
        "Deezer Premium (opgradering til Family mulig)"
      ],
      icon:"<div class='streaming-logo cbbmix' style='background: linear-gradient(135deg, #6d28d9, #a78bfa); font-size: 10px; font-weight: 700;'>CBB<br>MIX</div>", 
      color:"linear-gradient(135deg, #6d28d9, #a78bfa)"
    }
    ];
  }

  const GUIDE_STEPS = [
    {
      title: "1. Analyser kundens nuværende situation",
      description: "Start med at forstå hvad kunden betaler i dag. Indtast deres nuværende mobiludgifter og vælg hvilke streaming-tjenester de har.",
      actions: [
        { text: "Indtast mobiludgifter", action: () => qs('#curTotal').focus() },
        { text: "Vælg streaming", action: () => qs('#streamingGrid').scrollIntoView({behavior: 'smooth'}) }
      ]
    },
    {
      title: "2. Find den bedste løsning",
      description: "Filtrer abonnementer efter behov og vælg de bedste løsninger til kunden. Du kan filtrere på udbyder, data-mængde og funktioner.",
      actions: [
        { text: "Filtrer abonnementer", action: () => qs('#need').focus() },
        { text: "Vælg abonnement", action: () => qs('#plans').scrollIntoView({behavior: 'smooth'}) }
      ]
    },
    {
      title: "3. Juster tilbuddet (valgfrit)",
      description: "Rabat er skjult som standard. Brug knappen 'Rabat skjult' i toppen for at låse op, hvis du vil justere med kontant rabat eller auto-justering.",
      actions: [
        { text: "Vis rabat-felt", action: () => { if(!state.rebateVisible) qs('#toggleRebate').click(); qs('#rebate').scrollIntoView({behavior:'smooth'}); } },
        { text: "Indtast rabat", action: () => { if(!state.rebateVisible) qs('#toggleRebate').click(); qs('#rebate').focus(); } },
        { text: "Auto-justér rabat", action: () => { if(!state.rebateVisible) qs('#toggleRebate').click(); qs('#autoRebate').click(); } }
      ]
    },
    {
      title: "4. Præsenter tilbuddet",
      description: "Brug præsentationsvisningen til at vise kunden deres besparelse på en professionel måde.",
      actions: [
        { text: "Åbn præsentation", action: () => qs('#presentBtn').click() }
      ]
    },
  ];

  const state = { 
    prices:{}, 
    cart:[], 
    autoAdjust:false, 
    selectedStreaming:new Set(),
    selectedProvider:'any',
    guideStep: 0,
    guideCompleted: false,
    rebateVisible: false,
    rebateLocked: false,
    // Advanced features
    theme: 'dark',
    searchQuery: '',
    customerHistory: [],
    // New advanced features for v9.2
    analytics: {
      totalSavings: 0,
      averageSavings: 0,
      conversionRate: 0,
      popularPlans: [],
      customerSatisfaction: 0
    },
    recommendations: [],
    comparisonData: {},
    exportHistory: [],
    sessionStart: new Date(),
    customerInsights: {
      totalCustomers: 0,
      averageAge: 0,
      preferredProviders: [],
      commonNeeds: []
    },
    // Version 8.1 features
    aiProfiles: [],
    notifications: [],
    searchHistory: [],
    customerProfiles: [],
    chartData: {
      savings: [],
      trends: []
    }
  };

  // Helpers with performance optimization
  const qs=(s,el=document)=>el.querySelector(s);
  const qsa=(s,el=document)=>Array.from(el.querySelectorAll(s));
  const kr = n => isFinite(n)? `${n.toLocaleString('da-DK')} kr` : '—';
  
  // DOM element cache for performance
  const domCache = {};
  const cachedQs = (selector) => {
    if (!domCache[selector]) {
      domCache[selector] = qs(selector);
    }
    return domCache[selector];
  };
  
  // Debounce function for input events
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // UX Enhancement: Enhanced Toast System
  function showToast(message, type = 'info', duration = 4000, title = null) {
    const container = qs('#toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✓' : 
                type === 'error' ? '✕' : 
                type === 'warning' ? '⚠' : 'ℹ';
    
    toast.innerHTML = `
      <div class="toast-header">
        <div class="toast-icon">${icon}</div>
        <div class="toast-title">${title || getToastTitle(type)}</div>
        <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
      <div class="toast-message">${message}</div>
      <div class="toast-progress" style="width: 100%; animation: toast-progress ${duration}ms linear forwards;"></div>
    `;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }
  
  function getToastTitle(type) {
    const titles = {
      success: 'Succes!',
      error: 'Fejl!',
      warning: 'Advarsel!',
      info: 'Information'
    };
    return titles[type] || 'Information';
  }
  
  // UX Enhancement: Form Validation
  function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      const formGroup = input.closest('.form-group');
      if (!formGroup) return;
      
      // Remove existing validation classes
      formGroup.classList.remove('error', 'success');
      const existingError = formGroup.querySelector('.form-error');
      const existingSuccess = formGroup.querySelector('.form-success');
      if (existingError) existingError.remove();
      if (existingSuccess) existingSuccess.remove();
      
      if (!input.value.trim()) {
        formGroup.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.innerHTML = '⚠️ Dette felt er påkrævet';
        formGroup.appendChild(errorDiv);
        isValid = false;
      } else {
        formGroup.classList.add('success');
        const successDiv = document.createElement('div');
        successDiv.className = 'form-success';
        successDiv.innerHTML = '✓ Gyldig indtastning';
        formGroup.appendChild(successDiv);
      }
    });
    
    return isValid;
  }
  
  // UX Enhancement: Loading States
  function showLoading(element, text = 'Indlæser...') {
    if (!element) return;
    
    element.classList.add('loading');
    element.setAttribute('data-original-content', element.innerHTML);
    element.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; padding: 20px; text-align: center;">
        <div style="width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid var(--brand); border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <span>${text}</span>
      </div>
    `;
  }
  
  function hideLoading(element) {
    if (!element) return;
    
    element.classList.remove('loading');
    const originalContent = element.getAttribute('data-original-content');
    if (originalContent) {
      element.innerHTML = originalContent;
      element.removeAttribute('data-original-content');
    }
  }
  
  // UX Enhancement: Smooth Scrolling
  function smoothScrollTo(element, offset = 0) {
    if (!element) return;
    
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
  
  // UX Enhancement: Keyboard Navigation
  function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Tab navigation enhancement
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });
    
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });
    
    // Escape key handling
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Close any open modals
        const openModals = qsa('.modal.open, .slide-container.active');
        openModals.forEach(modal => {
    if (false) {
            // slideContainer fjernet
          } else {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
          }
        });
      }
    });
  }
  
  // UX Enhancement: Touch Gestures
  function setupTouchGestures() {
    let startX = 0;
    let startY = 0;
    
    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
      if (!startX || !startY) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const diffX = startX - endX;
      const diffY = startY - endY;
      
      // Swipe left/right detection
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          // Swipe left
          handleSwipeLeft();
        } else {
          // Swipe right
          handleSwipeRight();
        }
      }
      
      startX = 0;
      startY = 0;
    });
  }
  
  function handleSwipeLeft() {
    // Handle swipe left gesture
    const activeSlide = qsa('.slide').find(slide => slide.style.display !== 'none');
    if (activeSlide) {
      const currentSlide = parseInt(activeSlide.id.replace('slide', ''));
      if (currentSlide < 5) {
        nextSlide(currentSlide + 1);
      }
    }
  }
  
  function handleSwipeRight() {
    // Handle swipe right gesture
    const activeSlide = qsa('.slide').find(slide => slide.style.display !== 'none');
    if (activeSlide) {
      const currentSlide = parseInt(activeSlide.id.replace('slide', ''));
      if (currentSlide > 1) {
        prevSlide(currentSlide - 1);
      }
    }
  }
  
  // UX Enhancement: Performance Monitoring
  function measurePerformance(name, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  }
  
  // UX Enhancement: Error Handling
  function handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    showToast(`Der opstod en fejl: ${error.message}`, 'error', 6000, 'Fejl');
  }
  
  // UX Enhancement: Accessibility
  function setupAccessibility() {
    // Add ARIA labels to interactive elements
    qsa('.btn').forEach(btn => {
      if (!btn.getAttribute('aria-label') && !btn.textContent.trim()) {
        btn.setAttribute('aria-label', 'Knap');
      }
    });
    
    // Add role attributes
    qsa('.card').forEach(card => {
      card.setAttribute('role', 'article');
    });
    
    // Add live regions for dynamic content
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    document.body.appendChild(liveRegion);
    
    // Function to announce changes
    window.announceChange = (message) => {
      liveRegion.textContent = message;
      setTimeout(() => liveRegion.textContent = '', 1000);
    };
  }
  
  // UX Enhancement: Onboarding
  function showOnboardingTooltip() {
    const startBtn = qs('#slideFlowBtn');
    if (!startBtn) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'onboarding-tooltip';
    tooltip.innerHTML = `
      <div class="tooltip-content">
        <div class="tooltip-header">
          <span class="tooltip-icon">🚀</span>
          <span class="tooltip-title">Kom i gang!</span>
          <button class="tooltip-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="tooltip-body">
          <p>Brug værktøjet nedenfor til at finde den perfekte løsning.</p>
        </div>
        <div class="tooltip-footer">
          <button class="tooltip-btn secondary" onclick="this.closest('.onboarding-tooltip').remove(); localStorage.setItem('power-onboarding-shown', 'true');">Spring over</button>
          <button class="tooltip-btn primary" onclick="this.closest('.onboarding-tooltip').remove(); localStorage.setItem('power-onboarding-shown', 'true');">Fortsæt</button>
        </div>
      </div>
      <div class="tooltip-arrow"></div>
    `;
    
    document.body.appendChild(tooltip);
    
    // Position tooltip
    const rect = startBtn.getBoundingClientRect();
    tooltip.style.position = 'fixed';
    tooltip.style.top = (rect.bottom + 10) + 'px';
    tooltip.style.left = (rect.left + rect.width / 2) + 'px';
    tooltip.style.transform = 'translateX(-50%)';
    tooltip.style.zIndex = '10000';
    
    // Animate in
    setTimeout(() => {
      tooltip.style.opacity = '1';
      tooltip.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);
  }

  function savePrices(){ localStorage.setItem('power-plan-prices', JSON.stringify(state.prices)); }
  function saveCart(){ localStorage.setItem('power-cart', JSON.stringify(state.cart)); }
  function saveStreaming(){ localStorage.setItem('power-streaming', JSON.stringify(Array.from(state.selectedStreaming))); }
  function saveCustomerHistory(){ localStorage.setItem('power-customer-history', JSON.stringify(state.customerHistory)); }
  function saveTheme(){ localStorage.setItem('power-theme', state.theme); }
  function saveAnalytics(){ localStorage.setItem('power-analytics', JSON.stringify(state.analytics)); }
  function saveRecommendations(){ localStorage.setItem('power-recommendations', JSON.stringify(state.recommendations)); }
  function saveComparisonData(){ localStorage.setItem('power-comparison', JSON.stringify(state.comparisonData)); }
  function saveExportHistory(){ localStorage.setItem('power-export-history', JSON.stringify(state.exportHistory)); }
  function saveCustomerInsights(){ localStorage.setItem('power-insights', JSON.stringify(state.customerInsights)); }
  
  function loadCart(){ try{ state.cart = JSON.parse(localStorage.getItem('power-cart')||'[]'); }catch(e){ state.cart=[]; } }
  function loadStreaming(){ 
    try{ 
      const saved = JSON.parse(localStorage.getItem('power-streaming')||'[]'); 
      state.selectedStreaming = new Set(saved);
    }catch(e){ state.selectedStreaming = new Set(); } 
  }
  function loadCustomerHistory(){ 
    try{ 
      state.customerHistory = JSON.parse(localStorage.getItem('power-customer-history')||'[]'); 
    }catch(e){ 
      state.customerHistory = []; 
    } 
  }
  function loadTheme(){ 
    state.theme = localStorage.getItem('power-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
  }
  function loadAnalytics(){ 
    try{ 
      const saved = JSON.parse(localStorage.getItem('power-analytics')||'{}');
      state.analytics = {
        totalSavings: saved.totalSavings || 0,
        averageSavings: saved.averageSavings || 0,
        conversionRate: saved.conversionRate || 0,
        popularPlans: saved.popularPlans || [],
        customerSatisfaction: saved.customerSatisfaction || 0
      };
    }catch(e){ 
      state.analytics = {
        totalSavings: 0,
        averageSavings: 0,
        conversionRate: 0,
        popularPlans: [],
        customerSatisfaction: 0
      }; 
    } 
  }
  function loadRecommendations(){ 
    try{ 
      state.recommendations = JSON.parse(localStorage.getItem('power-recommendations')||'[]'); 
    }catch(e){ 
      state.recommendations = []; 
    } 
  }
  function loadComparisonData(){ 
    try{ 
      state.comparisonData = JSON.parse(localStorage.getItem('power-comparison')||'{}'); 
    }catch(e){ 
      state.comparisonData = {}; 
    } 
  }
  function loadExportHistory(){ 
    try{ 
      state.exportHistory = JSON.parse(localStorage.getItem('power-export-history')||'[]'); 
    }catch(e){ 
      state.exportHistory = []; 
    } 
  }
  function loadCustomerInsights(){ 
    try{ 
      state.customerInsights = JSON.parse(localStorage.getItem('power-insights')||'{}'); 
    }catch(e){ 
      state.customerInsights = {
        totalCustomers: 0,
        averageAge: 0,
        preferredProviders: [],
        commonNeeds: []
      }; 
    } 
  }

  // Guide functions
  function renderGuide(){
    const stepsEl = qs('#guideSteps');
    const progressEl = qs('#guideProgress');
    
    // Render steps
    stepsEl.innerHTML = GUIDE_STEPS.map((step, index) => {
      const isActive = index === state.guideStep;
      const isCompleted = index < state.guideStep;
      const statusClass = isCompleted ? 'completed' : (isActive ? 'active' : '');
      
      return `
        <div class="guide-step ${statusClass}" data-step="${index}">
          <div class="step-number">${isCompleted ? '✓' : index + 1}</div>
          <div class="step-content">
            <div class="step-title">${step.title}</div>
            <div class="step-description">${step.description}</div>
            ${step.actions ? `
              <div class="step-actions">
                ${step.actions.map(action => `
                  <button class="step-btn ${isActive ? 'primary' : ''}" onclick="(${action.action.toString()})()">
                    ${action.text}
                  </button>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
    
    // Render progress dots
    progressEl.innerHTML = GUIDE_STEPS.map((_, index) => {
      const isActive = index === state.guideStep;
      const isCompleted = index < state.guideStep;
      const statusClass = isCompleted ? 'completed' : (isActive ? 'active' : '');
      return `<div class="progress-dot ${statusClass}" data-step="${index}"></div>`;
    }).join('');
    
    // Update navigation buttons
    qs('#prevStep').disabled = state.guideStep === 0;
    qs('#nextStep').textContent = state.guideStep === GUIDE_STEPS.length - 1 ? 'Afslut guide' : 'Næste →';
  }

  function openGuide(){
    qs('#guide').classList.add('open');
    qs('#guide').setAttribute('aria-hidden', 'false');
    renderGuide();
  }

  function closeGuide(){
    qs('#guide').classList.remove('open');
    qs('#guide').setAttribute('aria-hidden', 'true');
  }

  function nextGuideStep(){
    if(state.guideStep < GUIDE_STEPS.length - 1){
      state.guideStep++;
      renderGuide();
    } else {
      // Complete guide
      state.guideCompleted = true;
      localStorage.setItem('power-guide-completed', 'true');
      closeGuide();
      setTimeout(() => {
        alert('🎉 Tillykke! Du har gennemført guiden. Du er nu klar til at hjælpe kunder med POWER løsninger!');
      }, 100);
    }
  }

  function prevGuideStep(){
    if(state.guideStep > 0){
      state.guideStep--;
      renderGuide();
    }
  }

  // Advanced Functions
  
  // Toast Notifications
  function showToast(message, type = 'info', duration = 3000) {
    const container = qs('#toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center">
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; color:inherit; cursor:pointer; font-size:18px">×</button>
      </div>
    `;
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // Smart Search
  function setupSearch() {
    const searchInput = qs('#searchInput');
    const suggestions = qs('#searchSuggestions');
    const clearBtn = qs('#clearSearch');
    
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      state.searchQuery = query;
      
      // Show/hide clear button
      if (query.length > 0) {
        clearBtn.style.display = 'block';
      } else {
        clearBtn.style.display = 'none';
      }
      
      if (query.length < 2) {
        suggestions.style.display = 'none';
        renderPlans(); // Clear search results
        return;
      }
      
      // Create search suggestions
      const searchTerms = [];
      PLANS.forEach(plan => {
        searchTerms.push(`${plan.brand} ${plan.name}`);
        searchTerms.push(`${plan.brand} ${plan.dataGB}GB`);
        searchTerms.push(`${plan.brand} ${plan.price}kr`);
        plan.features.forEach(feature => {
          searchTerms.push(feature);
        });
      });
      
      const matches = searchTerms.filter(term => 
        term.toLowerCase().includes(query)
      ).slice(0, 5);
      
      if (matches.length > 0) {
        suggestions.innerHTML = matches.map(match => 
          `<div class="search-suggestion" onclick="selectSearchSuggestion('${match}')">${match}</div>`
        ).join('');
        suggestions.style.display = 'block';
      } else {
        suggestions.style.display = 'none';
      }
      
      // Update plans display
      renderPlans();
      
      // Add to search history
      addToSearchHistory(query);
    });
    
    // Clear search button
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      suggestions.style.display = 'none';
      clearBtn.style.display = 'none';
      renderPlans();
      searchInput.focus();
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
        suggestions.style.display = 'none';
      }
    });
  }
  
  // Function to handle search suggestion selection
  function selectSearchSuggestion(match) {
    qs('#searchInput').value = match;
    state.searchQuery = match.toLowerCase();
    qs('#searchSuggestions').style.display = 'none';
    renderPlans();
  }



  // Theme Toggle
  function toggleTheme() {
    console.log('Toggle theme called, current theme:', state.theme);
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    qs('#themeBtn').textContent = state.theme === 'dark' ? '🌙' : '☀️';
    saveTheme();
    showToast(`Skiftet til ${state.theme === 'dark' ? 'mørkt' : 'lyst'} tema`, 'info');
    console.log('Theme changed to:', state.theme);
  }

  // Keyboard Shortcuts
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'r':
            e.preventDefault();
            qs('#resetBtn').click();
            break;
          case 'p':
            e.preventDefault();
            qs('#presentBtn').click();
            break;
          case 't':
            e.preventDefault();
            toggleTheme();
            break;
          case 'g':
            e.preventDefault();
            openGuide();
            break;
          case 'a':
            e.preventDefault();
            openAdvancedModal('analytics');
            break;
        }
      } else if (e.key === 'Escape') {
        // Close any open modals
        if (qs('#present').classList.contains('open')) {
          closePresent();
        }
        if (qs('#guide').classList.contains('open')) {
          closeGuide();
        }
        if (qs('#shortcutsHelp').classList.contains('open')) {
          closeShortcutsHelp();
        }
      }
    });
  }



  function openShortcutsHelp() {
    qs('#shortcutsHelp').classList.add('open');
    qs('#shortcutsHelp').setAttribute('aria-hidden', 'false');
  }

  function closeShortcutsHelp() {
    qs('#shortcutsHelp').classList.remove('open');
    qs('#shortcutsHelp').setAttribute('aria-hidden', 'true');
  }

  // Advanced Analytics Functions
  function updateAnalytics() {
    const curMobile = parseFloat(qs('#curTotal').value) || 0;
    const customerMonthTotal = curMobile + Array.from(state.selectedStreaming).reduce((total, id) => {
      const service = STREAMING_SERVICES.find(s => s.id === id);
      return total + (service ? service.price : 0);
    }, 0);
    
    // Calculate 6-month total with intro pricing
    const our6 = state.cart.reduce((total, item) => {
      let itemTotal = 0;
      if (item.introPrice && item.introMonths) {
        // Intro pricing: first X months at intro price, rest at normal price
        const introTotal = item.introPrice * item.introMonths * item.qty;
        const remainingMonths = Math.max(0, 6 - item.introMonths);
        const normalTotal = item.price * remainingMonths * item.qty;
        itemTotal = introTotal + normalTotal;
      } else {
        // Normal pricing: 6 months at regular price
        itemTotal = item.price * 6 * item.qty;
      }
      return total + itemTotal;
    }, 0);
    
    const telenorLines = state.cart.filter(i=> i.brand==='Telenor').reduce((s,i)=> s + i.qty, 0);
    const bundleDiscount = Math.max(0, (telenorLines - 1) * 50);
    const ourMonth = Math.max(0, (our6 / 6) - bundleDiscount);
    const customer6Total = customerMonthTotal * 6;
    const savings = customer6Total > 0 && our6 > 0 ? (customer6Total - our6) : 0;

    // Update analytics
    if (!state.analytics.totalSavings) state.analytics.totalSavings = 0;
    state.analytics.totalSavings += savings;
    state.analytics.averageSavings = state.customerHistory.length > 0 ? 
      state.analytics.totalSavings / state.customerHistory.length : 0;
    
    // Track popular plans
    if (!state.analytics.popularPlans) {
      state.analytics.popularPlans = [];
    }
    state.cart.forEach(item => {
      const existing = state.analytics.popularPlans.find(p => p.id === item.id);
      if (existing) {
        existing.count += item.qty;
      } else {
        state.analytics.popularPlans.push({ id: item.id, name: item.name, brand: item.brand, count: item.qty });
      }
    });
    
    // Sort popular plans by count
    state.analytics.popularPlans.sort((a, b) => b.count - a.count);
    state.analytics.popularPlans = state.analytics.popularPlans.slice(0, 5);
    
    saveAnalytics();
    renderAnalytics();
  }

  function renderAnalytics() {
    const el = qs('#analyticsGrid');
    if (!el) return;
    
    el.innerHTML = `
      <div class="analytics-card">
        <div class="analytics-value">${kr(state.analytics.totalSavings)}</div>
        <div class="analytics-label">Total besparelse</div>
        <div class="analytics-trend up">↗️ +${state.customerHistory.length} kunder</div>
      </div>
      <div class="analytics-card">
        <div class="analytics-value">${kr(state.analytics.averageSavings)}</div>
        <div class="analytics-label">Gns. besparelse</div>
        <div class="analytics-trend up">↗️ per kunde</div>
      </div>
      <div class="analytics-card">
        <div class="analytics-value">${state.customerHistory.length}</div>
        <div class="analytics-label">Behandlede kunder</div>
        <div class="analytics-trend up">↗️ denne session</div>
      </div>
      <div class="analytics-card">
        <div class="analytics-value">${state.analytics.popularPlans.length > 0 ? state.analytics.popularPlans[0].name : '—'}</div>
        <div class="analytics-label">Populæreste plan</div>
        <div class="analytics-trend">${state.analytics.popularPlans.length > 0 ? state.analytics.popularPlans[0].brand : ''}</div>
      </div>
    `;
  }

  // Customer History Functions
  function addToHistory() {
    const curMobile = parseFloat(qs('#curTotal').value) || 0;
    const customerMonthTotal = curMobile + Array.from(state.selectedStreaming).reduce((total, id) => {
      const service = STREAMING_SERVICES.find(s => s.id === id);
      return total + (service ? service.price : 0);
    }, 0);
    
    // Calculate 6-month total with intro pricing
    const our6 = state.cart.reduce((total, item) => {
      let itemTotal = 0;
      if (item.introPrice && item.introMonths) {
        // Intro pricing: first X months at intro price, rest at normal price
        const introTotal = item.introPrice * item.introMonths * item.qty;
        const remainingMonths = Math.max(0, 6 - item.introMonths);
        const normalTotal = item.price * remainingMonths * item.qty;
        itemTotal = introTotal + normalTotal;
      } else {
        // Normal pricing: 6 months at regular price
        itemTotal = item.price * 6 * item.qty;
      }
      return total + itemTotal;
    }, 0);
    
    const telenorLines = state.cart.filter(i=> i.brand==='Telenor').reduce((s,i)=> s + i.qty, 0);
    const bundleDiscount = Math.max(0, (telenorLines - 1) * 50);
    const ourMonth = Math.max(0, (our6 / 6) - bundleDiscount);
    const customer6Total = customerMonthTotal * 6;
    const savings = customer6Total > 0 && our6 > 0 ? (customer6Total - our6) : 0;

    if (savings > 0) {
      const historyEntry = {
        id: Date.now(),
        date: new Date().toISOString(),
        savings: savings,
        plans: state.cart.map(item => `${item.brand} ${item.name}`),
        customerTotal: customer6Total,
        ourTotal: our6,
        streaming: Array.from(state.selectedStreaming)
      };
      
      state.customerHistory.unshift(historyEntry);
      if (state.customerHistory.length > 10) {
        state.customerHistory = state.customerHistory.slice(0, 10);
      }
      
      saveCustomerHistory();
      renderHistory();
    }
  }

  function renderHistory() {
    const el = qs('#historyList');
    if (!el) return;
    
    if (state.customerHistory.length === 0) {
      el.innerHTML = '<div style="text-align:center; padding:20px; color:var(--muted)">Ingen kundehistorik endnu</div>';
      return;
    }
    
    el.innerHTML = state.customerHistory.map(entry => `
      <div class="history-item">
        <div class="history-details">
          <div style="font-weight:600; margin-bottom:4px">${entry.plans.join(', ')}</div>
          <div class="history-date">${new Date(entry.date).toLocaleDateString('da-DK')} - ${new Date(entry.date).toLocaleTimeString('da-DK', {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
        <div class="history-savings">+${kr(entry.savings)}</div>
      </div>
    `).join('');
  }

  // Smart Recommendations Functions
  function generateRecommendations() {
    const curMobile = parseFloat(qs('#curTotal').value) || 0;
    const recommendations = [];
    
    // Recommendation 1: If customer has high current costs
    if (curMobile > 500) {
      recommendations.push({
        id: 'high-cost',
        icon: '💰',
        color: '#fbbf24',
        title: 'Høje nuværende omkostninger',
        desc: 'Kunden betaler meget i dag. Fokuser på besparelse.',
        action: 'Vis besparelse'
      });
    }
    
    // Recommendation 2: If no Telenor plans selected
    if (!state.cart.some(item => item.brand === 'Telenor')) {
      recommendations.push({
        id: 'no-telenor',
        icon: '👨‍👩‍👧‍👦',
        color: '#38bdf8',
        title: 'Familiepris mulighed',
        desc: 'Telenor tilbyder familiepris ved flere linjer.',
        action: 'Vis Telenor'
      });
    }
    
    // Recommendation 3: If customer has many streaming services
    if (state.selectedStreaming.size > 3) {
      recommendations.push({
        id: 'many-streaming',
        icon: '📺',
        color: '#ff6b1a',
        title: 'Mange streaming-tjenester',
        desc: 'Overvej Telmore Play med inkluderet streaming.',
        action: 'Vis Telmore Play'
      });
    }
    
    // Recommendation 4: If cart is empty
    if (state.cart.length === 0) {
      recommendations.push({
        id: 'empty-cart',
        icon: '🛒',
        color: '#22c55e',
        title: 'Ingen abonnementer valgt',
        desc: 'Vælg abonnementer for at se besparelse.',
        action: 'Vælg abonnement'
      });
    }
    
    state.recommendations = recommendations;
    saveRecommendations();
    renderRecommendations();
  }

  function renderRecommendations() {
    const el = qs('#recommendationsList');
    if (!el) return;
    
    if (state.recommendations.length === 0) {
      el.innerHTML = '<div style="text-align:center; padding:20px; color:var(--muted)">Ingen anbefalinger lige nu</div>';
      return;
    }
    
    el.innerHTML = state.recommendations.map(rec => `
      <div class="recommendation-item">
        <div class="recommendation-icon" style="background:${rec.color}">${rec.icon}</div>
        <div class="recommendation-content">
          <div class="recommendation-title">${rec.title}</div>
          <div class="recommendation-desc">${rec.desc}</div>
        </div>
        <div class="recommendation-action" onclick="handleRecommendation('${rec.id}')">${rec.action}</div>
      </div>
    `).join('');
  }

  function handleRecommendation(id) {
    switch(id) {
      case 'high-cost':
        showToast('💰 Fokuser på at vise den store besparelse!', 'info');
        break;
      case 'no-telenor':
        state.selectedProvider = 'Telenor';
        qsa('.provider-tab').forEach(t => t.classList.remove('active'));
        qs('[data-provider="Telenor"]').classList.add('active');
        renderPlans();
        showToast('👨‍👩‍👧‍👦 Viser Telenor familiepris muligheder', 'success');
        break;
      case 'many-streaming':
        state.selectedProvider = 'Telmore';
        qsa('.provider-tab').forEach(t => t.classList.remove('active'));
        qs('[data-provider="Telmore"]').classList.add('active');
        renderPlans();
        showToast('📺 Viser Telmore Play med streaming', 'success');
        break;
      case 'empty-cart':
        qs('#plans').scrollIntoView({behavior: 'smooth'});
        showToast('🛒 Vælg abonnementer for at komme i gang', 'info');
        break;
    }
  }

  // Advanced Comparison Tools
  function renderComparisonTools() {
    const el = qs('#comparisonGrid');
    if (!el) return;
    
    el.innerHTML = `
      <div class="comparison-card">
        <div class="comparison-header">
          <div class="comparison-icon" style="background:#38bdf8">T</div>
          <span>Telenor vs Andre</span>
        </div>
        <div style="font-size:12px; color:var(--muted); margin-bottom:8px">Sammenlign Telenor med andre udbydere</div>
        <button class="btn" style="width:100%; padding:8px 12px; font-size:12px" onclick="compareProviders()">Sammenlign</button>
      </div>
      <div class="comparison-card">
        <div class="comparison-header">
          <div class="comparison-icon" style="background:#ff6b1a">📊</div>
          <span>Data vs Streaming</span>
        </div>
        <div style="font-size:12px; color:var(--muted); margin-bottom:8px">Analyser data vs streaming behov</div>
        <button class="btn" style="width:100%; padding:8px 12px; font-size:12px" onclick="analyzeDataVsStreaming()">Analyser</button>
      </div>
      <div class="comparison-card">
        <div class="comparison-header">
          <div class="comparison-icon" style="background:#22c55e">💰</div>
          <span>Pris vs Værdi</span>
        </div>
        <div style="font-size:12px; color:var(--muted); margin-bottom:8px">Evaluer pris vs funktionalitet</div>
        <button class="btn" style="width:100%; padding:8px 12px; font-size:12px" onclick="evaluatePriceValue()">Evaluer</button>
      </div>
    `;
  }

  function compareProviders() {
    const telenorPlans = PLANS.filter(p => p.brand === 'Telenor');
    const otherPlans = PLANS.filter(p => p.brand !== 'Telenor');
    
    const avgTelenorPrice = telenorPlans.reduce((sum, p) => sum + p.price, 0) / telenorPlans.length;
    const avgOtherPrice = otherPlans.reduce((sum, p) => sum + p.price, 0) / otherPlans.length;
    
    const comparison = {
      telenor: { avgPrice: avgTelenorPrice, features: ['Familiepris', '5G', 'eSIM', 'EU Roaming'] },
      others: { avgPrice: avgOtherPrice, features: ['5G', 'EU Roaming'] }
    };
    
    showToast(`📊 Telenor: ${avgTelenorPrice.toFixed(0)}kr vs Andre: ${avgOtherPrice.toFixed(0)}kr`, 'info', 4000);
    
    // Store comparison data
    state.comparisonData.providerComparison = comparison;
    saveComparisonData();
  }

  function analyzeDataVsStreaming() {
    const dataPlans = PLANS.filter(p => !p.features.some(f => f.includes('Streaming')));
    const streamingPlans = PLANS.filter(p => p.features.some(f => f.includes('Streaming')));
    
    const avgDataPrice = dataPlans.reduce((sum, p) => sum + p.price, 0) / dataPlans.length;
    const avgStreamingPrice = streamingPlans.reduce((sum, p) => sum + p.price, 0) / streamingPlans.length;
    
    showToast(`📊 Data: ${avgDataPrice.toFixed(0)}kr vs Streaming: ${avgStreamingPrice.toFixed(0)}kr`, 'info', 4000);
  }

  function evaluatePriceValue() {
    const curMobile = parseFloat(qs('#curTotal').value) || 0;
    const monthBeforeDisc = state.cart.reduce((s,i)=> s + i.price * i.qty, 0);
    
    if (curMobile > 0 && monthBeforeDisc > 0) {
      const savings = curMobile - monthBeforeDisc;
      const valueRatio = savings / curMobile;
      
      let evaluation = '';
      if (valueRatio > 0.3) evaluation = 'Fremragende værdi!';
      else if (valueRatio > 0.2) evaluation = 'God værdi';
      else if (valueRatio > 0.1) evaluation = 'Acceptabel værdi';
      else evaluation = 'Lav værdi';
      
      showToast(`💰 ${evaluation} (${(valueRatio * 100).toFixed(0)}% besparelse)`, 'info', 4000);
    } else {
      showToast('💰 Indtast kundens nuværende omkostninger for at evaluere', 'info');
    }
  }


  // Version 8.1 - AI-Powered Customer Matching
  function generateAIProfiles() {
    const curMobile = parseFloat(qs('#curTotal').value) || 0;
    const streamingCount = state.selectedStreaming.size;
    const cartTotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    const profiles = [];
    
    // Profile 1: High Spender
    if (curMobile > 400) {
      profiles.push({
        id: 'high-spender',
        icon: '💰',
        title: 'Højforbrugende Kunde',
        desc: 'Betaler meget i dag. Fokuser på besparelse og premium features.',
        score: Math.min(95, 70 + (curMobile - 400) / 10),
        category: 'Premium',
        recommendations: ['Telenor familiepris', 'Premium streaming', 'Fri data']
      });
    }
    
    // Profile 2: Family Customer
    if (state.cart.some(item => item.brand === 'Telenor') || cartTotal > 300) {
      profiles.push({
        id: 'family',
        icon: '👨‍👩‍👧‍👦',
        title: 'Familiekunde',
        desc: 'Flere linjer. Perfekt for Telenor familiepris.',
        score: 88,
        category: 'Family',
        recommendations: ['Telenor familiepris', 'Deling af data', 'Fælles streaming']
      });
    }
    
    // Profile 3: Streaming Enthusiast
    if (streamingCount > 2) {
      profiles.push({
        id: 'streaming',
        icon: '📺',
        title: 'Streaming Entusiast',
        desc: 'Mange streaming-tjenester. Overvej Telmore Play.',
        score: 82,
        category: 'Entertainment',
        recommendations: ['Telmore Play', 'Inkluderet streaming', 'Fri data']
      });
    }
    
    // Profile 4: Budget Conscious
    if (curMobile < 200 && cartTotal < 200) {
      profiles.push({
        id: 'budget',
        icon: '💡',
        title: 'Budgetbevidst Kunde',
        desc: 'Lavt forbrug. Fokuser på værdi og besparelse.',
        score: 75,
        category: 'Budget',
        recommendations: ['CBB abonnementer', 'Grundlæggende features', 'Ingen ekstra omkostninger']
      });
    }
    
    // Profile 5: Data Heavy User
    if (state.cart.some(item => item.dataGB > 100 || item.unlimited)) {
      profiles.push({
        id: 'data-heavy',
        icon: '📱',
        title: 'Stor Dataforbruger',
        desc: 'Bruger meget data. Fri data eller store datapakker.',
        score: 90,
        category: 'Data',
        recommendations: ['Fri data', 'Store datapakker', '5G optimering']
      });
    }
    
    state.aiProfiles = profiles;
    renderAIProfiles();
  }

  function renderAIProfiles() {
    const el = qs('#aiProfiles');
    if (!el) return;
    
    if (state.aiProfiles.length === 0) {
      el.innerHTML = '<div style="text-align:center; padding:20px; color:var(--muted)">Indtast kundedata for at få AI-anbefalinger</div>';
      return;
    }
    
    el.innerHTML = state.aiProfiles.map(profile => `
      <div class="ai-profile">
        <div class="ai-avatar">${profile.icon}</div>
        <div class="ai-content">
          <div class="ai-title">${profile.title}</div>
          <div class="ai-desc">${profile.desc}</div>
          <div style="margin-top:8px; font-size:11px; color:var(--muted)">
            Anbefalinger: ${profile.recommendations.join(', ')}
          </div>
        </div>
        <div class="ai-score">${profile.score}%</div>
      </div>
    `).join('');
  }

  // Advanced Data Visualization
  function updateChartData() {
    const curMobile = parseFloat(qs('#curTotal').value) || 0;
    const customerMonthTotal = curMobile + Array.from(state.selectedStreaming).reduce((total, id) => {
      const service = STREAMING_SERVICES.find(s => s.id === id);
      return total + (service ? service.price : 0);
    }, 0);
    
    const monthBeforeDisc = state.cart.reduce((s,i)=> s + i.price * i.qty, 0);
    const telenorLines = state.cart.filter(i=> i.brand==='Telenor').reduce((s,i)=> s + i.qty, 0);
    const bundleDiscount = Math.max(0, (telenorLines - 1) * 50);
    const ourMonth = Math.max(0, monthBeforeDisc - bundleDiscount);
    const customer6Total = customerMonthTotal * 6;
    const our6 = ourMonth * 6;
    const savings = customer6Total > 0 && our6 > 0 ? (customer6Total - our6) : 0;

    // Update savings chart data
    if (savings > 0) {
      state.chartData.savings.push({
        date: new Date().toISOString(),
        savings: savings,
        customerTotal: customer6Total,
        ourTotal: our6
      });
      
      // Keep only last 10 entries
      if (state.chartData.savings.length > 10) {
        state.chartData.savings = state.chartData.savings.slice(-10);
      }
    }
    
    renderCharts();
  }

  function renderCharts() {
    renderSavingsChart();
    renderTrendChart();
  }

  function renderSavingsChart() {
    const el = qs('#savingsChart');
    if (!el || state.chartData.savings.length === 0) {
      if (el) el.innerHTML = '<div style="text-align:center; padding:20px; color:var(--muted)">Ingen data endnu</div>';
      return;
    }
    
    const maxSavings = Math.max(...state.chartData.savings.map(d => d.savings));
    const chartHeight = 180;
    const barWidth = 30;
    const spacing = 10;
    const totalWidth = state.chartData.savings.length * (barWidth + spacing);
    
    el.innerHTML = `
      <div style="position:relative; height:100%; display:flex; align-items:end; justify-content:center; gap:${spacing}px; padding:20px">
        ${state.chartData.savings.map((data, index) => {
          const height = (data.savings / maxSavings) * chartHeight;
          return `
            <div style="position:relative; width:${barWidth}px">
              <div class="chart-bar" style="height:${height}px; width:100%"></div>
              <div class="chart-label">${kr(data.savings)}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderTrendChart() {
    const el = qs('#trendChart');
    if (!el || state.chartData.savings.length < 2) {
      if (el) el.innerHTML = '<div style="text-align:center; padding:20px; color:var(--muted)">Brug værktøjet flere gange for at se trends</div>';
      return;
    }
    
    const data = state.chartData.savings;
    const maxSavings = Math.max(...data.map(d => d.savings));
    const chartHeight = 180;
    const chartWidth = 300;
    
    // Create simple line chart
    const points = data.map((d, index) => {
      const x = (index / (data.length - 1)) * chartWidth;
      const y = chartHeight - (d.savings / maxSavings) * chartHeight;
      return `${x},${y}`;
    }).join(' ');
    
    el.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 ${chartWidth} ${chartHeight}" style="padding:20px">
        <polyline 
          points="${points}" 
          fill="none" 
          stroke="var(--brand)" 
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        ${data.map((d, index) => {
          const x = (index / (data.length - 1)) * chartWidth;
          const y = chartHeight - (d.savings / maxSavings) * chartHeight;
          return `<circle cx="${x}" cy="${y}" r="4" fill="var(--brand)"/>`;
        }).join('')}
      </svg>
    `;
  }

  // Real-time Notifications
  function addNotification(type, title, message) {
    const notification = {
      id: Date.now(),
      type: type,
      title: title,
      message: message,
      time: new Date().toISOString(),
      read: false
    };
    
    state.notifications.unshift(notification);
    if (state.notifications.length > 10) {
      state.notifications = state.notifications.slice(0, 10);
    }
    
    renderNotifications();
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      const index = state.notifications.findIndex(n => n.id === notification.id);
      if (index > -1) {
        state.notifications.splice(index, 1);
        renderNotifications();
      }
    }, 10000);
  }

  function renderNotifications() {
    const el = qs('#notificationList');
    if (!el) return;
    
    if (state.notifications.length === 0) {
      el.innerHTML = '<div style="text-align:center; padding:20px; color:var(--muted)">Ingen notifikationer</div>';
      return;
    }
    
    el.innerHTML = state.notifications.map(notification => {
      const icon = notification.type === 'success' ? '✅' : 
                  notification.type === 'warning' ? '⚠️' : 
                  notification.type === 'error' ? '❌' : 'ℹ️';
      const time = new Date(notification.time).toLocaleTimeString('da-DK', {hour: '2-digit', minute:'2-digit'});
      
      return `
        <div class="notification-item">
          <div class="notification-icon" style="background:${notification.type === 'success' ? '#22c55e' : notification.type === 'warning' ? '#fbbf24' : notification.type === 'error' ? '#ef4444' : '#3b82f6'}">${icon}</div>
          <div class="notification-content">
            <div class="notification-title">${notification.title}</div>
            <div class="notification-time">${time}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Advanced Search
  function setupAdvancedSearch() {
    const filters = [
      { id: 'price-low', label: 'Under 150kr', icon: '💰' },
      { id: 'price-mid', label: '150-250kr', icon: '💰' },
      { id: 'price-high', label: 'Over 250kr', icon: '💰' },
      { id: 'data-low', label: 'Under 50GB', icon: '📱' },
      { id: 'data-high', label: 'Over 100GB', icon: '📱' },
      { id: 'unlimited', label: 'Fri data', icon: '♾️' },
      { id: 'streaming', label: 'Med streaming', icon: '📺' },
      { id: 'family', label: 'Familiepris', icon: '👨‍👩‍👧‍👦' }
    ];
    
    const el = qs('#searchFilters');
    if (el) {
      el.innerHTML = filters.map(filter => `
        <div class="filter-chip" data-filter="${filter.id}">
          <span>${filter.icon}</span>
          <span>${filter.label}</span>
        </div>
      `).join('');
      
      // Add click handlers
      el.addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-chip');
        if (chip) {
          chip.classList.toggle('active');
          applySearchFilters();
        }
      });
    }
  }

  function applySearchFilters() {
    const activeFilters = qsa('.filter-chip.active').map(chip => chip.getAttribute('data-filter'));
    // This would filter the plans based on active filters
    // For now, just show a toast
    if (activeFilters.length > 0) {
      showToast(`🔍 Filtrerer på: ${activeFilters.join(', ')}`, 'info');
    }
  }

  function addToSearchHistory(query) {
    if (query && query.length > 2) {
      const historyItem = {
        query: query,
        timestamp: new Date().toISOString()
      };
      
      // Remove duplicates
      state.searchHistory = state.searchHistory.filter(item => item.query !== query);
      state.searchHistory.unshift(historyItem);
      
      if (state.searchHistory.length > 10) {
        state.searchHistory = state.searchHistory.slice(0, 10);
      }
      
      renderSearchHistory();
    }
  }

  function renderSearchHistory() {
    const el = qs('#searchHistory');
    if (!el) return;
    
    if (state.searchHistory.length === 0) {
      el.innerHTML = '<div style="text-align:center; padding:10px; color:var(--muted); font-size:12px">Ingen søgehistorik</div>';
      return;
    }
    
    el.innerHTML = state.searchHistory.map(item => `
      <div class="history-item" onclick="useSearchHistory('${item.query}')">
        <span>${item.query}</span>
        <span style="font-size:10px; color:var(--muted)">${new Date(item.timestamp).toLocaleDateString('da-DK')}</span>
      </div>
    `).join('');
  }

  function useSearchHistory(query) {
    qs('#searchInput').value = query;
    state.searchQuery = query.toLowerCase();
    renderPlans();
    showToast(`🔍 Bruger søgehistorik: ${query}`, 'info');
  }

  // Customer Profile Management
  function createCustomerProfile() {
    const curMobile = parseFloat(qs('#curTotal').value) || 0;
    const streamingCount = state.selectedStreaming.size;
    const cartTotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    if (curMobile === 0 && cartTotal === 0) {
      showToast('⚠️ Indtast kundedata først', 'warning');
      return;
    }
    
    const profile = {
      id: Date.now(),
      name: `Kunde ${state.customerProfiles.length + 1}`,
      category: curMobile > 400 ? 'Premium' : curMobile > 200 ? 'Standard' : 'Budget',
      currentMobile: curMobile,
      streamingServices: Array.from(state.selectedStreaming),
      selectedPlans: state.cart.map(item => item.name),
      totalSavings: 0,
      tags: [],
      notes: '',
      createdAt: new Date().toISOString()
    };
    
    // Calculate savings
    const customerMonthTotal = curMobile + Array.from(state.selectedStreaming).reduce((total, id) => {
      const service = STREAMING_SERVICES.find(s => s.id === id);
      return total + (service ? service.price : 0);
    }, 0);
    
    const monthBeforeDisc = state.cart.reduce((s,i)=> s + i.price * i.qty, 0);
    const telenorLines = state.cart.filter(i=> i.brand==='Telenor').reduce((s,i)=> s + i.qty, 0);
    const bundleDiscount = Math.max(0, (telenorLines - 1) * 50);
    const ourMonth = Math.max(0, monthBeforeDisc - bundleDiscount);
    const customer6Total = customerMonthTotal * 6;
    const our6 = ourMonth * 6;
    profile.totalSavings = customer6Total > 0 && our6 > 0 ? (customer6Total - our6) : 0;
    
    // Add tags based on characteristics
    if (curMobile > 400) profile.tags.push('Højforbrugende');
    if (streamingCount > 2) profile.tags.push('Streaming');
    if (state.cart.some(item => item.brand === 'Telenor')) profile.tags.push('Telenor');
    if (profile.totalSavings > 1000) profile.tags.push('Stor besparelse');
    
    state.customerProfiles.unshift(profile);
    if (state.customerProfiles.length > 20) {
      state.customerProfiles = state.customerProfiles.slice(0, 20);
    }
    
    renderCustomerProfiles();
    addNotification('success', 'Kundeprofil oprettet', `${profile.name} er blevet gemt`);
    showToast('👥 Kundeprofil oprettet!', 'success');
  }

  function renderCustomerProfiles() {
    const el = qs('#customerProfiles');
    if (!el) return;
    
    if (state.customerProfiles.length === 0) {
      el.innerHTML = `
        <div style="text-align:center; padding:20px; color:var(--muted)">
          <div style="margin-bottom:12px">Ingen kundeprofiler endnu</div>
          <button class="btn" onclick="createCustomerProfile()" style="padding:8px 16px; font-size:12px">Opret første profil</button>
        </div>
      `;
      return;
    }
    
    el.innerHTML = `
      <div style="margin-bottom:12px">
        <button class="btn" onclick="createCustomerProfile()" style="padding:8px 16px; font-size:12px">+ Opret ny profil</button>
      </div>
      ${state.customerProfiles.map(profile => `
        <div class="profile-card">
          <div class="profile-header">
            <div class="profile-avatar">${profile.name.charAt(0)}</div>
            <div class="profile-info">
              <div class="profile-name">${profile.name}</div>
              <div class="profile-category">${profile.category}</div>
            </div>
            <div style="text-align:right">
              <div style="font-weight:700; color:var(--good)">+${kr(profile.totalSavings)}</div>
              <div style="font-size:10px; color:var(--muted)">${new Date(profile.createdAt).toLocaleDateString('da-DK')}</div>
            </div>
          </div>
          <div style="font-size:11px; color:var(--muted); margin-bottom:8px">
            ${profile.currentMobile}kr/md → ${profile.selectedPlans.join(', ')}
          </div>
          <div class="profile-tags">
            ${profile.tags.map(tag => `<span class="profile-tag">${tag}</span>`).join('')}
          </div>
        </div>
      `).join('')}
    `;
  }

  // Advanced Features Modal Functions
  function openAdvancedModal(type) {
    const modal = qs('#advancedModal');
    const title = qs('#advancedModalTitle');
    const body = qs('#advancedModalBody');
    
    switch(type) {
      case 'analytics':
        title.textContent = '📈 Analytics & Historik';
        body.innerHTML = `
          <div class="analytics-dashboard">
            <h4 style="margin:0 0 12px; font-size:16px; color:#cbd5e1">📊 Avancerede Analytics</h4>
            <div class="analytics-grid" id="modalAnalyticsGrid">
              <!-- Analytics cards will be populated by JavaScript -->
            </div>
          </div>
          <div class="history-panel">
            <h4 style="margin:0 0 12px; font-size:16px; color:#cbd5e1">📈 Kundehistorik & Indsigter</h4>
            <div class="history-list" id="modalHistoryList">
              <!-- History items will be populated by JavaScript -->
            </div>
          </div>
        `;
        // Render content for analytics modal
        renderModalAnalytics();
        renderModalHistory();
        break;
        

    }
    
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeAdvancedModal() {
    const modal = qs('#advancedModal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  // Modal rendering functions
  function renderModalAnalytics() {
    const el = qs('#modalAnalyticsGrid');
    if (!el) return;
    
    el.innerHTML = `
      <div class="analytics-card">
        <div class="analytics-value">${kr(state.analytics.totalSavings)}</div>
        <div class="analytics-label">Total besparelse</div>
        <div class="analytics-trend up">↗️ +${state.customerHistory.length} kunder</div>
      </div>
      <div class="analytics-card">
        <div class="analytics-value">${kr(state.analytics.averageSavings)}</div>
        <div class="analytics-label">Gns. besparelse</div>
        <div class="analytics-trend up">↗️ per kunde</div>
      </div>
      <div class="analytics-card">
        <div class="analytics-value">${state.customerHistory.length}</div>
        <div class="analytics-label">Behandlede kunder</div>
        <div class="analytics-trend up">↗️ denne session</div>
      </div>
      <div class="analytics-card">
        <div class="analytics-value">${state.analytics.popularPlans.length > 0 ? state.analytics.popularPlans[0].name : '—'}</div>
        <div class="analytics-label">Populæreste plan</div>
        <div class="analytics-trend">${state.analytics.popularPlans.length > 0 ? state.analytics.popularPlans[0].brand : ''}</div>
      </div>
    `;
  }

  function renderModalHistory() {
    const el = qs('#modalHistoryList');
    if (!el) return;
    
    if (state.customerHistory.length === 0) {
      el.innerHTML = '<div style="text-align:center; padding:20px; color:var(--muted)">Ingen kundehistorik endnu</div>';
      return;
    }
    
    el.innerHTML = state.customerHistory.map(entry => `
      <div class="history-item">
        <div class="history-details">
          <div style="font-weight:600; margin-bottom:4px">${entry.plans.join(', ')}</div>
          <div class="history-date">${new Date(entry.date).toLocaleDateString('da-DK')} - ${new Date(entry.date).toLocaleTimeString('da-DK', {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
        <div class="history-savings">+${kr(entry.savings)}</div>
      </div>
    `).join('');
  }





  function filtered(){
    return PLANS.filter(p=>{
      // Only show plans from our partners (Telenor, Telmore, CBB)
      const partnerBrands = ['Telenor', 'Telmore', 'CBB'];
      if (!partnerBrands.includes(p.brand)) return false;
      
      if(state.selectedProvider!=='any' && p.brand!==state.selectedProvider) return false;
      
      // Search filtering
      if(state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        const searchText = `${p.brand} ${p.name} ${p.dataGB} ${p.price} ${p.features.join(' ')}`.toLowerCase();
        
        // Check if any part of the search query matches
        const queryWords = query.split(' ').filter(word => word.length > 0);
        const matches = queryWords.some(word => searchText.includes(word));
        
        if(!matches) return false;
      }
      
      return true;
    });
  }

  function renderPlans(){
    const saved = state.prices;
    const el = cachedQs('#plans'); 
    if (!el) return;
    
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    const plansToShow = filtered();
    
    // Show search results indicator
    if(state.searchQuery && state.searchQuery.length >= 2) {
      const searchIndicator = document.createElement('div');
      searchIndicator.style.cssText = 'grid-column:1/-1; text-align:center; padding:8px; margin-bottom:12px; background:rgba(255,107,26,.1); border:1px solid rgba(255,107,26,.2); border-radius:8px; font-size:12px; color:var(--brand)';
      searchIndicator.innerHTML = `🔍 Søgeresultater for "${state.searchQuery}" (${plansToShow.length} abonnementer fundet)`;
      el.appendChild(searchIndicator);
    }
    
    if(plansToShow.length === 0){
      el.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:#9aa6b2">Ingen abonnementer matcher dine kriterier</div>';
      return;
    }
    
    plansToShow.forEach(p=>{
      const price = (saved[p.id]!=null)? saved[p.id] : p.price;
      const isTelenor = p.brand === 'Telenor';
      const hasFamily = p.features.includes('Familie');
      const isOffer = p.offer === true;
      
      // Calculate Telenor discount price (50 kr less)
      const discountPrice = isTelenor ? price - 50 : null;
      
      // Map features to display with icons for Telenor
      let featuresHTML = '';
      if(isTelenor) {
        const roamingGB = p.dataGB === 20 ? '20' : p.dataGB === 70 ? '35' : p.dataGB === 100 ? '40' : p.dataGB === 120 ? '45' : '50';
        const hasStreaming = p.features.includes('Streaming inkl.');
        featuresHTML = `
          <div class="feat">
            <div class="f"><span class="f-icon">🌐</span>+${roamingGB} GB i 55 lande</div>
            <div class="f"><span class="f-icon">💬</span>Fri tale og SMS</div>
            ${hasStreaming ? '<div class="f"><span class="f-icon">📺</span>Streaming inkluderet</div>' : ''}
            ${p.dataGB >= 120 || p.unlimited ? '<div class="f"><span class="f-icon">📱</span>SkærmForsikring</div>' : '<div class="f"><span class="f-icon">🔒</span>Tryghedsparringer</div>'}
            <div class="f"><span class="f-icon">✓</span>Telenor Tryghedspakke inkluderet</div>
          </div>`;
      } else {
        featuresHTML = `<div class="feat" style="flex-direction:row; justify-content:center">${p.features.map(f=>`<span class="f" style="background:#0e1429; border:1px solid rgba(255,255,255,.12); padding:8px 10px; border-radius:12px">${f}</span>`).join('')}</div>`;
      }
      
      const card=document.createElement('div'); 
      card.className = `card${isTelenor ? ' telenor' : ''}`;
      
      if(isTelenor) {
        card.innerHTML = `
          <div style="display:flex; gap:4px; margin-bottom:8px; flex-wrap:wrap">
            <span style="background:#1e293b; padding:3px 6px; border-radius:4px; font-size:10px; color:#94a3b8; border:1px solid rgba(255,255,255,.06); font-weight:500">5G</span>
            <span style="background:#1e293b; padding:3px 6px; border-radius:4px; font-size:10px; color:#94a3b8; border:1px solid rgba(255,255,255,.06); font-weight:500">eSIM</span>
            <span style="background:#1e293b; padding:3px 6px; border-radius:4px; font-size:10px; color:#94a3b8; border:1px solid rgba(255,255,255,.06); font-weight:500">EU Roaming</span>
            <span style="background:#1e293b; padding:3px 6px; border-radius:4px; font-size:10px; color:#94a3b8; border:1px solid rgba(255,255,255,.06); font-weight:500">Familie</span>
            ${p.features.includes('Streaming inkl.') ? '<span style="background:#1e293b; padding:3px 6px; border-radius:4px; font-size:10px; color:#94a3b8; border:1px solid rgba(255,255,255,.06); font-weight:500">Streaming</span>' : ''}
            ${isOffer ? `<span style="background:#ff6b1a; padding:3px 6px; border-radius:4px; font-size:10px; color:white; font-weight:600">TILBUD</span>` : ''}
          </div>
          <div class="brand" style="display:flex; justify-content:center; align-items:center; gap:10px; margin:8px 0">
            <div style="display:flex; align-items:center; gap:8px">
              <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                <circle cx="14" cy="14" r="13" fill="#38bdf8"/>
                <circle cx="14" cy="14" r="5" fill="white"/>
              </svg>
              <span style="font-size:22px; font-weight:700; color:#38bdf8; letter-spacing:-0.5px">Telenor</span>
            </div>
            ${hasFamily ? '<span class="family-badge">FAMILIE</span>' : ''}
          </div>
          <div class="data-amount">${p.unlimited ? 'Fri data' : p.name}</div>
          <div style="margin-bottom:8px">
            <div class="price">${price}<span class="per">,-/md</span></div>
            ${isOffer ? `<div style="color:#ff6b1a; font-size:12px; font-weight:600; margin-top:4px">Udløber ${p.expiry}</div>` : ''}
            <div class="discount-price">
              <span class="discount-label">Samlerabat pris:</span>
              <span class="discount-value">${discountPrice},-/md</span>
            </div>
          </div>
          <div style="border-top:1px solid rgba(255,255,255,.08); margin:8px 0"></div>
          ${featuresHTML}
          <div style="display:flex; gap:8px; margin-top:auto; justify-content:center; padding-top:8px">
            <button class="btn" style="padding:10px 32px" data-add="${p.id}">Læg i kurv</button>
          </div>
          `;
      } else {
        // Features for CBB and other providers in Telenor-style format
        let featuresHTML = '';
        if(p.brand === 'CBB') {
          const euData = p.dataGB === 100 ? '40' : '30';
          const dataType = p.dataGB === 100 ? 'World-data' : 'EU-data';
          featuresHTML = `
            <div class="feat">
              <div class="f"><span class="f-icon">🌐</span>${euData} GB ${dataType}</div>
              <div class="f"><span class="f-icon">💬</span>Fri tale og SMS</div>
              <div class="f"><span class="f-icon">📶</span>5G inkluderet</div>
            </div>`;
        } else {
          // For Telmore and other providers
          featuresHTML = `<div class="feat" style="flex-direction:row; justify-content:center; flex-wrap:wrap; margin-top:16px">${p.features.map(f=>`<span class="f" style="background:#0e1429; border:1px solid rgba(255,255,255,.12); padding:6px 10px; border-radius:8px; font-size:12px">${f}</span>`).join('')}</div>`;
        }
        
        if(p.brand === 'CBB') {
          card.innerHTML = `
            <div style="display:flex; gap:4px; margin-bottom:8px; flex-wrap:wrap">
              <span style="background:#1e293b; padding:3px 6px; border-radius:4px; font-size:10px; color:#94a3b8; border:1px solid rgba(255,255,255,.06); font-weight:500">5G</span>
              <span style="background:#1e293b; padding:3px 6px; border-radius:4px; font-size:10px; color:#94a3b8; border:1px solid rgba(255,255,255,.06); font-weight:500">EU Roaming</span>
              ${isOffer ? `<span style="background:#ff6b1a; padding:3px 6px; border-radius:4px; font-size:10px; color:white; font-weight:600">TILBUD</span>` : ''}
            </div>
            <div class="brand" style="display:flex; justify-content:center; align-items:center; gap:10px; margin:8px 0">
              <div style="display:flex; align-items:center; gap:8px">
                <div style="width:28px; height:28px; background:${p.color}; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; color:white; font-size:12px">C</div>
                <span style="font-size:22px; font-weight:700; color:${p.color}; letter-spacing:-0.5px">CBB</span>
              </div>
            </div>
            <div class="data-amount">${p.name}</div>
            <div style="margin-bottom:8px">
              ${isOffer && p.introPrice ? `
                <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
                  <div style="display:flex; align-items:baseline; gap:8px">
                    <div class="price" style="color:#ff6b1a">${p.introPrice}<span class="per">,-/md</span></div>
                    <div style="font-size:14px; color:#9aa6b8">første ${p.introMonths} mdr</div>
                  </div>
                  <div style="font-size:12px; color:#9aa6b8">Derefter ${price},-/md</div>
                  <div style="color:#ff6b1a; font-size:12px; font-weight:600">Udløber ${p.expiry}</div>
                </div>
              ` : `
                <div class="price">${price}<span class="per">,-/md</span></div>
              `}
            </div>
            <div style="border-top:1px solid rgba(255,255,255,.08); margin:8px 0"></div>
            ${featuresHTML}
            <div style="display:flex; gap:8px; margin-top:auto; justify-content:center; padding-top:8px">
              <button class="btn" style="padding:10px 32px" data-add="${p.id}">Læg i kurv</button>
            </div>
            `;
                   } else if(p.brand === 'Telmore') {
           // Telmore cards in Telenor-style format
           let roamingGB = '';
           let streamingText = '';
           
           if(p.unlimited) {
             if(p.features.includes('Streaming (3 valgfrie)')) {
               roamingGB = '70';
               streamingText = 'Vælg 3 streamingtjenester (Netflix, Viaplay, HBO Max, m.fl.)';
             } else if(p.features.includes('Streaming (4 valgfrie)')) {
               roamingGB = '64';
               streamingText = 'Vælg 4 streamingtjenester';
             } else if(p.features.includes('Streaming (5 valgfrie)')) {
               roamingGB = '64';
               streamingText = 'Vælg 5 streamingtjenester';
             } else {
               roamingGB = '50';
             }
           } else {
             if(p.dataGB === 30) roamingGB = '20';
             else if(p.dataGB === 60 || p.dataGB === 70) roamingGB = '25';
             else if(p.dataGB === 100) roamingGB = '30';
           }
           
           if(p.features.includes('Streaming inkl.')) {
             roamingGB = '50';
             streamingText = 'Streaming inkluderet';
           }
           
           card.innerHTML = `
             <div style="display:flex; gap:4px; margin-bottom:8px; flex-wrap:wrap">
               <span style="background:#1e293b; padding:3px 6px; border-radius:4px; font-size:10px; color:#94a3b8; border:1px solid rgba(255,255,255,.06); font-weight:500">5G</span>
               <span style="background:#1e293b; padding:3px 6px; border-radius:4px; font-size:10px; color:#94a3b8; border:1px solid rgba(255,255,255,.06); font-weight:500">EU Roaming</span>
               ${p.features.some(f => f.includes('Streaming')) ? '<span style="background:#1e293b; padding:3px 6px; border-radius:4px; font-size:10px; color:#94a3b8; border:1px solid rgba(255,255,255,.06); font-weight:500">Streaming</span>' : ''}
               ${p.features.includes('HBO Max') ? '<span style="background:#1e293b; padding:3px 6px; border-radius:4px; font-size:10px; color:#94a3b8; border:1px solid rgba(255,255,255,.06); font-weight:500">HBO Max</span>' : ''}
             </div>
             <div class="brand" style="display:flex; justify-content:center; align-items:center; gap:10px; margin:8px 0">
               <div style="display:flex; align-items:center; gap:8px">
                 <div style="width:28px; height:28px; background:${p.color}; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; color:white; font-size:12px">T</div>
                 <span style="font-size:22px; font-weight:700; color:${p.color}; letter-spacing:-0.5px">Telmore</span>
               </div>
             </div>
             <div class="data-amount">${p.name}</div>
             <div style="margin-bottom:8px">
               ${p.introPrice && p.introMonths ? `
                 <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
                   <div style="display:flex; align-items:baseline; gap:8px">
                     <div class="price" style="color:#ff6b1a">${p.introPrice}<span class="per">,-/md</span></div>
                     <div style="font-size:14px; color:#9aa6b8">første ${p.introMonths} mdr</div>
                   </div>
                   <div style="font-size:12px; color:#9aa6b8">Derefter ${price},-/md</div>
                 </div>
               ` : `
                 <div class="price">${price}<span class="per">,-/md</span></div>
               `}
             </div>
             <div style="border-top:1px solid rgba(255,255,255,.08); margin:8px 0"></div>
             <div class="feat">
               <div class="f"><span class="f-icon">🌐</span>${roamingGB} GB EU-roaming</div>
               <div class="f"><span class="f-icon">💬</span>Fri tale og SMS</div>
               <div class="f"><span class="f-icon">📶</span>5G inkluderet</div>
               ${streamingText ? `<div class="f"><span class="f-icon">📺</span>${streamingText}</div>` : ''}
               ${p.features.includes('HBO Max') ? `<div class="f"><span class="f-icon">🎬</span>HBO Max inkluderet</div>` : ''}
             </div>
             <div style="display:flex; gap:8px; margin-top:auto; justify-content:center; padding-top:8px">
               <button class="btn" style="padding:10px 32px" data-add="${p.id}">Læg i kurv</button>
             </div>
             `;
         } else {
           // Original format for other providers
           card.innerHTML = `
             <div class="brand" style="justify-content:center; gap:10px; margin-bottom:16px">
               <div class="badge">
                 <span class="dot" style="background:${p.color}"></span>${p.brand}
               </div>
             </div>
             <div style="display:flex; align-items:end; gap:10px; justify-content:center">
               <div style="flex:1">
                 <div style="font-size:22px; font-weight:700; margin-bottom:8px">${p.name}</div>
                 <div class="price"><span data-price="${p.id}">${price}</span> <span class="per">kr/md</span></div>
               </div>
             </div>
             <input type="number" min="0" step="1" value="${price}" data-input="${p.id}" style="display:${state.edit?'block':'none'}; width:110px; margin:8px auto"/>
             ${featuresHTML}
             <div style="display:flex; gap:8px; margin-top:auto; justify-content:center; padding-top:8px">
               <button class="btn" style="padding:10px 32px" data-add="${p.id}">Læg i kurv</button>
             </div>`;
         }
      }
      
      fragment.appendChild(card);
    });
    
    // Clear and append all at once for better performance
    el.innerHTML = '';
    if(state.searchQuery && state.searchQuery.length >= 2) {
      const searchIndicator = document.createElement('div');
      searchIndicator.style.cssText = 'grid-column:1/-1; text-align:center; padding:8px; margin-bottom:12px; background:rgba(255,107,26,.1); border:1px solid rgba(255,107,26,.2); border-radius:8px; font-size:12px; color:var(--brand)';
      searchIndicator.innerHTML = `🔍 Søgeresultater for "${state.searchQuery}" (${plansToShow.length} abonnementer fundet)`;
      el.appendChild(searchIndicator);
    }
    el.appendChild(fragment);
  }

  function renderStreaming(){
    const el = qs('#streamingGrid');
    el.innerHTML = STREAMING_SERVICES.map(s => {
      // Særlig håndtering for CBB MIX bundle
      if(s.type === 'bundle' && s.id === 'cbbmix') {
        const isSelected = state.selectedStreaming.has(s.id);
        const selectedCount = s.selectedCount || 2;
        const currentPrice = s.pricing[selectedCount] || 160;
        
        return `
          <div class="stream-item${isSelected ? ' selected' : ''}" data-stream="${s.id}" style="grid-column: span 2; background: linear-gradient(135deg, rgba(109, 40, 217, 0.1), rgba(167, 139, 250, 0.1)); border: 2px solid ${isSelected ? '#a78bfa' : 'rgba(167, 139, 250, 0.3)'};">
            <div class="stream-icon">${s.icon}</div>
            <div class="stream-name" style="font-weight: 700; color: #a78bfa;">${s.name}</div>
            <div class="stream-price" style="font-size: 14px; font-weight: 700; color: #a78bfa;">${currentPrice} kr/md</div>
            ${isSelected ? `
              <div style="margin-top: 12px; width: 100%; padding: 0 8px;">
                <label style="display: block; font-size: 11px; color: var(--muted); margin-bottom: 6px;">Antal tjenester (2-8):</label>
                <input type="range" min="2" max="8" value="${selectedCount}" 
                       onchange="updateCBBMixCount(${selectedCount}, this.value)"
                       oninput="updateCBBMixPrice(this.value)"
                       style="width: 100%; accent-color: #a78bfa;">
                <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--muted); margin-top: 4px;">
                  <span>2</span>
                  <span id="cbbmix-count-display">${selectedCount} tjenester</span>
                  <span>8</span>
                </div>
                <div style="margin-top: 8px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 6px;">
                  <div style="font-size: 10px; font-weight: 600; color: #a78bfa; margin-bottom: 6px;">📦 Inkluderede tjenester:</div>
                  <ul style="margin: 0; padding-left: 16px; font-size: 9px; color: var(--muted); line-height: 1.4;">
                    ${s.includedServices.slice(0, 4).map(service => `<li>${service}</li>`).join('')}
                    <li style="font-style: italic; color: #a78bfa;">+ ${s.includedServices.length - 4} flere...</li>
                  </ul>
                  <div style="margin-top: 6px; font-size: 9px; color: var(--muted); font-style: italic;">
                    ${s.baseRequirement}
                  </div>
                </div>
              </div>
            ` : `
              <div style="margin-top: 8px; font-size: 10px; color: var(--muted); text-align: center;">
                Klik for at vælge antal tjenester
              </div>
            `}
          </div>
        `;
      }
      
      // Standard streaming tjenester
      return `
        <div class="stream-item${state.selectedStreaming.has(s.id) ? ' selected' : ''}" data-stream="${s.id}">
          <div class="stream-icon">${s.icon}</div>
          <div class="stream-name">${s.name}</div>
          <div class="stream-price">${s.price} kr/md</div>
        </div>
      `;
    }).join('');
  }

  function renderCart(){
    console.log('renderCart called with cart:', state.cart);
    const body = qs('#cartBody');
    if(!state.cart.length){ 
      console.log('Cart is empty, showing empty state');
      body.className = 'cart-empty';
      body.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📱</div>
          <div class="empty-text">Ingen mobilabonnementer i kurven endnu</div>
        </div>
      `;
      return; 
    }
    
    body.className = '';
    console.log('Rendering cart items:', state.cart.length);
    body.innerHTML = state.cart.map((item,idx)=>{
      console.log(`Rendering item ${idx}:`, {
        brand: item.brand,
        name: item.name,
        price: item.price,
        qty: item.qty,
        introPrice: item.introPrice,
        introMonths: item.introMonths
      });
      const lineTotal = item.price * item.qty;
      const priceDisplay = item.introPrice && item.introMonths ? 
        `${item.introPrice} kr/md (${item.introMonths} mdr)` : 
        `${item.price} kr/md`;
      
      return `
        <div class="cart-item" data-row="${idx}">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.brand} ${item.name}</div>
            <div class="cart-item-details">${priceDisplay}</div>
          </div>
          <div class="cart-item-qty">
            <button class="cart-qty-btn" onclick="updateQty(${idx}, ${item.qty - 1})">−</button>
            <span class="cart-qty-value">${item.qty}</span>
            <button class="cart-qty-btn" onclick="updateQty(${idx}, ${item.qty + 1})">+</button>
          </div>
          <div class="cart-item-price">${lineTotal} kr/md</div>
          <button class="cart-item-remove" onclick="removeItem(${idx})" title="Fjern">×</button>
        </div>
      `;
    }).join('');
  }

  function updateQty(idx, newQty) {
    if (newQty < 1) return;
    state.cart[idx].qty = newQty;
    saveCart();
    renderCart();
    calcTotals();
  }

  function removeItem(idx) {
    state.cart.splice(idx, 1);
    saveCart();
    renderCart();
    calcTotals();
  }

  function hasStreamingIncluded(){
    // Check om nogen af de valgte abonnementer inkluderer streaming
    return state.cart.some(item => 
      item.features.some(f => f.includes('Streaming'))
    );
  }

  // CBB MIX bundle funktioner
  function updateCBBMixPrice(count) {
    const cbbmix = STREAMING_SERVICES.find(s => s.id === 'cbbmix');
    if (!cbbmix) return;
    
    const newPrice = cbbmix.pricing[count] || 160;
    const countDisplay = qs('#cbbmix-count-display');
    const priceDisplay = qs('[data-stream="cbbmix"] .stream-price');
    
    if (countDisplay) {
      countDisplay.textContent = `${count} tjenester`;
    }
    if (priceDisplay) {
      priceDisplay.textContent = `${newPrice} kr/md`;
    }
  }

  function updateCBBMixCount(oldCount, newCount) {
    const cbbmix = STREAMING_SERVICES.find(s => s.id === 'cbbmix');
    if (!cbbmix) return;
    
    // Opdater pris og count
    cbbmix.selectedCount = parseInt(newCount);
    cbbmix.price = cbbmix.pricing[newCount] || 160;
    
    // Gem valget
    saveStreaming();
    
    // Genberegn totaler
    calcTotals();
  }

  function calcTotals(){
    console.log('=== calcTotals() called ===');
    const curMobile = parseFloat(qs('#curTotal').value) || 0;
    let rebate = parseFloat(qs('#rebate').value) || 0;
    console.log('Current mobile:', curMobile, 'Rebate:', rebate);
    
    // Calculate 6-month total with intro pricing
    const our6NoRebate = state.cart.reduce((total, item) => {
      let itemTotal = 0;
      if (item.introPrice && item.introMonths) {
        // Intro pricing: first X months at intro price, rest at normal price
        const introTotal = item.introPrice * item.introMonths * item.qty;
        const remainingMonths = Math.max(0, 6 - item.introMonths);
        const normalTotal = item.price * remainingMonths * item.qty;
        itemTotal = introTotal + normalTotal;
      } else {
        // Normal pricing: 6 months at regular price
        itemTotal = item.price * 6 * item.qty;
      }
      return total + itemTotal;
    }, 0);
    
    // Calculate monthly average for display purposes
    const monthBeforeDisc = our6NoRebate / 6;
    console.log('Our 6-month total (no rebate):', our6NoRebate, 'Monthly before discount:', monthBeforeDisc);

    // Streaming månedligt - KUNDENS nuværende udgifter (ekskl. CBB MIX, som er et tillægsprodukt)
    const streamingPrices = {
      netflix: 139, viaplay: 149, hbo: 119, tv2play: 99, 
      saxo: 79, disney: 129, skyshowtime: 89, prime: 59, musik: 109
    };

    // CBB MIX som tillægsprodukt: altid ovenpå vores pris, ikke i kundens nuværende
    const cbbmixService = STREAMING_SERVICES.find(s => s.id === 'cbbmix');
    const cbbmixSelected = state.selectedStreaming.has('cbbmix');
    const cbbmixSelectedCount = cbbmixService ? (cbbmixService.selectedCount || 2) : 2;
    const cbbmixCost = cbbmixSelected && cbbmixService ? (cbbmixService.pricing[cbbmixSelectedCount] || 160) : 0;

    // Kundens nuværende streaming uden CBB MIX
    const streamingMonthCustomer = Array.from(state.selectedStreaming)
      .filter(id => id !== 'cbbmix')
      .reduce((total, id) => total + (streamingPrices[id] || 0), 0);
    console.log('Streaming month (customer excl. CBB MIX):', streamingMonthCustomer, 'CBB MIX add-on:', cbbmixCost, 'Selected streaming:', Array.from(state.selectedStreaming));

    // Kundens totale nuværende udgifter
    const customerMonthTotal = curMobile + streamingMonthCustomer;
    const customer6Total = customerMonthTotal * 6;
    console.log('Customer month total:', customerMonthTotal, 'Customer 6-month total:', customer6Total);

    // Telenor samlerabat: 50 kr pr. ekstra Telenor-linje efter den første
    const telenorLines = state.cart.filter(i=> i.brand==='Telenor').reduce((s,i)=> s + i.qty, 0);
    const bundleDiscount = Math.max(0, (telenorLines - 1) * 50); // kr/md - kun rabat på ekstra linjer
    console.log('Telenor lines:', telenorLines, 'Bundle discount:', bundleDiscount);
    
    // Check om streaming er inkluderet i nogle abonnementer
    const streamingIncluded = hasStreamingIncluded();
    // Streaming ekstra (uden CBB MIX). Hvis CBB MIX er valgt, lægges andre streamingtjenester ikke ovenpå.
    const streamingExtraCost = cbbmixSelected ? 0 : (streamingIncluded ? 0 : streamingMonthCustomer);
    console.log('Streaming included:', streamingIncluded, 'Streaming extra cost:', streamingExtraCost);
    
    // Beregn vores månedlige pris: grundpris - samlerabat + ekstra streaming (hvis ikke inkluderet)
    // Vores månedlige pris: grundpris - samlerabat + evt. ekstra streaming (uden CBB MIX) + CBB MIX som tillæg
    const ourMonth = Math.max(0, monthBeforeDisc - bundleDiscount + streamingExtraCost + cbbmixCost);
    console.log('Our month total:', ourMonth);

    // Auto-justér: min. 500 kr besparelse over 6 mdr (kun hvis rabat ikke er låst)
    if(state.autoAdjust && customer6Total > 0 && !state.rebateLocked){
      const our6NoRebate = ourMonth * 6;
      const needed = Math.max(0, our6NoRebate - (customer6Total - 500)); 
      rebate = Math.max(rebate, Math.ceil(needed));
      qs('#rebate').value = rebate;
      localStorage.setItem('power-rebate', qs('#rebate').value);
    }

    const our6 = (ourMonth * 6) - rebate;
    const diff = customer6Total > 0 && our6 > 0 ? (customer6Total - our6) : 0;
    console.log('Our 6-month total (with rebate):', our6, 'Difference (savings):', diff);

    // Opdater visning
    qs('#customerTotal').textContent = customerMonthTotal > 0 ? `${customerMonthTotal.toLocaleString('da-DK')} kr` : '—';
    qs('#customer6Month').textContent = customer6Total > 0 ? `${customer6Total.toLocaleString('da-DK')} kr` : '—';
    qs('#sumMonth').textContent = monthBeforeDisc > 0 ? `${monthBeforeDisc.toLocaleString('da-DK')} kr` : '—';
    qs('#bundleDisc').textContent = bundleDiscount > 0 ? `- ${bundleDiscount.toLocaleString('da-DK')} kr/md` : '0 kr/md';
    // Vis ekstra linje som inkluderer CBB MIX tillæg, hvis valgt
    const extraDisplay = (streamingExtraCost + cbbmixCost);
    qs('#streamingExtra').textContent = extraDisplay > 0 ? `+ ${extraDisplay.toLocaleString('da-DK')} kr/md` : streamingIncluded ? 'Inkluderet ✓' : '—';
    qs('#ourMonthly').textContent = ourMonth > 0 ? `${ourMonth.toLocaleString('da-DK')} kr` : '—';
    qs('#pRebate').textContent = rebate > 0 ? kr(rebate): '—';
    qs('#totCur').textContent = customer6Total > 0 ? kr(customer6Total) : '—';
    qs('#totOur').textContent = our6 > 0 ? kr(our6) : '—';

    // Streaming inkluderet sektion
    const streamingNames = {
      netflix: 'Netflix', viaplay: 'Viaplay', hbo: 'HBO Max', tv2play: 'TV2 Play', 
      saxo: 'Saxo', disney: 'Disney+', skyshowtime: 'SkyShowtime', prime: 'Prime Video', musik: 'Musik tjeneste'
    };
    const streamingList = Array.from(state.selectedStreaming).map(id => {
      if (id === 'cbbmix') {
        const cbbmix = STREAMING_SERVICES.find(s => s.id === 'cbbmix');
        if (cbbmix) {
          const count = cbbmix.selectedCount || 2;
          return `CBB MIX (${count} tjenester)`;
        }
      }
      return streamingNames[id] || '';
    }).filter(Boolean);
    
    qs('#streamingIncluded').textContent = streamingList.length > 0 ? streamingList.join(', ') : 'Ingen valgt';
    // Besparelse på streaming (kun kundens eksisterende, ekskl. CBB MIX tillæg)
    qs('#streamingSavings').textContent = streamingMonthCustomer > 0 ? `${streamingMonthCustomer.toLocaleString('da-DK')} kr/md` : '—';

    // Show/hide Telenor family discount row
    const bundleRow = qs('#bundleDiscRow');
    bundleRow.style.display = telenorLines > 1 ? 'flex' : 'none';

    const diffEl = qs('#diff');
    diffEl.textContent = diff > 0 ? kr(diff) : '—';
    diffEl.className = 'total ' + (diff > 0 ? 'ok' : (diff < 0 ? 'bad' : ''));

    // Judgement
    const judge = qs('#judgement');
    if(diff > 500) judge.textContent = '✓ Fremragende tilbud! Kunden sparer betydeligt.';
    else if(diff > 0) judge.textContent = '✓ Godt tilbud. Kunden sparer penge.';
    else if(diff === 0) judge.textContent = '— Neutral løsning.';
    else if(customer6Total > 0 && our6 > 0) judge.textContent = '✗ Dyrere løsning. Overvej justering.';
    else judge.textContent = '—';

    // Update advanced features
    updateAnalytics();
    generateRecommendations();
    
    // Version 9.2 features
    generateAIProfiles();
    updateChartData();
    
    // Add to history if there's a significant savings
    if (diff > 100) {
      addToHistory();
    }
    
    // Add notifications for significant events
    if (diff > 500) {
      addNotification('success', 'Stor besparelse!', `Kunden sparer ${kr(diff)} over 6 måneder`);
    } else if (diff > 200) {
      addNotification('success', 'God besparelse', `Kunden sparer ${kr(diff)} over 6 måneder`);
    }



    // Presentation view
    const lines = state.cart.map(i=> `${i.brand} ${i.name} ×${i.qty}`).join(', ');
    const streamingLines = streamingList.join(', ');
    
    const monthMeta = `
      Vores tilbud: ${ourMonth.toLocaleString('da-DK')} kr/md
      ${bundleDiscount > 0 ? ' • -'+bundleDiscount.toLocaleString('da-DK')+' kr/md Telenor familiepris' : ''}
      ${streamingIncluded && streamingMonthCustomer > 0 ? ' • Streaming inkluderet (sparer '+streamingMonthCustomer.toLocaleString('da-DK')+' kr/md)' : ''}
      ${!streamingIncluded && streamingMonthCustomer > 0 ? ' • +'+streamingMonthCustomer.toLocaleString('da-DK')+' kr/md streaming' : ''}
      ${cbbmixCost > 0 ? ' • +'+cbbmixCost.toLocaleString('da-DK')+' kr/md CBB MIX' : ''}
      ${rebate > 0 ? ' • '+rebate.toLocaleString('da-DK')+' kr engangs-rabat' : ''}
    `.trim().replace(/\s+/g,' ');
    
    const planText = state.cart.length ? lines : '';
    const streamingText = streamingLines ? ` + ${streamingLines}${streamingIncluded ? ' inkluderet' : ''}` : '';
    qs('#pvPlan').textContent = (planText || streamingText) ? `${planText}${streamingText} • ${monthMeta}${state.autoAdjust?' • POWER Garanti: min. 500 kr sparet':''}` : '—';
    qs('#pvMeta').textContent = (customer6Total > 0 && our6 > 0) ? `Kunde betaler nu: ${kr(customer6Total)} • Vores tilbud: ${kr(our6)}` : '—';
    
    // Animated count-up for presentation savings
    const pvSaveEl = qs('#pvSave');
    if(pvSaveEl && diff !== 0){
      const target = Math.abs(diff);
      const labelPrefix = diff > 0 ? 'Spar ' : 'Merpris ';
      const prev = parseInt(pvSaveEl.getAttribute('data-val')||'0',10);
      const start = isFinite(prev)? prev : 0;
      const duration = 700;
      const t0 = performance.now();
      function step(t){
        const k = Math.min(1, (t - t0)/duration);
        const val = Math.round(start + (target - start)*k);
        pvSaveEl.textContent = labelPrefix + kr(val) + ' på 6 mdr';
        pvSaveEl.setAttribute('data-val', String(val));
        if(k<1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
  }

  function attach(){
    // Provider tabs
    qsa('.provider-tab').forEach(tab => {
      tab.addEventListener('click', ()=>{
        qsa('.provider-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.selectedProvider = tab.getAttribute('data-provider');
        renderPlans();
      });
    });



    // Plans delegation
    qs('#plans').addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-add]'); if(!btn) return;
      const id = btn.getAttribute('data-add');
      const base = PLANS.find(x=>x.id===id);
      const price = (state.prices[id]!=null)? state.prices[id] : base.price;
      const plan = { ...base, price };
      const existing = state.cart.find(x=>x.id===id);
      if(existing) existing.qty += 1; else state.cart.push({ ...plan, qty:1 });
      saveCart();
      renderCart(); calcTotals();
    });

    // Streaming delegation
    qs('#streamingGrid').addEventListener('click', (e)=>{
      const item = e.target.closest('[data-stream]'); if(!item) return;
      const id = item.getAttribute('data-stream');
      if(state.selectedStreaming.has(id)){
        state.selectedStreaming.delete(id);
      } else {
        state.selectedStreaming.add(id);
      }
      saveStreaming();
      renderStreaming(); calcTotals();
    });

    // Cart delegation - updated for new cart container
    const cartContainer = qs('#cartContainer');
    if (cartContainer) {
      // No longer needed as we use direct onclick handlers in the new cart layout
      // The new cart uses updateQty() and removeItem() functions directly
    }

    // Rebate lock functionality
    function toggleRebateLock() {
      state.rebateLocked = !state.rebateLocked;
      const lockBtn = qs('#rebateLock');
      const rebateInput = qs('#rebate');
      
      if (state.rebateLocked) {
        lockBtn.textContent = '🔒';
        lockBtn.title = 'Oplås rabat';
        rebateInput.disabled = true;
        rebateInput.style.background = 'rgba(255,255,255,0.1)';
        rebateInput.style.color = 'var(--muted)';
      } else {
        lockBtn.textContent = '🔓';
        lockBtn.title = 'Lås rabat';
        rebateInput.disabled = false;
        rebateInput.style.background = '';
        rebateInput.style.color = '';
      }
    }
    
    // Make function globally available
    window.toggleRebateLock = toggleRebateLock;

    // Inputs with debounced calculations for performance
    const debouncedCalcTotals = debounce(calcTotals, 300);
    ['#curTotal','#rebate'].forEach(sel=>{
      const element = qs(sel);
      if (element) {
        element.addEventListener('input', ()=>{
        if(sel==='#curTotal') localStorage.setItem('power-cur-total', qs('#curTotal').value||'');
        if(sel==='#rebate') localStorage.setItem('power-rebate', qs('#rebate').value||'');
        debouncedCalcTotals();
      });
      }
    });

    // Add event listeners for new guide inputs with debouncing
    const debouncedUpdateSummary = debounce(updateCurrentExpensesSummary, 300);
    const currentMobileInput = qs('#currentMobileTotal');
    if (currentMobileInput) {
      currentMobileInput.addEventListener('input', (e) => {
        slideFlowData.currentMobileTotal = parseFloat(e.target.value) || 0;
        debouncedUpdateSummary();
      });
    }

    const switchRebateInput = qs('#switchRebate');
    if (switchRebateInput) {
      switchRebateInput.addEventListener('input', (e) => {
        slideFlowData.switchRebate = parseFloat(e.target.value) || 0;
        updateFinalSavings();
      });
    }

    // Auto rebate checkbox
    const autoRebateEl = qs('#autoRebate');
    if (autoRebateEl) {
      autoRebateEl.addEventListener('change', (e)=>{ state.autoAdjust = e.target.checked; localStorage.setItem('power-auto', state.autoAdjust? '1':''); calcTotals(); });
    }

    // Toggle rabat-synlighed
    const toggleRebateEl = qs('#toggleRebate');
    if (toggleRebateEl) {
      toggleRebateEl.addEventListener('click', ()=>{
      state.rebateVisible = !state.rebateVisible;
      localStorage.setItem('power-rebate-visible', state.rebateVisible ? '1' : '');
      const rb = qs('#rebateBlock'); const rr = qs('#rebateRow'); const btn = qs('#toggleRebate');
      if(rb) rb.style.display = state.rebateVisible ? 'block' : 'none';
      if(rr) rr.style.display = state.rebateVisible ? 'flex' : 'none';
      if(btn){
        btn.setAttribute('aria-pressed', String(state.rebateVisible));
        btn.textContent = state.rebateVisible ? '🔓' : '🔒';
      }
    });
    }


    // New Navigation Event Listeners
    const slideFlowBtn = qs('#slideFlowBtn');
    if (slideFlowBtn) {
      slideFlowBtn.addEventListener('click', startSlideFlow);
    }
    
    const presentBtn = qs('#presentBtn');
    if (presentBtn) {
      presentBtn.addEventListener('click', openPresent);
    }
    
    // Help Menu
    const helpBtn = qs('#helpBtn');
    if (helpBtn) {
      helpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = qs('#helpDropdown');
        if (dropdown) {
          dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        }
      });
    }
    
    // Close help dropdown when clicking outside
    document.addEventListener('click', (e) => {
      const helpDropdown = qs('#helpDropdown');
      if (!e.target.closest('.help-menu') && helpDropdown) {
        helpDropdown.style.display = 'none';
      }
    });

    // Advanced feature buttons
    const themeBtn = qs('#themeBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', (e) => {
      console.log('Theme button clicked');
      toggleTheme();
    });
    }
    const shortcutsBtn = qs('#shortcutsBtn');
    if (shortcutsBtn) {
      shortcutsBtn.addEventListener('click', openShortcutsHelp);
    }
    
    const closeShortcuts = qs('#closeShortcuts');
    if (closeShortcuts) {
      closeShortcuts.addEventListener('click', closeShortcutsHelp);
    }
    
    const advancedBtn = qs('#advancedBtn');
    if (advancedBtn) {
      advancedBtn.addEventListener('click', () => {
      showToast('🚀 Avancerede funktioner er nu tilgængelige via footer-knapperne!', 'success', 4000);
    });
    }
    
    // Advanced features footer buttons
    const analyticsBtn = qs('#analyticsBtn');
    if (analyticsBtn) {
      analyticsBtn.addEventListener('click', () => {
      openAdvancedModal('analytics');
    });
    }
    
    // Advanced modal close
    const closeAdvancedModalBtn = qs('#closeAdvancedModal');
    if (closeAdvancedModalBtn) {
      closeAdvancedModalBtn.addEventListener('click', closeAdvancedModal);
    }
    
    const advancedModal = qs('#advancedModal');
    if (advancedModal) {
      advancedModal.addEventListener('click', (e) => {
      if (e.target.id === 'advancedModal') {
        closeAdvancedModal();
      }
    });
    }
    
    // Setup advanced features
    setupSearch();
    setupKeyboardShortcuts();

    // Present
    function openPresent(){ 
      const presentEl = qs('#present');
      if (presentEl) {
        // Remove focus from any focused element inside the modal before opening
        const focusedElement = document.activeElement;
        if (focusedElement && presentEl.contains(focusedElement)) {
          focusedElement.blur();
        }
        presentEl.classList.add('open'); 
        presentEl.setAttribute('aria-hidden','false'); 
        presentEl.removeAttribute('inert'); // Remove inert when opening
        // Set focus to the modal container to ensure proper accessibility
        presentEl.focus();
      }
    }
    function closePresent(){ 
      const presentEl = qs('#present');
      if (presentEl) {
        // First, remove focus from any focused element inside the modal
        const focusedElement = document.activeElement;
        if (focusedElement && presentEl.contains(focusedElement)) {
          focusedElement.blur();
        }
        // Use setTimeout to ensure focus is removed before setting aria-hidden
        setTimeout(() => {
          presentEl.classList.remove('open'); 
          presentEl.setAttribute('aria-hidden','true'); 
          presentEl.setAttribute('inert', ''); // Add inert when closing
        }, 0);
      }
    }
    
    const closePresentBtn = qs('#closePresent');
    if (closePresentBtn) {
      closePresentBtn.addEventListener('click', closePresent);
    }
    
    const presentEl = qs('#present');
    if (presentEl) {
      presentEl.addEventListener('click', (e)=>{ if(e.target.id==='present') closePresent(); });
    }

    // Guide
    const guideBtnEl = qs('#guideBtn');
    if (guideBtnEl) {
      guideBtnEl.addEventListener('click', openGuide);
    }
    
    const closeGuideBtn = qs('#closeGuide');
    if (closeGuideBtn) {
      closeGuideBtn.addEventListener('click', closeGuide);
    }
    
    const guideEl = qs('#guide');
    if (guideEl) {
      guideEl.addEventListener('click', (e)=>{ if(e.target.id==='guide') closeGuide(); });
    }
    
    const nextStepBtn = qs('#nextStep');
    if (nextStepBtn) {
      nextStepBtn.addEventListener('click', nextGuideStep);
    }
    
    const prevStepBtn = qs('#prevStep');
    if (prevStepBtn) {
      prevStepBtn.addEventListener('click', prevGuideStep);
    }

    // Reset
    const resetBtn = qs('#resetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', ()=>{
      if(!confirm('Er du sikker på, at du vil nulstille ALT til næste kunde?\n\nDette vil slette:\n• Alle valgte abonnementer\n• Kundens nuværende udgifter\n• Streaming-valg\n• Rabat-beløb\n\n⚠️ Justerede priser bevares mellem kunder\n\nDenne handling kan ikke fortrydes.')) return;
      
      // Gem justerede priser før nulstilling
      const savedPrices = { ...state.prices };
      
      // Ryd alle localStorage data (UNDTAGEN priser)
      localStorage.removeItem('power-cart');
      localStorage.removeItem('power-cur-total');
      localStorage.removeItem('power-rebate');
      localStorage.removeItem('power-auto');
      localStorage.removeItem('power-streaming');
      
      // Nulstil state (bevar priser)
      state.prices = savedPrices;
      state.cart = [];
      state.autoAdjust = false;
      state.selectedStreaming = new Set();
      state.selectedProvider = 'any';
      
      // Nulstil UI felter
      qs('#curTotal').value = '';
      qs('#rebate').value = '';
      qs('#autoRebate').checked = false;
      
      // Nulstil provider tabs
      qsa('.provider-tab').forEach(t => t.classList.remove('active'));
      qs('[data-provider="any"]').classList.add('active');
      

      
      // Genopret visning
      renderPlans();
      renderCart();
      renderStreaming();
      calcTotals();
      
      // Advanced features are now in modal - no need to re-render them
      
      // Vis bekræftelse
      setTimeout(() => {
        alert('✅ Alt er nulstillet! Værktøjet er klar til næste kunde.');
      }, 100);
    });
    }

  }

  function initializeApp(){
    try{
      const saved = JSON.parse(localStorage.getItem('power-plan-prices')||'{}');
      state.prices = saved;
    }catch(e){}

    qs('#curTotal').value = localStorage.getItem('power-cur-total') || '';
    qs('#rebate').value = localStorage.getItem('power-rebate') || '';
    state.autoAdjust = !!localStorage.getItem('power-auto');
    qs('#autoRebate').checked = state.autoAdjust;

    // Load guide state
    state.guideCompleted = !!localStorage.getItem('power-guide-completed');

    // Load advanced features data
    loadCart();
    loadStreaming();
    loadCustomerHistory();
    loadTheme();
    loadAnalytics();
    loadRecommendations();
    loadComparisonData();
    loadExportHistory();
    loadCustomerInsights();

    // Rabat synlighed (default skjult)
    state.rebateVisible = !!localStorage.getItem('power-rebate-visible');
    const rb = qs('#rebateBlock'); const rr = qs('#rebateRow'); const btn = qs('#toggleRebate');
    if(rb) rb.style.display = state.rebateVisible ? 'block' : 'none';
    if(rr) rr.style.display = state.rebateVisible ? 'flex' : 'none';
    if(btn){
      btn.setAttribute('aria-pressed', String(state.rebateVisible));
      btn.textContent = state.rebateVisible ? '🔓' : '🔒';
    }

    // Set theme button icon and ensure theme is applied
    qs('#themeBtn').textContent = state.theme === 'dark' ? '🌙' : '☀️';
    document.documentElement.setAttribute('data-theme', state.theme);

    document.getElementById('copyrightYear').textContent = new Date().getFullYear();

    renderPlans(); renderCart(); renderStreaming(); attach(); calcTotals();
    
    // Setup UX enhancements
    setupKeyboardNavigation();
    setupTouchGestures();
    setupAccessibility();
    
    // Advanced features are now in modal - no need to render them initially
    
    // Show welcome toast and onboarding
    setTimeout(() => {
      showToast('🎉 Velkommen til POWER v9.3! Med eksterne databaser og Start Guide.', 'success', 5000);
      
      // Show onboarding tooltip for first-time users
      if (!localStorage.getItem('power-onboarding-shown')) {
        setTimeout(() => {
          showOnboardingTooltip();
        }, 2000);
      }
    }, 1000);
  }

  // Slide Flow Functions
  let slideFlowData = {
    familySize: 1,
    currentMobileTotal: 0,
    currentStreamingServices: new Set(),
    existingPartners: new Set(),
    selectedSolution: null,
    switchRebate: 0
  };

  // Start Guide functionality
  function startSlideFlow() {
    qs('#slideFlow').style.display = 'flex';
    setTimeout(() => {
      qs('#slideFlow').classList.add('open');
    }, 10);
  }

  // New Guide Functions
  function selectFamilySize(size) {
    console.log('=== selectFamilySize() called ===', 'Size:', size);
    slideFlowData.familySize = size;
    qsa('.family-option').forEach(option => option.classList.remove('selected'));
    qs(`[data-size="${size}"]`).classList.add('selected');
    qs('#slide1Next').disabled = false;
  }

  function togglePartner(partner) {
    console.log('=== togglePartner() called ===', 'Partner:', partner);
    const option = qs(`[data-partner="${partner}"]`);
    const status = option.querySelector('.partner-status');
    
    if (slideFlowData.existingPartners.has(partner)) {
      slideFlowData.existingPartners.delete(partner);
      option.classList.remove('selected');
      status.textContent = 'Ikke valgt';
      console.log('Partner removed:', partner);
    } else {
      slideFlowData.existingPartners.add(partner);
      option.classList.add('selected');
      status.textContent = 'Allerede har';
      console.log('Partner added:', partner);
    }
    console.log('Current existing partners:', Array.from(slideFlowData.existingPartners));
  }

  function toggleStreamingService(service) {
    console.log('=== toggleStreamingService() called ===', 'Service:', service);
    const option = qs(`[data-stream="${service}"]`);
    
    if (slideFlowData.currentStreamingServices.has(service)) {
      slideFlowData.currentStreamingServices.delete(service);
      option.classList.remove('selected');
      console.log('Streaming service removed:', service);
    } else {
      slideFlowData.currentStreamingServices.add(service);
      option.classList.add('selected');
      console.log('Streaming service added:', service);
    }
    
    console.log('Current streaming services:', Array.from(slideFlowData.currentStreamingServices));
    updateCurrentExpensesSummary();
  }

  function updateCurrentExpensesSummary() {
    console.log('=== updateCurrentExpensesSummary() called ===');
    const mobileTotal = slideFlowData.currentMobileTotal || 0;
    const streamingTotal = Array.from(slideFlowData.currentStreamingServices).reduce((total, service) => {
      const prices = {
        netflix: 139, viaplay: 149, hbo: 119, tv2play: 99, 
        saxo: 79, disney: 129, skyshowtime: 89, prime: 59, musik: 109
      };
      return total + (prices[service] || 0);
    }, 0);
    
    const total = mobileTotal + streamingTotal;
    console.log('Mobile total:', mobileTotal, 'Streaming total:', streamingTotal, 'Total expenses:', total);
    
    qs('#currentMobileDisplay').textContent = `${mobileTotal} kr`;
    qs('#currentStreamingDisplay').textContent = `${streamingTotal} kr`;
    qs('#currentTotalDisplay').textContent = `${total} kr`;
    
    const summary = qs('#currentExpensesSummary');
    if (mobileTotal > 0 || streamingTotal > 0) {
      summary.style.display = 'block';
      qs('#slide2Next').disabled = false;
      console.log('Next button enabled');
    } else {
      summary.style.display = 'none';
      qs('#slide2Next').disabled = true;
      console.log('Next button disabled');
    }
  }

  function closeSlideFlow() { /* no-op */ }

  function showSlide(slideNumber) {
    console.log('=== showSlide() called ===', 'Slide:', slideNumber);
    for (let i = 1; i <= 5; i++) {
      qs(`#slide${i}`).style.display = 'none';
    }
    qs(`#slide${slideNumber}`).style.display = 'block';
    updateProgressDots(slideNumber);
    
    // Handle slide-specific setup
    switch(slideNumber) {
      case 1:
        setupSlide1();
        break;
      case 2:
        setupSlide2();
        break;
      case 3:
        setupSlide3();
        break;
      case 4:
        setupSlide4();
        break;
      case 5:
        setupSlide5();
        break;
    }
  }

  function setupSlide1() {
    // Set family size selection
    qsa('.family-option').forEach(option => option.classList.remove('selected'));
    const selectedOption = qs(`[data-size="${slideFlowData.familySize}"]`);
    if (selectedOption) {
      selectedOption.classList.add('selected');
    }
    
    // Set mobile total input
    const mobileInput = qs('#currentMobileTotal');
    if (mobileInput) {
      mobileInput.value = slideFlowData.currentMobileTotal;
    }
    
    // Set streaming services selection
    slideFlowData.currentStreamingServices.forEach(serviceId => {
      const option = qs(`[data-stream="${serviceId}"]`);
      if (option) {
        option.classList.add('selected');
      }
    });
    
    // Update summary if we have data
    updateCurrentExpensesSummary();
  }

  function setupSlide2() {
    // Set existing partners selection
    slideFlowData.existingPartners.forEach(partnerId => {
      const option = qs(`[data-partner="${partnerId}"]`);
      if (option) {
        option.classList.add('selected');
        const status = option.querySelector('.partner-status');
        if (status) {
          status.textContent = 'Allerede har';
        }
      }
    });
  }

  function setupSlide3() {
    // This is now the existing partners slide - no setup needed
  }

  function setupSlide4() {
    // Show loading state immediately
    const container = qs('#recommendedSolutions');
    if (container) {
      container.innerHTML = '<div style="text-align:center; padding:40px; color:var(--muted)">🔄 Genererer anbefalinger...</div>';
    }
    
    // Generate recommendations asynchronously for better performance
    setTimeout(() => {
      generateRecommendedSolutions();
    }, 100);
  }

  function setupSlide5() {
    calculateComparison();
    const switchRebateInput = qs('#switchRebate');
    if (switchRebateInput) {
      switchRebateInput.value = slideFlowData.switchRebate;
    }
    updateFinalSavings();
  }

  function updateProgressDots(currentSlide) {
    const dots = qsa('.progress-dot');
    dots.forEach((dot, index) => {
      dot.classList.remove('active', 'completed');
      if (index < currentSlide - 1) {
        dot.classList.add('completed');
      } else if (index === currentSlide - 1) {
        dot.classList.add('active');
      }
    });
  }

  function nextSlide(slideNumber) {
    console.log('=== nextSlide() called ===', 'Slide number:', slideNumber);
    // Validate current slide before proceeding
    if (!validateCurrentSlide(slideNumber - 1)) {
      console.log('Validation failed, staying on current slide');
      return;
    }
    
    console.log('Validation passed, saving data and moving to next slide');
    // Save current slide data
    saveCurrentSlideData(slideNumber - 1);
    
    showSlide(slideNumber);
  }

  function validateCurrentSlide(slideNumber) {
    console.log('=== validateCurrentSlide() called ===', 'Slide number:', slideNumber);
    switch(slideNumber) {
      case 1:
        // Family size must be selected
        if (slideFlowData.familySize <= 0) {
          console.log('Validation failed: No family size selected');
          alert('Vælg venligst antal personer i familien');
          return false;
        }
        console.log('Validation passed: Family size selected:', slideFlowData.familySize);
        return true;
      case 2:
        // Mobile total or streaming services must be entered
        const mobileTotal = slideFlowData.currentMobileTotal || 0;
        const streamingCount = slideFlowData.currentStreamingServices.size;
        console.log('Mobile total:', mobileTotal, 'Streaming count:', streamingCount);
        if (mobileTotal <= 0 && streamingCount === 0) {
          console.log('Validation failed: No expenses entered');
          alert('Indtast venligst kundens nuværende mobiludgifter eller vælg streamingtjenester');
          return false;
        }
        console.log('Validation passed: Expenses entered');
        return true;
      case 3:
        console.log('Validation passed: No validation needed for partners');
        return true; // No validation needed for existing partners
      case 4:
        if (!slideFlowData.selectedSolution) {
          console.log('Validation failed: No solution selected');
          alert('Vælg venligst en løsning');
          return false;
        }
        console.log('Validation passed: Solution selected:', slideFlowData.selectedSolution);
        return true;
      default:
        console.log('Validation passed: Default case');
        return true;
    }
  }

  function saveCurrentSlideData(slideNumber) {
    console.log('=== saveCurrentSlideData() called ===', 'Slide number:', slideNumber);
    switch(slideNumber) {
      case 1:
        // Family size and mobile total are already saved via event listeners
        console.log('Slide 1: Data already saved via event listeners');
        break;
      case 2:
        // Mobile total and streaming services are already saved via event listeners
        console.log('Slide 2: Data already saved via event listeners');
        break;
      case 3:
        // Existing partners are already saved via event listeners
        console.log('Slide 3: Data already saved via event listeners');
        break;
      case 4:
        // Selected solution is already saved via selectSolution
        console.log('Slide 4: Data already saved via selectSolution');
        break;
      case 5:
        const switchRebateInput = qs('#switchRebate');
        if (switchRebateInput) {
          slideFlowData.switchRebate = parseFloat(switchRebateInput.value) || 0;
          console.log('Slide 5: Rebate saved:', slideFlowData.switchRebate);
        }
        break;
    }
  }

  function prevSlide(slideNumber) {
    showSlide(slideNumber);
  }

  function populateStreamingServices() {
    const container = qs('#currentStreamingServices');
    const services = [
      {id: 'netflix', name: 'Netflix', price: 139, logo: 'N', color: '#e50914'},
      {id: 'viaplay', name: 'Viaplay', price: 149, logo: 'viaplay', color: '#00d4aa'},
      {id: 'hbo', name: 'HBO Max', price: 119, logo: 'HBO<br>max', color: '#8b5cf6'},
      {id: 'tv2play', name: 'TV2 Play', price: 99, logo: 'TV2<br>Play', color: '#3b82f6'},
      {id: 'saxo', name: 'Saxo', price: 79, logo: 'saxo', color: '#f59e0b'},
      {id: 'disney', name: 'Disney+', price: 129, logo: 'Disney+', color: '#1e40af'},
      {id: 'skyshowtime', name: 'SkyShowtime', price: 89, logo: 'skySHO', color: '#dc2626'},
      {id: 'prime', name: 'Prime Video', price: 59, logo: 'prime', color: '#00a8e1'},
      {id: 'musik', name: 'Musik tjeneste', price: 109, logo: '🎵', color: '#10b981'}
    ];
    
    container.innerHTML = services.map(service => `
      <div class="streaming-option" data-stream="${service.id}" onclick="toggleStreamingService('${service.id}')">
        <div class="streaming-logo" style="background: ${service.color}">${service.logo}</div>
        <div class="streaming-name">${service.name}</div>
        <div class="streaming-price">${service.price} kr/md</div>
      </div>
    `).join('');
  }

  function populateExistingPartners() {
    // This function is now handled by the HTML structure in slide 3
    // The partner selection is handled by togglePartner() function
  }

  function generateRecommendedSolutions() {
    console.log('=== generateRecommendedSolutions() called ===');
    const container = qs('#recommendedSolutions');

    // Only show plans from our partners (Telenor, Telmore, CBB)
    const partnerBrands = ['Telenor', 'Telmore', 'CBB'];
    console.log('Existing partners:', Array.from(slideFlowData.existingPartners));
    const availablePlans = PLANS.filter(plan => {
      const hasPartner = slideFlowData.existingPartners.has(plan.brand.toLowerCase());
      const isIncluded = partnerBrands.includes(plan.brand) && !hasPartner;
      if (plan.brand === 'Telmore') {
        console.log(`Telmore filter check: hasPartner=${hasPartner}, isIncluded=${isIncluded}`);
      }
      return isIncluded;
    });
    console.log('Available plans:', availablePlans.length, availablePlans.map(p => `${p.brand} ${p.name}`));
    
    // Check which plans have streaming
    const streamingPlans = availablePlans.filter(plan => 
      plan.features.some(f => f.includes('Streaming'))
    );
    console.log('Plans with streaming:', streamingPlans.length, streamingPlans.map(p => `${p.brand} ${p.name}`));

    // Determine if it's a family (2+ people)
    const isFamily = slideFlowData.familySize >= 2;
    console.log('Is family:', isFamily, 'Family size:', slideFlowData.familySize);

    if (isFamily) {
      // Smart family solution: 1 person gets streaming, others get cheaper plans
      const familySolution = calculateOptimalFamilySolution(availablePlans, slideFlowData.familySize);
      console.log('Family solution:', familySolution);
      recommended = familySolution ? [familySolution] : [];
    } else {
      // Single person: use the same smart algorithm as families
      const singleSolution = calculateOptimalFamilySolution(availablePlans, 1);
      recommended = singleSolution ? [singleSolution] : [];
      console.log('Single person recommended:', recommended.length, recommended.map(p => `${p.brand} ${p.name}`));
    }
    
    console.log('Final recommended array:', recommended.length, recommended);
    
    if (recommended.length === 0) {
      const currentMonthly = slideFlowData.currentMobileTotal;
      let message = '';
      let icon = '😔';
      
      if (currentMonthly && currentMonthly > 0) {
        message = 'Vi kan desværre ikke finde en løsning der sparer penge for kunden. Prøv at justere kundens nuværende udgifter eller fjern nogle eksisterende partnere.';
        icon = '💰';
      } else {
        message = 'Kunden har allerede alle vores partnere. Prøv at fjerne nogle eksisterende partnere i forrige trin.';
      }
      
      container.innerHTML = `
        <div class="result-card" style="text-align: center; padding: 40px;">
          <div style="font-size: 48px; margin-bottom: 16px;">${icon}</div>
          <h4 style="margin: 0 0 8px;">Ingen besparende løsninger fundet</h4>
          <p style="color: var(--muted); margin: 0;">${message}</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = recommended.filter(plan => plan !== null).map((plan, index) => {
      const isTopRecommendation = index === 0;

      // Special handling for family packages
      if (plan && plan.isFamilyPackage) {
        const currentMonthly = slideFlowData.currentMobileTotal;
        const familySavings = currentMonthly - plan.price;
        const isSaving = familySavings > 0;
        const isMoreExpensive = familySavings < 0;

        return `
          <div class="result-card solution-card top-recommendation" data-plan-id="${plan.id}" style="position: relative; border: 2px solid ${isSaving ? '#22c55e' : isMoreExpensive ? '#ef4444' : '#f59e0b'}; box-shadow: 0 0 0 4px rgba(${isSaving ? '34, 197, 94' : isMoreExpensive ? '239, 68, 68' : '245, 158, 11'}, 0.1);">
            <div class="top-badge" style="position: absolute; top: -8px; right: -8px; background: ${isSaving ? '#22c55e' : isMoreExpensive ? '#ef4444' : '#f59e0b'}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">${isSaving ? 'SPARER' : isMoreExpensive ? 'DYRERE' : 'NEUTRAL'}</div>

            <div style="background: rgba(${isSaving ? '34, 197, 94' : isMoreExpensive ? '239, 68, 68' : '245, 158, 11'}, 0.1); border: 1px solid rgba(${isSaving ? '34, 197, 94' : isMoreExpensive ? '239, 68, 68' : '245, 158, 11'}, 0.2); border-radius: 8px; padding: 12px; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 20px;">👨‍👩‍👧‍👦</span>
                <strong style="color: ${isSaving ? '#22c55e' : isMoreExpensive ? '#ef4444' : '#f59e0b'};">Smart familiepakke - ${isSaving ? 'SPARER' : isMoreExpensive ? 'DYRERE' : 'NEUTRAL'} løsning</strong>
              </div>
              <p style="margin: 0; font-size: 14px; color: var(--muted);">
                Optimeret løsning hvor én person får streaming, resten får billigere pakker.
                ${isSaving ? `Du sparer <strong>${familySavings} kr/md</strong> sammenlignet med dine nuværende udgifter.` : 
                  isMoreExpensive ? `Dyrere end nuværende med <strong>${Math.abs(familySavings)} kr/md</strong> ekstra.` :
                  'Samme pris som dine nuværende udgifter.'}
              </p>
              <div style="margin-top: 8px; padding: 8px; background: rgba(0,0,0,0.05); border-radius: 6px; font-size: 12px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>💰 Kunde besparelse:</span>
                  <strong style="color: ${isSaving ? '#22c55e' : isMoreExpensive ? '#ef4444' : '#f59e0b'};">${familySavings} kr/md</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>💼 Vores indtjening:</span>
                  <strong style="color: #22c55e;">${plan.earnings} kr</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-weight: 600; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 4px; margin-top: 4px;">
                  <span>🎯 Win-Win score:</span>
                  <strong style="color: #22c55e;">${Math.round(plan.score || 0)}</strong>
                </div>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div>
                <h4 style="margin: 0 0 4px;">${plan.brand}</h4>
                <div style="color: var(--muted); font-size: 14px;">Komplet løsning for ${plan.familySize} personer</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 28px; font-weight: 700; color: var(--brand);">${plan.price} kr</div>
                <div style="font-size: 12px; color: var(--muted);">ny pris pr. måned</div>
                <div style="font-size: 11px; color: var(--muted); text-decoration: line-through;">vs. ${currentMonthly} kr nuværende</div>
                ${isSaving ? 
                  `<div style="font-size: 14px; color: #22c55e; font-weight: 600; margin-top: 4px;">💰 Sparer ${familySavings} kr/md</div>` : 
                  isMoreExpensive ? 
                  `<div style="font-size: 14px; color: #ef4444; font-weight: 600; margin-top: 4px;">⚠️ Dyrere med ${Math.abs(familySavings)} kr/md</div>` :
                  `<div style="font-size: 14px; color: #f59e0b; font-weight: 600; margin-top: 4px;">⚖️ Samme pris</div>`
                }
              </div>
            </div>

            <div class="family-package-details" style="background: rgba(0,0,0,0.05); border-radius: 8px; padding: 12px; margin-bottom: 16px;">
              <div style="font-weight: 600; margin-bottom: 8px; color: var(--muted);">📋 Pakke detaljer:</div>
              <div style="display: flex; flex-direction: column; gap: 6px; font-size: 14px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>🏆 1× ${plan.streamingPlan.brand} ${plan.streamingPlan.name} <span style="color: #22c55e; font-size: 12px;">(med streaming)</span></span>
                  <strong>${plan.streamingPlan.price} kr</strong>
                </div>
                ${Array.from({length: plan.familySize - 1}, (_, i) => `
                  <div style="display: flex; justify-content: space-between;">
                    <span>📱 ${i + 2}× ${plan.nonStreamingPlan.brand} ${plan.nonStreamingPlan.name}</span>
                    <strong>${plan.nonStreamingPlan.price} kr</strong>
                  </div>
                `).join('')}
                ${plan.isTelenorFamily && plan.familyDiscount > 0 ? `
                  <div style="display: flex; justify-content: space-between; color: #22c55e; font-weight: 600;">
                    <span>🎉 Telenor familiepris (${plan.familySize - 1} × 50 kr rabat):</span>
                    <strong>-${plan.familyDiscount} kr</strong>
                  </div>
                ` : ''}
                <hr style="border: none; border-top: 1px solid rgba(0,0,0,0.1); margin: 8px 0;">
                <div style="display: flex; justify-content: space-between; font-weight: 600;">
                  <span>Total pr. måned:</span>
                  <strong style="color: var(--brand);">${plan.price} kr</strong>
                </div>
                ${plan.isTelenorFamily ? `
                  <div style="font-size: 12px; color: #22c55e; text-align: center; margin-top: 4px;">
                    💰 Inkluderer Telenor familiepris - sparer ${plan.familyDiscount} kr/md
                  </div>
                ` : ''}
              </div>
            </div>

            <div style="margin-bottom: 12px;">
              ${plan.features.map(feature => `<span class="chip" style="margin: 2px; font-size: 11px;">${feature}</span>`).join('')}
            </div>

            <button class="btn-slide primary" onclick="selectSolution('${plan.id}')" style="width: 100%; background: #22c55e; border-color: #22c55e;">
              ⭐ Vælg smart familiepakke
            </button>
          </div>
        `;
      } else {
        // Regular single plan display
        const hasStreaming = plan.features.some(f => f.includes('Streaming') || f.includes('tjenester')) || 
                             plan.id === 'tel-premium' || plan.id === 'tel-ultimate';
        const currentMonthly = slideFlowData.currentMobileTotal;
        const totalCost = plan.price * slideFlowData.familySize;
        const savings = currentMonthly ? currentMonthly - totalCost : null;
        const isSaving = savings && savings > 0;
        const isMoreExpensive = savings && savings < 0;
        
        let recommendationText = '';
        if (plan.note) {
          recommendationText = `<div style="background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.2); border-radius: 6px; padding: 8px; margin-bottom: 12px; font-size: 12px; color: #f59e0b;">⚠️ ${plan.note}</div>`;
        } else if (hasStreaming) {
          recommendationText = '<div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 6px; padding: 8px; margin-bottom: 12px; font-size: 12px; color: #22c55e;">🎬 Inkluderer streaming-tjenester</div>';
        }
        
        // Add win-win score display for single plans
        if (plan.score !== undefined) {
          const earnings = (plan.earnings || 0) * slideFlowData.familySize;
          recommendationText += `
            <div style="background: rgba(0,0,0,0.05); border-radius: 6px; padding: 8px; margin-bottom: 12px; font-size: 12px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span>💰 Kunde besparelse:</span>
                <strong style="color: ${isSaving ? '#22c55e' : isMoreExpensive ? '#ef4444' : '#f59e0b'};">${savings} kr/md</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span>💼 Vores indtjening:</span>
                <strong style="color: #22c55e;">${earnings} kr</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-weight: 600; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 4px;">
                <span>🎯 Win-Win score:</span>
                <strong style="color: #22c55e;">${Math.round(plan.score)}</strong>
              </div>
            </div>
          `;
        }

        return `
          <div class="result-card solution-card" data-plan-id="${plan.id}">
            ${recommendationText}
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div>
                <h4 style="margin: 0 0 4px;">${plan.brand} ${plan.name}</h4>
                <div style="color: var(--muted); font-size: 14px;">${plan.unlimited ? 'Fri data' : plan.dataGB + ' GB data'}</div>
                ${slideFlowData.familySize > 1 ? `<div style="color: var(--muted); font-size: 12px;">× ${slideFlowData.familySize} personer</div>` : ''}
              </div>
              <div style="text-align: right;">
                <div style="font-size: 24px; font-weight: 700; color: var(--brand);">${totalCost} kr</div>
                <div style="font-size: 12px; color: var(--muted);">${slideFlowData.familySize > 1 ? 'total pr. måned' : 'pr. måned'}</div>
                ${currentMonthly ? `<div style="font-size: 11px; color: var(--muted); text-decoration: line-through;">vs. ${currentMonthly} kr nuværende</div>` : ''}
                ${plan.introPrice ? `<div style="font-size: 11px; color: #22c55e; margin-top: 2px;">Startpris: ${plan.introPrice} kr</div>` : ''}
                ${isSaving ? `<div style="font-size: 12px; color: #22c55e; font-weight: 600; margin-top: 2px;">💰 Sparer ${savings} kr/md</div>` : ''}
                ${isMoreExpensive ? `<div style="font-size: 12px; color: #ef4444; font-weight: 600; margin-top: 2px;">⚠️ Dyrere med ${Math.abs(savings)} kr/md</div>` : ''}
              </div>
            </div>
            <div style="margin-bottom: 12px;">
              ${plan.features.map(feature => `<span class="chip ${hasStreaming && feature.includes('Streaming') ? 'streaming-chip' : ''}" style="margin: 2px; font-size: 11px; ${hasStreaming && feature.includes('Streaming') ? 'background: #22c55e; color: white;' : ''}">${feature}</span>`).join('')}
            </div>
            <button class="btn-slide primary" onclick="selectSolution('${plan.id}')" style="width: 100%;">
              Vælg denne løsning
            </button>
          </div>
        `;
      }
    }).join('');
  }

  function calculateOptimalFamilySolution(availablePlans, familySize) {
    console.log('=== calculateOptimalFamilySolution() called ===', 'Family size:', familySize);
    const currentMonthly = slideFlowData.currentMobileTotal;
    console.log('Current monthly mobile cost:', currentMonthly);
    
    // If no current mobile cost is provided, we can't make meaningful recommendations
    if (!currentMonthly || currentMonthly <= 0) {
      console.log('No current mobile cost, using fallback plan');
      // Fallback to highest earning single plan
      const fallbackPlan = availablePlans.sort((a, b) => (b.earnings || 0) - (a.earnings || 0))[0];
      console.log('Fallback plan:', fallbackPlan);
      return {
        ...fallbackPlan,
        qty: familySize,
        isFamilyPackage: false,
        note: 'Indtast kundens nuværende mobiludgifter for at få optimerede anbefalinger'
      };
    }
    
    // Try different combinations to find the best solution
    let bestSolution = null;
    let bestScore = -Infinity;
    
    // Only consider solutions that save money for the customer
    function isSolutionValid(savings, earnings, hasStreamingIncluded = false) {
      // Calculate total customer cost including streaming
      const customerStreamingCost = Array.from(slideFlowData.currentStreamingServices).reduce((total, service) => {
        const prices = {
          netflix: 139, viaplay: 149, hbo: 119, tv2play: 99, 
          saxo: 79, disney: 129, skyshowtime: 89, prime: 59, musik: 109
        };
        return total + (prices[service] || 0);
      }, 0);
      
      // PRIORITET 1: Hvis kunde har streaming-tjenester, skal løsning inkludere streaming
      // Hvis kunde IKKE har streaming, accepter alle løsninger
      const customerHasStreaming = slideFlowData.currentStreamingServices.size > 0;
      if (customerHasStreaming && !hasStreamingIncluded) {
        return false; // Afvis løsninger uden streaming KUN hvis kunde har streaming
      }
      
      const totalCustomerCost = currentMonthly + customerStreamingCost;
      
      // For customers WITH streaming: prioritize streaming solutions
      // For customers WITHOUT streaming: accept all solutions that provide value
      if (customerHasStreaming) {
        // Customer has streaming - prioritize streaming solutions, allow reasonable price increase
        if (hasStreamingIncluded) {
          // Streaming plan - allow up to 300 kr/month increase if significant streaming value
          return savings >= -300;
        } else {
          // Non-streaming plan - must save money on mobile portion
          return savings >= 0;
        }
      } else {
        // Customer has NO streaming - accept all solutions that provide reasonable value
        // Allow price increase based on earnings potential
        const earningsRatio = (earnings || 0) / Math.max(currentMonthly * 6, 600); // Lower baseline for low-cost customers
        const acceptableLoss = earningsRatio > 3 ? 200 : earningsRatio > 2 ? 150 : earningsRatio > 1.5 ? 100 : earningsRatio > 1 ? 50 : 0;
        return savings >= -acceptableLoss;
      }
    }
    
    // Scoring function: prioritize streaming inclusion and maximize earnings within budget
    function calculateSolutionScore(savings, earnings, isFamilyPackage = false, hasStreamingIncluded = false) {
      // Only valid solutions (that save money) get scored
      if (!isSolutionValid(savings, earnings, hasStreamingIncluded)) {
        return -Infinity;
      }
      
      // Calculate real customer cost including streaming
      const customerStreamingCost = Array.from(slideFlowData.currentStreamingServices).reduce((total, service) => {
        const prices = {
          netflix: 139, viaplay: 149, hbo: 119, tv2play: 99, 
          saxo: 79, disney: 129, skyshowtime: 89, prime: 59, musik: 109
        };
        return total + (prices[service] || 0);
      }, 0);
      
      // PRIORITET 1: Hvis kunde har streaming-tjenester, skal løsning inkludere streaming
      // Hvis kunde IKKE har streaming, accepter alle løsninger
      const customerHasStreaming = slideFlowData.currentStreamingServices.size > 0;
      if (customerHasStreaming && !hasStreamingIncluded) {
        return -Infinity; // Afvis løsninger uden streaming KUN hvis kunde har streaming
      }
      
      // PRIORITET 2: Maksimer indtjening inden for kundens budget
      let score = earnings; // Start med indtjening som base score
      
      // Bonus for at inkludere streaming når kunden har det
      if (customerHasStreaming && hasStreamingIncluded) {
        // Calculate streaming value - how much customer saves on streaming
        const streamingSavings = customerStreamingCost; // All streaming costs saved
        score += 500 + (streamingSavings * 0.5); // High bonus plus streaming value
      }
      
      // Bonus for besparelser (sekundært)
      if (savings > 0) {
        score += savings * 0.2; // Slightly higher bonus for actual savings
      } else if (savings >= -100) {
        // Small penalty for slight price increases, but still acceptable
        score += savings * 0.1; // Smaller penalty for small increases
      }
      
      // Bonus for familiepakker
      if (isFamilyPackage) {
        score += 100;
      }
      
      return score;
    }

    // Strategy 1: All Telenor (if available) - benefits from family discount
    const telenorPlans = availablePlans.filter(plan => plan.brand === 'Telenor');
    console.log('Telenor plans available:', telenorPlans.length, telenorPlans.map(p => `${p.name} (${p.price} kr)`));
    if (telenorPlans.length >= 2) {
      const streamingTelenor = telenorPlans.filter(plan => 
        plan.features.some(f => f.includes('Streaming'))
      ).sort((a, b) => (b.earnings || 0) - (a.earnings || 0))[0];
      console.log('Streaming Telenor plan:', streamingTelenor ? `${streamingTelenor.name} (${streamingTelenor.price} kr)` : 'None');
      
      const nonStreamingTelenor = telenorPlans.filter(plan => 
        !plan.features.some(f => f.includes('Streaming'))
      ).sort((a, b) => (b.earnings || 0) - (a.earnings || 0))[0];
      console.log('Non-streaming Telenor plan:', nonStreamingTelenor ? `${nonStreamingTelenor.name} (${nonStreamingTelenor.price} kr)` : 'None');

      if (streamingTelenor && nonStreamingTelenor) {
        const additionalPeople = familySize - 1;
        const baseCost = streamingTelenor.price + (nonStreamingTelenor.price * additionalPeople);
        
        // Telenor family discount: 50 kr per extra line after the first
        const familyDiscount = additionalPeople * 50;
        const totalCost = baseCost - familyDiscount;
        
        const totalEarnings = (streamingTelenor.earnings || 0) + (nonStreamingTelenor.earnings || 0) * additionalPeople;
        
        // Calculate customer streaming cost
        const customerStreamingCost = Array.from(slideFlowData.currentStreamingServices).reduce((total, service) => {
          const prices = {
            netflix: 139, viaplay: 149, hbo: 119, tv2play: 99, 
            saxo: 79, disney: 129, skyshowtime: 89, prime: 59, musik: 109
          };
          return total + (prices[service] || 0);
        }, 0);
        const totalCustomerCost = currentMonthly + customerStreamingCost;
        
        // For streaming solutions, compare against total customer cost
        const savings = totalCustomerCost - totalCost;
        const hasStreaming = true; // Telenor family includes streaming plan
        const score = calculateSolutionScore(savings, totalEarnings, true, hasStreaming);
      
      console.log('Strategy 1 (Telenor Family):', {
        baseCost,
        familyDiscount,
        totalCost,
        totalEarnings,
        savings,
        customerStreamingCost,
        totalCustomerCost,
        score,
        isValid: isSolutionValid(savings, totalEarnings, hasStreaming)
      });
        
        if (isSolutionValid(savings, totalEarnings, hasStreaming) && score > bestScore) {
          bestSolution = {
            id: 'family-solution',
            brand: 'Familiepakke',
            name: `${familySize} personer`,
            price: totalCost,
            earnings: totalEarnings,
            savings: savings,
            score: score,
            familySize: familySize,
            streamingPlan: streamingTelenor,
            nonStreamingPlan: nonStreamingTelenor,
            isFamilyPackage: true,
            isTelenorFamily: true,
            familyDiscount: familyDiscount,
            features: ['Optimeret for familier', `1× ${streamingTelenor.name} med streaming`, `${additionalPeople}× ${nonStreamingTelenor.name}`, 'Telenor familiepris'],
            color: '#22c55e'
          };
          bestScore = score;
        }
      }
    }

    // Strategy 2: Mixed providers (streaming + cheaper non-streaming)
    const customerStreamingCount = slideFlowData.currentStreamingServices.size;
    const streamingPlans = availablePlans.filter(plan =>
      plan.features.some(f => f.includes('Streaming')) ||
      plan.id === 'tel-premium' || // 8 tjenester
      plan.id === 'tel-ultimate'   // 9 tjenester
    ).sort((a, b) => {
      // First priority: match customer's streaming count as closely as possible
      const aStreamingCount = getStreamingServiceCount(a);
      const bStreamingCount = getStreamingServiceCount(b);
      const aMatchScore = Math.abs(customerStreamingCount - aStreamingCount);
      const bMatchScore = Math.abs(customerStreamingCount - bStreamingCount);
      
      if (aMatchScore !== bMatchScore) {
        return aMatchScore - bMatchScore; // Lower difference is better
      }
      
      // Second priority: higher earnings
      return (b.earnings || 0) - (a.earnings || 0);
    });
    
    // Helper function to extract streaming service count from plan
    function getStreamingServiceCount(plan) {
      if (plan.id === 'tel-premium') return 8;
      if (plan.id === 'tel-ultimate') return 9;
      if (plan.id === 'tel-play-100') return 2;
      if (plan.id === 'tel-play-3') return 3;
      if (plan.id === 'tel-play-4') return 4;
      if (plan.id === 'tel-play-5') return 5;
      return 0;
    }

    const nonStreamingPlans = availablePlans.filter(plan =>
      !plan.features.some(f => f.includes('Streaming')) &&
      plan.id !== 'tel-premium' && // 8 tjenester
      plan.id !== 'tel-ultimate'   // 9 tjenester
    ).sort((a, b) => {
      // Balance between low price for customer and high earnings for us
      // Calculate value score: earnings per kr spent by customer
      const aValueScore = (a.earnings || 0) / a.price;
      const bValueScore = (b.earnings || 0) / b.price;
      return bValueScore - aValueScore; // Higher value score first
    });

    if (streamingPlans.length > 0 && nonStreamingPlans.length > 0) {
      const bestStreaming = streamingPlans[0];
      const bestNonStreaming = nonStreamingPlans[0];
      
      console.log('Customer has', customerStreamingCount, 'streaming services');
      console.log('Top 3 streaming plans:');
      streamingPlans.slice(0, 3).forEach((plan, i) => {
        console.log(`  ${i+1}. ${plan.name} (${getStreamingServiceCount(plan)} tjenester, ${plan.earnings} kr indtjening)`);
      });
      console.log('Selected streaming plan:', `${bestStreaming.name} (${getStreamingServiceCount(bestStreaming)} tjenester)`);
      
      const additionalPeople = familySize - 1;
      const totalCost = bestStreaming.price + (bestNonStreaming.price * additionalPeople);
      const totalEarnings = (bestStreaming.earnings || 0) + (bestNonStreaming.earnings || 0) * additionalPeople;
      
      // Calculate customer streaming cost
      const customerStreamingCost2 = Array.from(slideFlowData.currentStreamingServices).reduce((total, service) => {
        const prices = {
          netflix: 139, viaplay: 149, hbo: 119, tv2play: 99, 
          saxo: 79, disney: 129, skyshowtime: 89, prime: 59, musik: 109
        };
        return total + (prices[service] || 0);
      }, 0);
      const totalCustomerCost2 = currentMonthly + customerStreamingCost2;
      
      // For streaming solutions, compare against total customer cost
      const savings = totalCustomerCost2 - totalCost;
      const hasStreaming = true; // Mixed family includes streaming plan
      const score = calculateSolutionScore(savings, totalEarnings, true, hasStreaming);
      
      console.log('Strategy 2 (Mixed Providers):', {
        bestStreaming: `${bestStreaming.brand} ${bestStreaming.name} (${bestStreaming.price} kr)`,
        bestNonStreaming: `${bestNonStreaming.brand} ${bestNonStreaming.name} (${bestNonStreaming.price} kr)`,
        totalCost,
        totalEarnings,
        savings,
        customerStreamingCost: customerStreamingCost2,
        totalCustomerCost: totalCustomerCost2,
        score,
        isValid: isSolutionValid(savings, totalEarnings, hasStreaming)
      });
      
      if (isSolutionValid(savings, totalEarnings, hasStreaming) && score > bestScore) {
        bestSolution = {
          id: 'family-solution',
          brand: 'Familiepakke',
          name: `${familySize} personer`,
          price: totalCost,
          earnings: totalEarnings,
          savings: savings,
          score: score,
          familySize: familySize,
          streamingPlan: bestStreaming,
          nonStreamingPlan: bestNonStreaming,
          isFamilyPackage: true,
          isTelenorFamily: false,
          familyDiscount: 0,
          features: ['Optimeret for familier', `1× ${bestStreaming.name} med streaming`, `${additionalPeople}× ${bestNonStreaming.name}`],
          color: '#22c55e'
        };
        bestScore = score;
      }
    }

    // Strategy 3: Try single plans that save money
    if (!bestSolution) {
      // Try all single plans and find ones that save money
      const validSinglePlans = availablePlans
        .map(plan => {
          // Calculate cost with intro pricing for 6 months
          let totalCost;
          if (plan.introPrice && plan.introMonths) {
            const introTotal = plan.introPrice * plan.introMonths * familySize;
            const remainingMonths = Math.max(0, 6 - plan.introMonths);
            const normalTotal = plan.price * remainingMonths * familySize;
            totalCost = introTotal + normalTotal;
          } else {
            totalCost = plan.price * 6 * familySize;
          }
          // Convert back to monthly average for comparison
          const monthlyCost = totalCost / 6;
          
          const hasStreaming = plan.features.some(f => f.includes('Streaming'));
          
          // Calculate savings correctly based on whether plan includes streaming
          const customerStreamingCost = Array.from(slideFlowData.currentStreamingServices).reduce((total, service) => {
            const prices = {
              netflix: 139, viaplay: 149, hbo: 119, tv2play: 99, 
              saxo: 79, disney: 129, skyshowtime: 89, prime: 59, musik: 109
            };
            return total + (prices[service] || 0);
          }, 0);
          
          let savings;
          if (hasStreaming) {
            // For streaming plans, compare against total customer cost (mobile + streaming)
            const totalCustomerCost = currentMonthly + customerStreamingCost;
            savings = totalCustomerCost - monthlyCost;
          } else {
            // For non-streaming plans, compare against mobile only
            savings = currentMonthly - monthlyCost;
          }
          
          const earnings = (plan.earnings || 0) * familySize;
          
          const result = {
            plan,
            totalCost: monthlyCost, // Use monthly cost for display
            total6Month: totalCost, // Keep 6-month total for reference
            savings,
            earnings,
            score: calculateSolutionScore(savings, earnings, false, hasStreaming)
          };
          
          // Debug logging for specific plan
          if (plan.id === 'tel-play-4') {
            console.log('=== DEBUG: Telmore Fri data + 4 tjenester ===');
            console.log('Plan:', plan);
            console.log('Monthly cost:', monthlyCost);
            console.log('Savings:', savings);
            console.log('Has streaming:', hasStreaming);
            console.log('Is valid:', isSolutionValid(savings, earnings, hasStreaming));
            console.log('Score:', result.score);
          }
          
          return result;
        })
        .filter(item => {
          const isValid = isSolutionValid(item.savings, item.earnings, item.plan.features.some(f => f.includes('Streaming')));
          if (item.plan.id === 'tel-play-4') {
            console.log('Telmore 4 tjenester filter result:', isValid);
          }
          return isValid;
        }) // Only solutions that save money
        .sort((a, b) => b.score - a.score); // Sort by score (balanced savings + earnings)
      
      if (validSinglePlans.length > 0) {
        const bestSingle = validSinglePlans[0];
        return {
          ...bestSingle.plan,
          qty: familySize,
          price: bestSingle.totalCost,
          earnings: bestSingle.earnings,
          savings: bestSingle.savings,
          score: bestSingle.score,
          isFamilyPackage: false,
          note: `Alle ${familySize} personer får samme pakke - sparer ${bestSingle.savings} kr/md`
        };
      }
    }

    console.log('=== calculateOptimalFamilySolution() result ===', 'Best solution:', bestSolution);
    return bestSolution;
  }

  function selectSolution(planId) {
    console.log('Selecting solution:', planId);
    slideFlowData.selectedSolution = planId;
    qsa('.solution-card').forEach(card => {
      card.classList.remove('selected');
    });
    qs(`[data-plan-id="${planId}"]`).classList.add('selected');
    qs('#slide4Next').disabled = false;

    // Handle family package selection
    if (planId === 'family-solution') {
      // Store family package details for later use
      const familySolution = calculateOptimalFamilySolution(
        PLANS.filter(plan =>
          ['Telenor', 'Telmore', 'CBB'].includes(plan.brand) &&
          !slideFlowData.existingPartners.has(plan.brand.toLowerCase())
        ),
        slideFlowData.familySize
      );
      slideFlowData.familyPackage = familySolution;
      console.log('Family package stored:', familySolution);
    } else {
      // Clear family package for single plan selections
      slideFlowData.familyPackage = null;
      console.log('Cleared family package for single plan');
    }

    // Hide streaming hint for families since we now have smart family packages
    const streamingHint = qs('#streamingHint');
    if (streamingHint) {
      streamingHint.innerHTML = '';
    }
  }

  function calculateComparison() {
    const currentMobile = slideFlowData.currentMobileTotal;
    const currentStreaming = Array.from(slideFlowData.currentStreamingServices).reduce((total, serviceId) => {
      const service = STREAMING_SERVICES.find(s => s.id === serviceId);
      return total + (service ? service.price : 0);
    }, 0);
    
    const currentTotal = currentMobile + currentStreaming;
    const current6Total = currentTotal * 6;
    
    // Calculate our solution with proper logic (same as calcTotals)
    let selectedPlan;
    let tempCartItem;

    if (slideFlowData.selectedSolution === 'family-solution' && slideFlowData.familyPackage) {
      // Handle family package
      selectedPlan = slideFlowData.familyPackage;
      tempCartItem = {
        ...selectedPlan,
        qty: 1, // Family package is already calculated for the whole family
        price: selectedPlan.price,
        brand: selectedPlan.streamingPlan.brand, // Use streaming plan's brand for bundle discount
        features: selectedPlan.streamingPlan.features // Use streaming plan's features
      };
    } else {
      // Handle regular single plan
      selectedPlan = PLANS.find(p => p.id === slideFlowData.selectedSolution);
      if (!selectedPlan) return;

      tempCartItem = {
        ...selectedPlan,
        qty: slideFlowData.familySize
      };
    }
    
    // Calculate 6-month total with intro pricing (same logic as calcTotals)
    let our6NoRebate = 0;
    if (tempCartItem.introPrice && tempCartItem.introMonths) {
      // Intro pricing: first X months at intro price, rest at normal price
      const introTotal = tempCartItem.introPrice * tempCartItem.introMonths * tempCartItem.qty;
      const remainingMonths = Math.max(0, 6 - tempCartItem.introMonths);
      const normalTotal = tempCartItem.price * remainingMonths * tempCartItem.qty;
      our6NoRebate = introTotal + normalTotal;
    } else {
      // Normal pricing: 6 months at regular price
      our6NoRebate = tempCartItem.price * 6 * tempCartItem.qty;
    }
    
    // Calculate monthly average
    const monthBeforeDisc = our6NoRebate / 6;
    
    // Telenor samlerabat: 50 kr pr. ekstra Telenor-linje efter den første
    const telenorLines = tempCartItem.brand === 'Telenor' ? tempCartItem.qty : 0;
    const bundleDiscount = Math.max(0, (telenorLines - 1) * 50); // kr/md
    
    // Check if streaming is included in the plan
    const streamingIncluded = tempCartItem.features.some(f => f.includes('Streaming'));
    const streamingExtraCost = streamingIncluded ? 0 : currentStreaming; // If NOT included, add streaming
    
    const ourMonth = Math.max(0, monthBeforeDisc - bundleDiscount + streamingExtraCost);
    const our6 = our6NoRebate - (bundleDiscount * 6) + (streamingExtraCost * 6);
    
    const sixMonthSavings = current6Total - our6;
    const monthlySavings = sixMonthSavings / 6;
    
    // Update display
    qs('#currentMobileCost').textContent = `${currentMobile.toLocaleString('da-DK')} kr`;
    qs('#currentStreamingCost').textContent = `${currentStreaming.toLocaleString('da-DK')} kr`;
    qs('#currentTotalCost').textContent = `${currentTotal.toLocaleString('da-DK')} kr`;
    qs('#ourMobileCost').textContent = `${ourMonth.toLocaleString('da-DK')} kr`;
    qs('#ourStreamingCost').textContent = streamingIncluded ? 'Inkluderet ✓' : `${currentStreaming.toLocaleString('da-DK')} kr`;
    qs('#ourTotalCost').textContent = `${ourMonth.toLocaleString('da-DK')} kr`;
    qs('#totalSavings').textContent = `${sixMonthSavings.toLocaleString('da-DK')} kr`;
    
    slideFlowData.monthlySavings = monthlySavings;
    slideFlowData.sixMonthSavings = sixMonthSavings;
    slideFlowData.ourMonth = ourMonth;
    slideFlowData.our6 = our6;
  }

  function updateFinalSavings() {
    const rebate = slideFlowData.switchRebate || 0;
    
    // Calculate final savings including rebate
    const currentTotal = slideFlowData.currentMobileTotal + Array.from(slideFlowData.currentStreamingServices).reduce((total, serviceId) => {
      const prices = {
        netflix: 139, viaplay: 149, hbo: 119, tv2play: 99, 
        saxo: 79, disney: 129, skyshowtime: 89, prime: 59, musik: 109
      };
      return total + (prices[serviceId] || 0);
    }, 0);
    const current6Total = currentTotal * 6;
    const our6WithRebate = (slideFlowData.our6 || 0) - rebate;
    const totalSavings = current6Total - our6WithRebate;
    
    const finalSavingsElement = qs('#finalSavings');
    if (finalSavingsElement) {
      finalSavingsElement.textContent = `${totalSavings.toLocaleString('da-DK')} kr`;
    }
    
    const finalSavingsCard = qs('#finalSavingsCard');
    if (finalSavingsCard) {
      if (rebate > 0) {
        finalSavingsCard.style.display = 'block';
      } else {
        finalSavingsCard.style.display = 'none';
      }
    }
  }

  function completeSlideFlow() {
    // Apply the solution to the main calculator
    console.log('Selected solution:', slideFlowData.selectedSolution);
    console.log('Family package:', slideFlowData.familyPackage);
    console.log('Family size:', slideFlowData.familySize);
    
    if (slideFlowData.selectedSolution === 'family-solution' && slideFlowData.familyPackage) {
      // Handle family package - create cart with multiple items
      const familyPkg = slideFlowData.familyPackage;
      
      console.log('Creating family package cart...');
      console.log('Streaming plan:', familyPkg.streamingPlan);
      console.log('Non-streaming plan:', familyPkg.nonStreamingPlan);
      console.log('Is Telenor family:', familyPkg.isTelenorFamily);
      
      if (familyPkg.isTelenorFamily) {
        // Telenor family package - all items are Telenor for bundle discount
        state.cart = [
          {
            ...familyPkg.streamingPlan,
            qty: 1,
            name: `${familyPkg.streamingPlan.name} (med streaming)`
          },
          ...Array.from({length: familyPkg.familySize - 1}, () => ({
            ...familyPkg.nonStreamingPlan,
            qty: 1
          }))
        ];
      } else {
        // Mixed provider family package
        state.cart = [
          {
            ...familyPkg.streamingPlan,
            qty: 1,
            name: `${familyPkg.streamingPlan.name} (med streaming)`
          },
          ...Array.from({length: familyPkg.familySize - 1}, () => ({
            ...familyPkg.nonStreamingPlan,
            qty: 1
          }))
        ];
      }
      console.log('Family cart created:', state.cart);
    } else {
      // Handle regular single plan
      console.log('Creating single plan cart...');
      const selectedPlan = PLANS.find(p => p.id === slideFlowData.selectedSolution);
      console.log('Selected plan:', selectedPlan);
      console.log('Selected plan details:', {
        id: selectedPlan?.id,
        name: selectedPlan?.name,
        brand: selectedPlan?.brand,
        price: selectedPlan?.price,
        earnings: selectedPlan?.earnings
      });
      if (selectedPlan) {
        state.cart = [{
          ...selectedPlan,
          qty: slideFlowData.familySize
        }];
        console.log('Single plan cart created:', state.cart);
        console.log('Cart item details:', {
          id: state.cart[0]?.id,
          name: state.cart[0]?.name,
          brand: state.cart[0]?.brand,
          price: state.cart[0]?.price,
          qty: state.cart[0]?.qty
        });
      } else {
        console.error('Selected plan not found:', slideFlowData.selectedSolution);
      }
    }
    
    qs('#curTotal').value = slideFlowData.currentMobileTotal;
    qs('#rebate').value = slideFlowData.switchRebate;
    
    state.selectedStreaming.clear();
    slideFlowData.currentStreamingServices.forEach(serviceId => {
      state.selectedStreaming.add(serviceId);
    });
    
    saveCart();
    saveStreaming();
    renderCart();
    renderStreaming();
    calcTotals();
    
    closeSlideFlow();
    showToast('🎉 Løsning anvendt! Se resultatet i hovedværktøjet.', 'success', 3000);
  }

  // Add event listeners
  const slideFlowBtnEl = qs('#slideFlowBtn');
  if (slideFlowBtnEl) {
    slideFlowBtnEl.addEventListener('click', startSlideFlow);
  }
  qs('#switchRebate').addEventListener('input', updateFinalSavings);

  // Make functions globally available for onclick handlers
  window.startSlideFlow = startSlideFlow;
  window.nextSlide = nextSlide;
  window.prevSlide = prevSlide;
  window.closeSlideFlow = closeSlideFlow;
  window.updateQty = updateQty;
  window.removeItem = removeItem;
  window.selectFamilySize = selectFamilySize;
  window.togglePartner = togglePartner;
  window.toggleStreamingService = toggleStreamingService;
  window.completeSlideFlow = completeSlideFlow;
  window.selectSolution = selectSolution;
  window.updateCBBMixPrice = updateCBBMixPrice;
  window.updateCBBMixCount = updateCBBMixCount;

  return { loadDatabases };
})();

App.loadDatabases();
</script>

<!-- Toast Container -->
<div id="toastContainer" class="toast-container"></div>

</body>
</html>
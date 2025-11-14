/**
 * App.jsx - Hovedkomponent
 * Håndterer global state og orkestrerer alle subkomponenter
 */

import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import Header from './components/Header';
import StreamingSelector from './components/StreamingSelector';
import ProviderTabs from './components/ProviderTabs';
import PlanCard from './components/PlanCard';
import Cart from './components/Cart';
import ComparisonPanel from './components/ComparisonPanel';
import Footer from './components/Footer';

// Lazy load store komponenter
const PresentationView = lazy(() => import('./components/PresentationView'));
import { plans } from './data/plans';
import { findBestSolution } from './utils/calculations';
import { getServiceById, streamingServices as staticStreaming } from './data/streamingServices';
import {
  saveCart,
  loadCart,
  saveSelectedStreaming,
  loadSelectedStreaming,
  saveCustomerMobileCost,
  loadCustomerMobileCost,
  saveNumberOfLines,
  loadNumberOfLines,
  saveOriginalItemPrice,
  loadOriginalItemPrice,
  saveCashDiscount,
  loadCashDiscount,
  saveCashDiscountLocked,
  loadCashDiscountLocked,
  saveAutoAdjust,
  loadAutoAdjust,
  saveTheme,
  loadTheme,
  saveShowCashDiscount,
  loadShowCashDiscount,
  saveExistingBrands,
  loadExistingBrands,
  saveFreeSetup,
  loadFreeSetup,
  resetAll
} from './utils/storage';
import { validatePrice, validateQuantity } from './utils/validators';

function App() {
  // State
  const [cartItems, setCartItems] = useState([]);
  const [selectedStreaming, setSelectedStreaming] = useState([]);
  const [customerMobileCost, setCustomerMobileCost] = useState(0);
  const [numberOfLines, setNumberOfLines] = useState(1);
  const [originalItemPrice, setOriginalItemPrice] = useState(0);
  const [cashDiscount, setCashDiscount] = useState(null);
  const [cashDiscountLocked, setCashDiscountLocked] = useState(false);
  const [autoAdjust, setAutoAdjust] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [showCashDiscount, setShowCashDiscount] = useState(false);
  const [freeSetup, setFreeSetup] = useState(false);
  const [activeProvider, setActiveProvider] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showPresentation, setShowPresentation] = useState(false);
  const [toast, setToast] = useState(null);
  
  // CBB MIX state
  const [cbbMixEnabled, setCbbMixEnabled] = useState({});
  const [cbbMixCount, setCbbMixCount] = useState({});
  
  // Eksisterende brands state
  const [existingBrands, setExistingBrands] = useState([]);

  // EAN søgning state
  const [eanSearchResults, setEanSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search query (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load fra localStorage ved mount
  useEffect(() => {
    const savedCart = loadCart();
    const savedStreaming = loadSelectedStreaming();
    const savedMobileCost = loadCustomerMobileCost();
    const savedNumberOfLines = loadNumberOfLines();
    const savedOriginalItemPrice = loadOriginalItemPrice();
    const savedCashDiscount = loadCashDiscount();
    const savedCashDiscountLocked = loadCashDiscountLocked();
    const savedAutoAdjust = loadAutoAdjust();
    const savedTheme = loadTheme();
    const savedShowCashDiscount = loadShowCashDiscount();
    const savedExistingBrands = loadExistingBrands();
    const savedFreeSetup = loadFreeSetup();

    setCartItems(savedCart);
    setSelectedStreaming(savedStreaming);
    setCustomerMobileCost(savedMobileCost);
    setNumberOfLines(savedNumberOfLines);
    setOriginalItemPrice(savedOriginalItemPrice);
    setCashDiscount(savedCashDiscount);
    setCashDiscountLocked(savedCashDiscountLocked);
    setAutoAdjust(savedAutoAdjust);
    setTheme(savedTheme);
    setShowCashDiscount(savedShowCashDiscount);
    setExistingBrands(savedExistingBrands);
    setFreeSetup(savedFreeSetup);
  }, []);

  // Batch localStorage operations - gem alle state ændringer i én operation
  useEffect(() => {
    saveCart(cartItems);
    saveSelectedStreaming(selectedStreaming);
    saveCustomerMobileCost(customerMobileCost);
    saveNumberOfLines(numberOfLines);
    saveOriginalItemPrice(originalItemPrice);
    saveCashDiscount(cashDiscount);
    saveCashDiscountLocked(cashDiscountLocked);
    saveAutoAdjust(autoAdjust);
    saveShowCashDiscount(showCashDiscount);
    saveExistingBrands(existingBrands);
    saveFreeSetup(freeSetup);
  }, [cartItems, selectedStreaming, customerMobileCost, numberOfLines, originalItemPrice, cashDiscount, cashDiscountLocked, autoAdjust, showCashDiscount, existingBrands, freeSetup]);

  // Theme skal også opdatere DOM - separat useEffect
  useEffect(() => {
    saveTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);



  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handlePointerDown = (event) => {
      const target = event.target.closest('.btn');
      if (!target || !(target instanceof HTMLElement) || target.disabled) return;

      const rect = target.getBoundingClientRect();
      const rippleSize = Math.max(rect.width, rect.height) * 2;
      const rippleX = event.clientX - rect.left;
      const rippleY = event.clientY - rect.top;

      target.style.setProperty('--ripple-size', `${rippleSize}px`);
      target.style.setProperty('--ripple-x', `${rippleX}px`);
      target.style.setProperty('--ripple-y', `${rippleY}px`);

      target.classList.remove('is-rippling');
      // Force reflow to allow retriggering animation
      void target.offsetWidth;
      target.classList.add('is-rippling');

      const handleAnimationEnd = () => {
        target.classList.remove('is-rippling');
      };

      target.addEventListener('animationend', handleAnimationEnd, { once: true });
    };

    const registerPointerListener = () => {
      document.addEventListener('pointerdown', handlePointerDown);
    };

    const unregisterPointerListener = () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };

    const handleMotionChange = (event) => {
      if (event.matches) {
        unregisterPointerListener();
      } else {
        registerPointerListener();
      }
    };

    if (!prefersReducedMotion.matches) {
      registerPointerListener();
    }

    if (prefersReducedMotion.addEventListener) {
      prefersReducedMotion.addEventListener('change', handleMotionChange);
    } else if (prefersReducedMotion.addListener) {
      prefersReducedMotion.addListener(handleMotionChange);
    }

    return () => {
      unregisterPointerListener();
      if (prefersReducedMotion.removeEventListener) {
        prefersReducedMotion.removeEventListener('change', handleMotionChange);
      } else if (prefersReducedMotion.removeListener) {
        prefersReducedMotion.removeListener(handleMotionChange);
      }
    };
  }, []);

  // Toast handler
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Cart handlers
  const handleAddToCart = useCallback((plan) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.plan.id === plan.id);
      
      if (existingItem) {
        // Opdater quantity
        const validation = validateQuantity(existingItem.quantity + 1);
        if (!validation.valid) {
          showToast(validation.error, 'error');
          return prev;
        }
        
        showToast(`${plan.name} opdateret i kurven`);
        return prev.map(item =>
          item.plan.id === plan.id
            ? { ...item, quantity: validation.value }
            : item
        );
      } else {
        // Tilføj ny med CBB Mix data hvis tilgængelig
        const newItem = { 
          plan, 
          quantity: 1,
          cbbMixEnabled: plan.cbbMixAvailable ? (cbbMixEnabled[plan.id] || false) : false,
          cbbMixCount: plan.cbbMixAvailable ? (cbbMixCount[plan.id] || 2) : 0
        };
        showToast(`${plan.name} tilføjet til kurven`);
        return [...prev, newItem];
      }
    });
  }, [cbbMixEnabled, cbbMixCount, showToast]);

  const handleRemoveFromCart = useCallback((planId) => {
    setCartItems(prev => {
      const item = prev.find(item => item.plan.id === planId);
      if (item) {
        showToast(`${item.plan.name} fjernet fra kurven`, 'error');
      }
      return prev.filter(item => item.plan.id !== planId);
    });
  }, [showToast]);

  const handleUpdateQuantity = useCallback((planId, newQuantity) => {
    const validation = validateQuantity(newQuantity);
    if (!validation.valid) {
      showToast(validation.error, 'error');
      return;
    }

    if (validation.value === 0) {
      handleRemoveFromCart(planId);
      return;
    }

    setCartItems(prev => prev.map(item =>
      item.plan.id === planId
        ? { ...item, quantity: validation.value }
        : item
    ));
  }, [handleRemoveFromCart, showToast]);

  // Streaming handlers
  const handleStreamingToggle = useCallback((serviceId) => {
    setSelectedStreaming(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  }, []);

  // Mobile cost handler
  const handleMobileCostChange = useCallback((value) => {
    const validation = validatePrice(value);
    if (validation.valid) {
      setCustomerMobileCost(validation.value);
    }
  }, []);

  // Number of lines handler
  const handleNumberOfLinesChange = useCallback((value) => {
    const validation = validateQuantity(value);
    if (validation.valid) {
      setNumberOfLines(validation.value);
    }
  }, []);

  // Original item price handler
  const handleOriginalItemPriceChange = useCallback((value) => {
    const validation = validatePrice(value);
    if (validation.valid) {
      setOriginalItemPrice(validation.value);
    }
  }, []);

  // Cash discount handler
  const handleCashDiscountChange = useCallback((value) => {
    const validation = validatePrice(value);
    if (validation.valid) {
      setCashDiscount(validation.value);
    }
  }, []);

  // CBB MIX handlers
  const handleCBBMixToggle = useCallback((planId, enabled) => {
    setCbbMixEnabled(prev => ({
      ...prev,
      [planId]: enabled
    }));
    
    if (!enabled) {
      setCbbMixCount(prev => ({
        ...prev,
        [planId]: 2 // Reset to default
      }));
    }
  }, []);

  const handleCBBMixCountChange = useCallback((planId, count) => {
    setCbbMixCount(prev => ({
      ...prev,
      [planId]: count
    }));
  }, []);

  // Reset handler
  const handleReset = useCallback(() => {
    resetAll();
    setCartItems([]);
    setSelectedStreaming([]);
    setCustomerMobileCost(0);
    setNumberOfLines(1);
    setOriginalItemPrice(0);
    setCashDiscount(null);
    setCashDiscountLocked(false);
    setFreeSetup(false);
    setAutoAdjust(false);
    setActiveProvider('all');
    setSearchQuery('');
    setCbbMixEnabled({});
    setCbbMixCount({});
    setExistingBrands([]);
    showToast('Alt nulstillet', 'success');
  }, [showToast]);

  // Theme toggle
  const handleThemeToggle = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  // Presentation toggle
  const handlePresentationToggle = useCallback(() => {
    setShowPresentation(prev => !prev);
  }, []);

  // Close presentation
  const handleClosePresentation = useCallback(() => {
    setShowPresentation(false);
  }, []);

  // Auto-select løsning handler
  const handleAutoSelectSolution = useCallback(() => {
    const availablePlans = plans;
    const availableStreaming = staticStreaming;
    
    // Funktion til at hente streaming-pris
    const getStreamingPrice = (serviceId) => {
      const service = availableStreaming.find(s => s.id === serviceId) || getServiceById(serviceId);
      return service ? (service.price || 0) : 0;
    };
    
    // Find bedste løsning - brug numberOfLines som maksimum
    // Ekskluder planer fra eksisterende brands
    // ALTID ekskluder CBB
    const excludedProviders = ['cbb', ...existingBrands.map(brand => {
      // Konverter brand navn til provider format
      if (brand === 'Telmore') return 'telmore';
      if (brand === 'Telenor') return 'telenor';
      if (brand === 'CBB') return 'cbb';
      return brand.toLowerCase();
    })];
    
    const result = findBestSolution(
      availablePlans,
      selectedStreaming,
      customerMobileCost,
      originalItemPrice,
      getStreamingPrice,
      {
        maxLines: numberOfLines || 5,
        minSavings: -Infinity,
        requiredLines: numberOfLines || 1,
        excludedProviders: excludedProviders
      }
    );
    
    if (result.cartItems && result.cartItems.length > 0) {
      // Opdater kurven med den fundne løsning
      setCartItems(result.cartItems);
      
      // Opdater CBB Mix indstillinger hvis nødvendigt
      const newCbbMixEnabled = {};
      const newCbbMixCount = {};
      result.cartItems.forEach(item => {
        if (item.cbbMixEnabled) {
          newCbbMixEnabled[item.plan.id] = true;
          newCbbMixCount[item.plan.id] = item.cbbMixCount || 2;
        }
      });
      setCbbMixEnabled(newCbbMixEnabled);
      setCbbMixCount(newCbbMixCount);
      
      // Vis besked med forklaring
      showToast(result.explanation, result.savings >= 0 ? 'success' : 'error');
    } else {
      showToast('Kunne ikke finde en løsning. Prøv at tilføje streaming-tjenester eller mobiludgifter.', 'error');
    }
  }, [selectedStreaming, customerMobileCost, originalItemPrice, numberOfLines, existingBrands, showToast]);

  // EAN søgning handler
  const handleEANSearch = useCallback(async (searchResult) => {
    setIsSearching(true);
    setEanSearchResults(searchResult);
    
    // Hvis der er fundet produkter, vis dem i en toast
    if (searchResult.products && searchResult.products.length > 0) {
      const firstProduct = searchResult.products[0];
      const price = searchResult.prices[firstProduct.productId] || firstProduct.price || 'Ukendt pris';
      showToast(`Fundet: ${firstProduct.title || firstProduct.name} - ${price} kr`, 'success');
      
      // Auto-fyld original item price hvis der er en pris
      if (typeof price === 'number' && price > 0) {
        setOriginalItemPrice(price);
        console.log('💰 Pris sat i originalItemPrice:', price);
      }
    } else {
      // Fallback: Brug filterpris hvis min==max
      if (typeof searchResult.fallbackPrice === 'number' && searchResult.fallbackPrice > 0) {
        setOriginalItemPrice(searchResult.fallbackPrice);
        showToast(`Pris fundet: ${searchResult.fallbackPrice} kr (via filter)`, 'success');
        console.log('💰 Fallback pris sat i originalItemPrice:', searchResult.fallbackPrice);
      } else {
        showToast('Ingen produkter fundet for denne søgeterm', 'error');
      }
    }
    
    setIsSearching(false);
  }, [showToast]);

  // Filtrerede planer - memoized for performance (bruger debounced search query)
  const filteredPlans = useMemo(() => {
    const source = plans;
    let filtered = activeProvider === 'all'
      ? source
      : source.filter(p => p.provider === activeProvider);

    // Filtrer baseret på datoer (availableFrom og expiresAt)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Sæt tid til midnat for at sammenligne kun datoer
    
    filtered = filtered.filter(plan => {
      // Tjek availableFrom - plan skal være tilgængelig fra denne dato
      if (plan.availableFrom) {
        const availableFromDate = new Date(plan.availableFrom);
        availableFromDate.setHours(0, 0, 0, 0);
        if (today < availableFromDate) {
          return false; // Plan er ikke tilgængelig endnu
        }
      }
      
      // Tjek expiresAt - plan skal være aktiv indtil denne dato
      if (plan.expiresAt) {
        const expiresAtDate = new Date(plan.expiresAt);
        expiresAtDate.setHours(23, 59, 59, 999); // Inkluder hele dagen
        if (today > expiresAtDate) {
          return false; // Plan er udløbet
        }
      }
      
      return true;
    });

    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(plan => (
        (plan.name || '').toLowerCase().includes(q) ||
        (plan.data || '').toLowerCase().includes(q) ||
        (plan.provider || '').toLowerCase().includes(q) ||
        Array.isArray(plan.features) && plan.features.some(f => (String(f).toLowerCase().includes(q))) ||
        String(plan.price ?? '').includes(q)
      ));
    }

    return filtered;
  }, [activeProvider, debouncedSearchQuery]);

  return (
    <div className="app">
      {/* Header */}
      <Header
        onReset={handleReset}
        onPresentationToggle={handlePresentationToggle}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />

      {/* Main content */}
      <main className="main-content">
        <div className="container">
          {/* Top section: Customer situation */}
          <section className="section fade-in-up">
            <div className="section-shell animate-smooth-scale">
              <StreamingSelector
                selectedStreaming={selectedStreaming}
                onStreamingToggle={handleStreamingToggle}
                customerMobileCost={customerMobileCost}
                onMobileCostChange={handleMobileCostChange}
                numberOfLines={numberOfLines}
                onNumberOfLinesChange={handleNumberOfLinesChange}
                originalItemPrice={originalItemPrice}
                onOriginalItemPriceChange={handleOriginalItemPriceChange}
                onEANSearch={handleEANSearch}
                isSearching={isSearching}
                onAutoSelectSolution={handleAutoSelectSolution}
                existingBrands={existingBrands}
                onExistingBrandsChange={setExistingBrands}
              />
            </div>
          </section>

          <div className="section-divider" aria-hidden="true" style={{ margin: 'var(--spacing-md) auto' }} />

          {/* Middle section: Provider selection & Plans */}
          <section id="plans-section" className="section fade-in-up delay-100">
            <div className="section-shell animate-smooth-scale">
              <div className="plans-section">
                <div className="section-header">
                  <h2 className="section-header__title">
                    <span role="img" aria-hidden="true">📱</span>
                    Vælg Mobilabonnementer &amp; Bredbånd
                  </h2>
                  <p className="section-header__subtitle">
                    Vælg først operatør, derefter de abonnementer, som passer bedst til kunden.
                  </p>
                </div>

                <ProviderTabs
                  activeProvider={activeProvider}
                  onProviderChange={setActiveProvider}
                  searchQuery={searchQuery}
                  onSearch={setSearchQuery}
                />

                {/* Plans grid */}
                {activeProvider === 'all' ? (
                  <div className="empty-state">
                    <div className="empty-state-icon pulse">👆</div>
                    <p className="text-lg font-semibold">Vælg en operatør</p>
                    <p className="text-secondary">
                      Vælg Telmore, Telenor, CBB eller Bredbånd for at se tilgængelige abonnementer.
                    </p>
                  </div>
                ) : filteredPlans.length > 0 ? (
                  <div className="plans-grid grid grid-cols-3">
                    {filteredPlans.map((plan, index) => (
                      <div
                        key={plan.id}
                        className="stagger-item animate-list-item"
                        style={{ animationDelay: `${index * 60}ms` }}
                      >
                        <PlanCard
                          plan={plan}
                          onAddToCart={handleAddToCart}
                          onCBBMixToggle={handleCBBMixToggle}
                          onCBBMixCountChange={handleCBBMixCountChange}
                          cbbMixEnabled={cbbMixEnabled[plan.id] || false}
                          cbbMixCount={cbbMixCount[plan.id] || 2}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon animate-empty-state">🔍</div>
                    <p className="text-lg font-semibold">Ingen abonnementer fundet</p>
                    <p className="text-secondary">
                      Prøv at ændre søgeordet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="section-divider" aria-hidden="true" style={{ margin: 'var(--spacing-md) auto' }} />

          {/* Bottom section: Cart and Comparison side by side */}
          <section className="section fade-in-up delay-200">
            <div className="section-shell section-shell--nest animate-list-item">
              <div className="cart-comparison-grid">
                <div className="cart-wrapper">
                  <Cart
                    cartItems={cartItems}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveFromCart}
                  />
                </div>
                <div className="comparison-wrapper">
                <ComparisonPanel
                  cartItems={cartItems}
                  selectedStreaming={selectedStreaming}
                  customerMobileCost={customerMobileCost}
                  numberOfLines={numberOfLines}
                  originalItemPrice={originalItemPrice}
                  cashDiscount={cashDiscount}
                  onCashDiscountChange={handleCashDiscountChange}
                  cashDiscountLocked={cashDiscountLocked}
                  onCashDiscountLockedChange={setCashDiscountLocked}
                  autoAdjust={autoAdjust}
                  onAutoAdjustChange={setAutoAdjust}
                  showCashDiscount={showCashDiscount}
                  onToggleCashDiscount={useCallback(() => setShowCashDiscount(prev => !prev), [])}
                  freeSetup={freeSetup}
                  onFreeSetupChange={setFreeSetup}
                />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Presentation view */}
      {showPresentation && (
        <Suspense fallback={<div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--app-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>Loading...</div>}>
          <PresentationView
            cartItems={cartItems}
            selectedStreaming={selectedStreaming}
            customerMobileCost={customerMobileCost}
            originalItemPrice={originalItemPrice}
            cashDiscount={cashDiscount}
            freeSetup={freeSetup}
            onClose={handleClosePresentation}
          />
        </Suspense>
      )}

      {/* Toast notification */}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {toast.message}
        </div>
      )}

      {/* Footer */}
      <Footer />

      <style>{`
        .app {
          /* Removed min-height: 100vh to prevent double scrolling - #root handles it */
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
          overflow-y: visible;  /* Let body handle scrolling */
        }

        .main-content {
          flex: 1;
          padding: var(--spacing-md) 0;
          padding-top: calc(120px + var(--spacing-md));
          width: 100%;
          max-width: 100%;
        }

        .plans-section {
          padding: var(--spacing-md);
          transition: all var(--transition-smooth);
        }

        .plans-section:hover {
          border-color: rgba(255, 255, 255, 0.15);
        }

        .section-header {
          margin-bottom: var(--spacing-md);
        }

        .section-header h2 {
          margin-bottom: var(--spacing-sm);
          animation: fadeInDown var(--duration-normal) var(--ease-in-out-cubic);
        }

        .section-header p {
          animation: fadeIn var(--duration-slow) var(--ease-in-out-cubic);
        }

        .plans-grid {
          margin-top: var(--spacing-md);
        }

        .plans-grid .stagger-item {
          height: 100%;
        }

        .plans-grid .stagger-item > * {
          height: 100%;
        }

        .cart-comparison-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-md);
          align-items: start;
        }

        .cart-wrapper,
        .comparison-wrapper {
          width: 100%;
        }

        @media (max-width: 1200px) {
          .cart-comparison-grid {
            grid-template-columns: 1fr;
            gap: var(--spacing-md);
          }
        }

        @media (max-width: 900px) {
          .main-content {
            padding: var(--spacing-lg) 0;  /* Øget vertikal padding */
            padding-top: calc(70px + var(--spacing-lg));  /* Opdateret til ny header højde */
          }

          .plans-section {
            padding: var(--spacing-md);  /* Øget padding for bedre luft */
          }
          
          .section-header {
            margin-bottom: var(--spacing-lg) !important;
          }

          .cart-comparison-grid {
            gap: var(--spacing-lg);  /* Øget gap for bedre separation */
          }
        }

      `}</style>
    </div>
  );
}

export default App;


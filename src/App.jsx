/**
 * App.jsx - Hovedkomponent
 * Håndterer global state og orkestrerer alle subkomponenter
 */

import { useState, useEffect } from 'react';
import Header from './components/Header';
import StreamingSelector from './components/StreamingSelector';
import ProviderTabs from './components/ProviderTabs';
import PlanCard from './components/PlanCard';
import Cart from './components/Cart';
import ComparisonPanel from './components/ComparisonPanel';
import PresentationView from './components/PresentationView';
import Footer from './components/Footer';
import { plans } from './data/plans';
import { canUseSupabase, getPlansCached, getStreamingCached } from './utils/supabaseData';
import { getAppConfig } from './utils/backendApi';
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
  const [activeProvider, setActiveProvider] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPresentation, setShowPresentation] = useState(false);
  const [toast, setToast] = useState(null);
  const [remotePlans, setRemotePlans] = useState(null);
  const [remoteStreaming, setRemoteStreaming] = useState(null);
  const [configLoaded, setConfigLoaded] = useState(false);
  
  // CBB MIX state
  const [cbbMixEnabled, setCbbMixEnabled] = useState({});
  const [cbbMixCount, setCbbMixCount] = useState({});
  
  // Eksisterende brands state
  const [existingBrands, setExistingBrands] = useState([]);

  // EAN søgning state
  const [eanSearchResults, setEanSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

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
  }, []);

  // Gem til localStorage ved ændringer
  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  useEffect(() => {
    saveSelectedStreaming(selectedStreaming);
  }, [selectedStreaming]);

  useEffect(() => {
    saveCustomerMobileCost(customerMobileCost);
  }, [customerMobileCost]);

  useEffect(() => {
    saveNumberOfLines(numberOfLines);
  }, [numberOfLines]);

  useEffect(() => {
    saveOriginalItemPrice(originalItemPrice);
  }, [originalItemPrice]);

  useEffect(() => {
    saveCashDiscount(cashDiscount);
  }, [cashDiscount]);

  useEffect(() => {
    saveCashDiscountLocked(cashDiscountLocked);
  }, [cashDiscountLocked]);

  useEffect(() => {
    saveAutoAdjust(autoAdjust);
  }, [autoAdjust]);

  useEffect(() => {
    saveTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    saveShowCashDiscount(showCashDiscount);
  }, [showCashDiscount]);

  useEffect(() => {
    saveExistingBrands(existingBrands);
  }, [existingBrands]);

  // Skjult genvej: Ctrl + Shift + A åbner admin-siden i ny fane
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const adminSlug = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_SLUG) || 'admin';
    const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';
    const adminPath = `${baseUrl}${adminSlug}.html`;
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && String(e.key).toLowerCase() === 'a') {
        try {
          const url = new URL(adminPath, window.location.origin).toString();
          window.open(url, '_blank', 'noopener,noreferrer');
          e.preventDefault();
        } catch {}
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Hent planer fra Supabase hvis aktivt
  useEffect(() => {
    let mounted = true;
    if (!canUseSupabase()) return;
    (async () => {
      try {
        const list = await getPlansCached();
        if (mounted) setRemotePlans(Array.isArray(list) ? list : []);
      } catch (e) {
        console.warn('Kunne ikke hente planer fra Supabase:', e?.message || e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Hent streaming-tjenester fra Supabase hvis aktivt
  useEffect(() => {
    let mounted = true;
    if (!canUseSupabase()) return;
    (async () => {
      try {
        const list = await getStreamingCached();
        if (mounted && Array.isArray(list) && list.length > 0) {
          setRemoteStreaming(list);
        }
      } catch (e) {
        console.warn('Kunne ikke hente streaming services fra Supabase:', e?.message || e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Hent app-config fra Supabase (feature flags, defaults)
  useEffect(() => {
    let mounted = true;
    if (!canUseSupabase()) { setConfigLoaded(true); return; }
    (async () => {
      try {
        const { ok, data } = await getAppConfig();
        if (!mounted || !ok || !data) { setConfigLoaded(true); return; }

        // Anvend sikre defaults hvis nøgler ikke findes
        if (typeof data.default_theme === 'string') {
          setTheme(prev => prev || data.default_theme);
        }
        if (typeof data.default_provider === 'string') {
          setActiveProvider(prev => (prev === 'all' ? data.default_provider : prev));
        }
        if (typeof data.show_cash_discount === 'boolean') {
          setShowCashDiscount(prev => (prev ?? data.show_cash_discount));
        }
      } catch {
        // Ignorer fejl – app kører videre med lokale defaults
      } finally {
        if (mounted) setConfigLoaded(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

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
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Cart handlers
  const handleAddToCart = (plan) => {
    const existingItem = cartItems.find(item => item.plan.id === plan.id);
    
    if (existingItem) {
      // Opdater quantity
      const validation = validateQuantity(existingItem.quantity + 1);
      if (!validation.valid) {
        showToast(validation.error, 'error');
        return;
      }
      
      setCartItems(cartItems.map(item =>
        item.plan.id === plan.id
          ? { ...item, quantity: validation.value }
          : item
      ));
      showToast(`${plan.name} opdateret i kurven`);
    } else {
      // Tilføj ny med CBB Mix data hvis tilgængelig
      const newItem = { 
        plan, 
        quantity: 1,
        cbbMixEnabled: plan.cbbMixAvailable ? (cbbMixEnabled[plan.id] || false) : false,
        cbbMixCount: plan.cbbMixAvailable ? (cbbMixCount[plan.id] || 2) : 0
      };
      setCartItems([...cartItems, newItem]);
      showToast(`${plan.name} tilføjet til kurven`);
    }
  };

  const handleUpdateQuantity = (planId, newQuantity) => {
    const validation = validateQuantity(newQuantity);
    if (!validation.valid) {
      showToast(validation.error, 'error');
      return;
    }

    if (validation.value === 0) {
      handleRemoveFromCart(planId);
      return;
    }

    setCartItems(cartItems.map(item =>
      item.plan.id === planId
        ? { ...item, quantity: validation.value }
        : item
    ));
  };

  const handleRemoveFromCart = (planId) => {
    const item = cartItems.find(item => item.plan.id === planId);
    setCartItems(cartItems.filter(item => item.plan.id !== planId));
    showToast(`${item?.plan.name} fjernet fra kurven`, 'error');
  };

  // Streaming handlers
  const handleStreamingToggle = (serviceId) => {
    if (selectedStreaming.includes(serviceId)) {
      setSelectedStreaming(selectedStreaming.filter(id => id !== serviceId));
    } else {
      setSelectedStreaming([...selectedStreaming, serviceId]);
    }
  };

  // Mobile cost handler
  const handleMobileCostChange = (value) => {
    const validation = validatePrice(value);
    if (validation.valid) {
      setCustomerMobileCost(validation.value);
    }
  };

  // Number of lines handler
  const handleNumberOfLinesChange = (value) => {
    const validation = validateQuantity(value);
    if (validation.valid) {
      setNumberOfLines(validation.value);
    }
  };

  // Original item price handler
  const handleOriginalItemPriceChange = (value) => {
    const validation = validatePrice(value);
    if (validation.valid) {
      setOriginalItemPrice(validation.value);
    }
  };

  // Cash discount handler
  const handleCashDiscountChange = (value) => {
    const validation = validatePrice(value);
    if (validation.valid) {
      setCashDiscount(validation.value);
    }
  };

  // CBB MIX handlers
  const handleCBBMixToggle = (planId, enabled) => {
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
  };

  const handleCBBMixCountChange = (planId, count) => {
    setCbbMixCount(prev => ({
      ...prev,
      [planId]: count
    }));
  };

  // Reset handler
  const handleReset = () => {
    resetAll();
    setCartItems([]);
    setSelectedStreaming([]);
    setCustomerMobileCost(0);
    setNumberOfLines(1);
    setOriginalItemPrice(0);
    setCashDiscount(null);
    setCashDiscountLocked(false);
    setAutoAdjust(false);
    setActiveProvider('all');
    setSearchQuery('');
    setCbbMixEnabled({});
    setCbbMixCount({});
    setExistingBrands([]);
    showToast('Alt nulstillet', 'success');
  };

  // Theme toggle
  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Auto-select løsning handler
  const handleAutoSelectSolution = () => {
    const availablePlans = (remotePlans && remotePlans.length > 0) ? remotePlans : plans;
    const availableStreaming = (remoteStreaming && remoteStreaming.length > 0) ? remoteStreaming : staticStreaming;
    
    // Funktion til at hente streaming-pris
    const getStreamingPrice = (serviceId) => {
      const service = availableStreaming.find(s => s.id === serviceId) || getServiceById(serviceId);
      return service ? (service.price || 0) : 0;
    };
    
    // Find bedste løsning - brug numberOfLines som maksimum
    // Ekskluder planer fra eksisterende brands
    const excludedProviders = existingBrands.map(brand => {
      // Konverter brand navn til provider format
      if (brand === 'Telmore') return 'telmore';
      if (brand === 'Telenor') return 'telenor';
      if (brand === 'CBB') return 'cbb';
      return brand.toLowerCase();
    });
    
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
  };

  // EAN søgning handler
  const handleEANSearch = async (searchResult) => {
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
  };

  // Filtrerede planer
  const getFilteredPlans = () => {
    const source = (remotePlans && remotePlans.length > 0) ? remotePlans : plans;
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

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(plan => (
        (plan.name || '').toLowerCase().includes(q) ||
        (plan.data || '').toLowerCase().includes(q) ||
        (plan.provider || '').toLowerCase().includes(q) ||
        Array.isArray(plan.features) && plan.features.some(f => (String(f).toLowerCase().includes(q))) ||
        String(plan.price ?? '').includes(q)
      ));
    }

    return filtered;
  };

  const filteredPlans = getFilteredPlans();

  return (
    <div className="app">
      {/* Header */}
      <Header
        onReset={handleReset}
        onPresentationToggle={() => setShowPresentation(!showPresentation)}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        showCashDiscount={showCashDiscount}
        onToggleCashDiscount={() => setShowCashDiscount(!showCashDiscount)}
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

          <div className="section-divider" aria-hidden="true" />

          {/* Middle section: Provider selection & Plans */}
          <section className="section fade-in-up delay-100">
            <div className="section-shell animate-smooth-scale">
              <div className="plans-section">
                <div className="section-header">
                  <h2 className="section-header__title">
                    <span role="img" aria-hidden="true">📱</span>
                    Vælg Mobilabonnementer &amp; Bredbånd
                  </h2>
                  <p className="section-header__subtitle">
                    Vælg først operatør, derefter de abonnementer der passer bedst til kunden
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
                      Vælg Telmore, Telenor, CBB eller Bredbånd for at se tilgængelige abonnementer
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
                      Prøv at ændre søgeordet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="section-divider" aria-hidden="true" />

          {/* Bottom section: Cart & Comparison */}
          <section className="section fade-in-up delay-200">
            <div className="grid grid-cols-2 gap-lg">
              <div className="section-shell section-shell--nest animate-list-item">
                <Cart
                  cartItems={cartItems}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveFromCart}
                />
              </div>
              <div className="section-shell section-shell--nest animate-list-item delay-100">
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
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Presentation view */}
      {showPresentation && (
        <PresentationView
          cartItems={cartItems}
          selectedStreaming={selectedStreaming}
          customerMobileCost={customerMobileCost}
          originalItemPrice={originalItemPrice}
          cashDiscount={cashDiscount}
          onClose={() => setShowPresentation(false)}
        />
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
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .main-content {
          flex: 1;
          padding: var(--spacing-lg) 0;
        }

        .plans-section {
          padding: var(--spacing-lg);
          transition: all var(--transition-smooth);
        }

        .plans-section:hover {
          border-color: rgba(255, 255, 255, 0.15);
        }

        .section-header {
          margin-bottom: var(--spacing-lg);
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

        @media (max-width: 900px) {
          .main-content {
            padding: var(--spacing-lg) 0;
          }

          .plans-section {
            padding: var(--spacing-lg);
          }
        }

      `}</style>
    </div>
  );
}

export default App;


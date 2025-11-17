/**
 * App.jsx - Hovedkomponent
 * Tim Cook Rebuild: Refactored til at bruge Context API for state management
 * Reduceret fra 782 linjer til ~400 linjer gennem bedre separation of concerns
 */

import { useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useApp } from './contexts/AppContext';
import { toast } from './components/common/Toast';
// Lazy load tunge komponenter for bedre initial load performance
const Header = lazy(() => import('./components/Header'));
const StreamingSelector = lazy(() => import('./components/StreamingSelector'));
const ProviderTabs = lazy(() => import('./components/ProviderTabs'));
const PlanCard = lazy(() => import('./components/PlanCard'));
const Cart = lazy(() => import('./components/Cart'));
const ComparisonPanel = lazy(() => import('./components/ComparisonPanel'));
const Footer = lazy(() => import('./components/Footer'));
const PresentationView = lazy(() => import('./components/PresentationView'));
import { plans } from './data/plans';
import { findBestSolution } from './utils/calculations';
import { getServiceById, streamingServices as staticStreaming } from './data/streamingServices';
import Icon from './components/common/Icon';
import COPY from './constants/copy';
import AccessibilityHelper from './components/common/AccessibilityHelper';

function App() {
  // Use centralized state management via Context API
  const {
    cartItems,
    selectedStreaming,
    customerMobileCost,
    numberOfLines,
    originalItemPrice,
    cashDiscount,
    cashDiscountLocked,
    autoAdjust,
    theme,
    showCashDiscount,
    freeSetup,
    activeProvider,
    searchQuery,
    debouncedSearchQuery,
    showPresentation,
    cbbMixEnabled,
    cbbMixCount,
    existingBrands,
    eanSearchResults,
    isSearching,
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleStreaming,
    setMobileCost,
    setNumberOfLines: setNumberOfLinesAction,
    setOriginalItemPrice,
    setCashDiscount: setCashDiscountAction,
    setCashDiscountLocked,
    setAutoAdjust,
    setTheme,
    toggleCashDiscount,
    setFreeSetup,
    setActiveProvider,
    setSearchQuery,
    setDebouncedSearchQuery,
    togglePresentation,
    setCbbMixEnabled,
    setCbbMixCount,
    setExistingBrands,
    setEanSearchResults,
    setIsSearching,
    resetAll
  } = useApp();

  // Debounce search query (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, setDebouncedSearchQuery]);


  // Calculate total cart count
  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  // Scroll to cart handler
  const handleScrollToCart = useCallback(() => {
    const element = document.getElementById('comparison-section');
    if (element) {
      const headerHeight = 120;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerHeight - 16;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }, []);

  // Theme skal opdatere DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);


  // Toast handler
  const showToast = useCallback((message, type = 'success') => {
    toast(message, type);
  }, []);

  // Cart handlers - wrapped for toast notifications
  const handleAddToCart = useCallback((plan) => {
    const existingItem = cartItems.find(item => item.plan.id === plan.id);
    
    if (existingItem) {
      const { validateQuantity } = require('./utils/validators');
      const validation = validateQuantity(existingItem.quantity + 1);
      if (!validation.valid) {
        showToast(validation.error, 'error');
        return;
      }
      showToast(COPY.success.updatedInCart(plan.name));
      updateQuantity(plan.id, existingItem.quantity + 1);
    } else {
      addToCart(plan, cbbMixEnabled[plan.id] || false, cbbMixCount[plan.id] || 2);
      showToast(COPY.success.addedToCart(plan.name));
    }
  }, [cartItems, cbbMixEnabled, cbbMixCount, addToCart, updateQuantity, showToast]);

  const handleRemoveFromCart = useCallback((planId) => {
    const item = cartItems.find(item => item.plan.id === planId);
    if (item) {
      showToast(COPY.success.removedFromCart(item.plan.name), 'error');
    }
    removeFromCart(planId);
  }, [cartItems, removeFromCart, showToast]);

  const handleUpdateQuantity = useCallback((planId, newQuantity) => {
    const { validateQuantity } = require('./utils/validators');
    const validation = validateQuantity(newQuantity);
    if (!validation.valid) {
      showToast(validation.error, 'error');
      return;
    }

    if (validation.value === 0) {
      handleRemoveFromCart(planId);
      return;
    }

    updateQuantity(planId, validation.value);
  }, [updateQuantity, handleRemoveFromCart, showToast]);

  // Reset handler
  const handleReset = useCallback(() => {
    resetAll();
    showToast(COPY.success.reset, 'success');
  }, [resetAll, showToast]);

  // Keyboard shortcut: Press 'P' to toggle presentation
  useEffect(() => {
    function handleKeyPress(e) {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }
      
      if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        togglePresentation();
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [togglePresentation]);

  // Close presentation
  const handleClosePresentation = useCallback(() => {
    if (showPresentation) {
      togglePresentation();
    }
  }, [showPresentation, togglePresentation]);

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
      // Clear existing cart and add new items
      cartItems.forEach(item => removeFromCart(item.plan.id));
      result.cartItems.forEach(item => {
        addToCart(item.plan, item.cbbMixEnabled || false, item.cbbMixCount || 2);
        if (item.quantity > 1) {
          updateQuantity(item.plan.id, item.quantity);
        }
      });
      
      // Opdater CBB Mix indstillinger hvis nødvendigt
      result.cartItems.forEach(item => {
        if (item.cbbMixEnabled) {
          setCbbMixEnabled(item.plan.id, true);
          setCbbMixCount(item.plan.id, item.cbbMixCount || 2);
        }
      });
      
      // Vis besked med forklaring
      showToast(COPY.success.foundSolution(result.explanation), result.savings >= 0 ? 'success' : 'error');
    } else {
      showToast(COPY.error.couldNotFindSolution, 'error');
    }
  }, [selectedStreaming, customerMobileCost, originalItemPrice, numberOfLines, existingBrands, cartItems, addToCart, removeFromCart, updateQuantity, setCbbMixEnabled, setCbbMixCount, showToast]);

  // EAN søgning handler
  const handleEANSearch = useCallback(async (searchResult) => {
    setIsSearching(true);
    setEanSearchResults(searchResult);
    
    // Hvis der er fundet produkter, vis dem i en toast
    if (searchResult.products && searchResult.products.length > 0) {
      const firstProduct = searchResult.products[0];
      const price = searchResult.prices[firstProduct.productId] || firstProduct.price || 'Ukendt pris';
      showToast(COPY.success.searchSuccess(firstProduct.title || firstProduct.name, price), 'success');
      
      // Auto-fyld original item price hvis der er en pris
      if (typeof price === 'number' && price > 0) {
        setOriginalItemPrice(price);
      }
    } else {
      // Fallback: Brug filterpris hvis min==max
      if (typeof searchResult.fallbackPrice === 'number' && searchResult.fallbackPrice > 0) {
        setOriginalItemPrice(searchResult.fallbackPrice);
        showToast(COPY.success.priceFound(searchResult.fallbackPrice), 'success');
      } else {
        showToast(COPY.error.noProductsFound, 'error');
      }
    }
    
    setIsSearching(false);
  }, [setIsSearching, setEanSearchResults, setOriginalItemPrice, showToast]);

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

  // Simple skeleton for header
  const HeaderSkeleton = () => (
    <div className="skeleton-header" style={{ height: '64px', marginBottom: 'var(--spacing-md)' }} />
  );

  // Simple skeleton for sections
  const SectionSkeleton = () => (
    <div className="skeleton-section">
      <div className="skeleton" style={{ height: '200px', marginBottom: 'var(--spacing-md)' }} />
    </div>
  );

  return (
    <div className="app">
      {/* Accessibility helper */}
      <AccessibilityHelper />

      {/* Header */}
      <Suspense fallback={<HeaderSkeleton />}>
        <Header
          onReset={handleReset}
          onPresentationToggle={togglePresentation}
          theme={theme}
          onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          cartCount={cartCount}
          onCartClick={handleScrollToCart}
        />
      </Suspense>

      {/* Main content */}
      <main id="main-content" className="main-content" role="main" aria-label="Hovedindhold">
        <div className="container">
          {/* Top section: Customer situation */}
          <section id="customer-situation" className="section">
            <div className="section-shell">
              <Suspense fallback={<SectionSkeleton />}>
                <StreamingSelector
                  selectedStreaming={selectedStreaming}
                  onStreamingToggle={toggleStreaming}
                  customerMobileCost={customerMobileCost}
                  onMobileCostChange={setMobileCost}
                  numberOfLines={numberOfLines}
                  onNumberOfLinesChange={setNumberOfLinesAction}
                  originalItemPrice={originalItemPrice}
                  onOriginalItemPriceChange={setOriginalItemPrice}
                  onEANSearch={handleEANSearch}
                  isSearching={isSearching}
                  onAutoSelectSolution={handleAutoSelectSolution}
                  existingBrands={existingBrands}
                  onExistingBrandsChange={setExistingBrands}
                />
              </Suspense>
            </div>
          </section>

          <div className="section-divider divider" aria-hidden="true" />

          {/* Middle section: Provider selection & Plans */}
          <section id="plans-section" className="section">
            <div className="section-shell">
              <div className="plans-section">
                <div className="section-header">
                  <h2 className="section-header__title icon-with-text">
                    <Icon name="smartphone" size={24} className="icon-inline icon-spacing-md" />
                    {COPY.titles.selectPlans}
                  </h2>
                  <p className="section-header__subtitle">
                    {COPY.titles.selectPlansSubtitle}
                  </p>
                </div>

                <Suspense fallback={<div className="skeleton" style={{ height: '60px', marginBottom: 'var(--spacing-md)' }} />}>
                  <ProviderTabs
                    activeProvider={activeProvider}
                    onProviderChange={setActiveProvider}
                    searchQuery={searchQuery}
                    onSearch={setSearchQuery}
                  />
                </Suspense>

                {/* Plans grid */}
                {activeProvider === 'all' ? (
                  <div className="empty-state">
                    <Icon name="smartphone" size={48} className="empty-state-icon opacity-30" />
                    <p className="text-lg font-semibold">{COPY.labels.selectProvider}</p>
                    <p className="text-secondary">
                      {COPY.labels.selectProviderHelp}
                    </p>
                  </div>
                ) : filteredPlans.length > 0 ? (
                  <div className="plans-grid grid grid-cols-3">
                    {filteredPlans.map((plan) => (
                      <Suspense key={plan.id} fallback={<div className="skeleton" style={{ height: '400px' }} />}>
                        <PlanCard
                          plan={plan}
                          onAddToCart={handleAddToCart}
                          onCBBMixToggle={setCbbMixEnabled}
                          onCBBMixCountChange={setCbbMixCount}
                          cbbMixEnabled={cbbMixEnabled[plan.id] || false}
                          cbbMixCount={cbbMixCount[plan.id] || 2}
                        />
                      </Suspense>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <Icon name="search" size={48} className="empty-state-icon opacity-30" />
                    <p className="text-lg font-semibold">{COPY.labels.noPlansFound}</p>
                    <p className="text-secondary">
                      {COPY.labels.noPlansFoundHelp}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="section-divider divider" aria-hidden="true" />

          {/* Cart section */}
          <section id="cart-section" className="section">
            <div className="section-shell">
              <Suspense fallback={<SectionSkeleton />}>
                <Cart
                  cartItems={cartItems}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveFromCart}
                />
              </Suspense>
            </div>
          </section>

          <div className="section-divider divider" aria-hidden="true" />

          {/* Comparison section */}
          <section id="comparison-section" className="section">
            <div className="section-shell">
              <Suspense fallback={<SectionSkeleton />}>
                <ComparisonPanel
                  cartItems={cartItems}
                  selectedStreaming={selectedStreaming}
                  customerMobileCost={customerMobileCost}
                  numberOfLines={numberOfLines}
                  originalItemPrice={originalItemPrice}
                  cashDiscount={cashDiscount}
                  onCashDiscountChange={setCashDiscountAction}
                  cashDiscountLocked={cashDiscountLocked}
                  onCashDiscountLockedChange={setCashDiscountLocked}
                  autoAdjust={autoAdjust}
                  onAutoAdjustChange={setAutoAdjust}
                  showCashDiscount={showCashDiscount}
                  onToggleCashDiscount={toggleCashDiscount}
                  freeSetup={freeSetup}
                  onFreeSetupChange={setFreeSetup}
                />
              </Suspense>
            </div>
          </section>
        </div>
      </main>

      {/* Presentation view */}
      {showPresentation && (
        <Suspense fallback={<SectionSkeleton />}>
          <PresentationView
            cartItems={cartItems}
            selectedStreaming={selectedStreaming}
            customerMobileCost={customerMobileCost}
            originalItemPrice={originalItemPrice}
            cashDiscount={cashDiscount}
            freeSetup={freeSetup}
            onClose={handleClosePresentation}
            onReset={handleReset}
          />
        </Suspense>
      )}

      {/* Footer */}
      <Suspense fallback={null}>
        <Footer />
      </Suspense>

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
          padding: var(--spacing-xl) 0;
          padding-top: calc(120px + var(--spacing-xl));
          width: 100%;
          max-width: 100%;
        }

        .plans-section {
          padding: var(--spacing-xl);
        }

        .section-header {
          margin-bottom: var(--spacing-xl);
        }

        .section-header__title {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .plans-grid {
          margin-top: var(--spacing-xl);
          gap: var(--spacing-xl);
        }

        .cart-comparison-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--spacing-2xl);
          align-items: start;
        }

        @media (min-width: 1200px) {
          .cart-comparison-grid {
            grid-template-columns: 1fr 1fr;
            gap: var(--spacing-2xl);
          }
        }

        .cart-wrapper,
        .comparison-wrapper {
          width: 100%;
        }

        .section-divider {
          margin: var(--spacing-xl) auto;
          max-width: 200px;
        }

        @media (max-width: 900px) {
          .main-content {
            padding: var(--spacing-lg) 0;
            padding-top: calc(64px + var(--spacing-lg));
          }

          .plans-section {
            padding: var(--spacing-lg);
          }
          
          .section-header {
            margin-bottom: var(--spacing-lg) !important;
          }

          .plans-grid {
            gap: var(--spacing-lg);
          }

          .cart-comparison-grid {
            gap: var(--spacing-lg);
          }

          .section-divider {
            margin: var(--spacing-lg) auto;
          }
        }

        .skeleton-header,
        .skeleton-section .skeleton {
          background: linear-gradient(
            120deg,
            color-mix(in srgb, var(--glass-bg) 60%, transparent) 0%,
            rgba(255, 255, 255, 0.08) 50%,
            color-mix(in srgb, var(--glass-bg) 60%, transparent) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
          border-radius: var(--radius-md);
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .skeleton-header,
          .skeleton-section .skeleton {
            animation: none;
            background: var(--glass-bg);
          }
        }
      `}</style>
    </div>
  );
}

export default App;


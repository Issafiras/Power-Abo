/**
 * App.jsx - Hovedkomponent
 * Håndterer global state og orkestrerer alle subkomponenter
 */

import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
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
const HelpButton = lazy(() => import('./components/HelpButton'));
const Breadcrumbs = lazy(() => import('./components/common/Breadcrumbs'));
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
import Icon from './components/common/Icon';
import COPY from './constants/copy';
import AccessibilityHelper from './components/common/AccessibilityHelper';

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
  
  // CBB MIX state
  const [cbbMixEnabled, setCbbMixEnabled] = useState({});
  const [cbbMixCount, setCbbMixCount] = useState({});
  
  // Eksisterende brands state
  const [existingBrands, setExistingBrands] = useState([]);

  // EAN søgning state
  const [eanSearchResults, setEanSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Current section for navigation
  const [currentSection, setCurrentSection] = useState(null);

  // Debounce search query (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Section detection for scroll progress and breadcrumbs
  useEffect(() => {
    let ticking = false;
    const sections = [
      { id: 'customer-situation', element: document.getElementById('customer-situation') },
      { id: 'plans-section', element: document.getElementById('plans-section') },
      { id: 'cart-section', element: document.getElementById('cart-section') },
      { id: 'comparison-section', element: document.getElementById('comparison-section') }
    ];

    function detectCurrentSection() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPosition = window.scrollY + 150; // Offset for header

          for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            if (section.element) {
              const rect = section.element.getBoundingClientRect();
              const elementTop = rect.top + window.scrollY;
              
              if (scrollPosition >= elementTop) {
                setCurrentSection(section.id);
                return;
              }
            }
          }
          
          // Default to first section if none found
          setCurrentSection('customer-situation');
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', detectCurrentSection, { passive: true });
    detectCurrentSection(); // Initial detection

    return () => window.removeEventListener('scroll', detectCurrentSection);
  }, []);

  // Calculate if "Find løsning" button should be enabled
  const canFindSolution = useMemo(() => {
    return (selectedStreaming.length > 0 || customerMobileCost > 0) && numberOfLines > 0;
  }, [selectedStreaming.length, customerMobileCost, numberOfLines]);

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


  // Toast handler
  const showToast = useCallback((message, type = 'success') => {
    toast(message, type);
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
        
        showToast(COPY.success.updatedInCart(plan.name));
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
        showToast(COPY.success.addedToCart(plan.name));
        return [...prev, newItem];
      }
    });
  }, [cbbMixEnabled, cbbMixCount, showToast]);

  const handleRemoveFromCart = useCallback((planId) => {
    setCartItems(prev => {
      const item = prev.find(item => item.plan.id === planId);
      if (item) {
        showToast(COPY.success.removedFromCart(item.plan.name), 'error');
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
      showToast(COPY.success.reset, 'success');
  }, [showToast]);

  // Theme toggle
  const handleThemeToggle = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  // Presentation toggle
  const handlePresentationToggle = useCallback(() => {
    setShowPresentation(prev => !prev);
  }, []);

  // Keyboard shortcut: Press 'P' to toggle presentation
  useEffect(() => {
    function handleKeyPress(e) {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }
      
      if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handlePresentationToggle();
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlePresentationToggle]);

  // Close presentation
  const handleClosePresentation = useCallback(() => {
    setShowPresentation(false);
  }, []);

  // Toggle cash discount
  const handleToggleCashDiscount = useCallback(() => {
    setShowCashDiscount(prev => !prev);
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
      showToast(COPY.success.foundSolution(result.explanation), result.savings >= 0 ? 'success' : 'error');
    } else {
      showToast(COPY.error.couldNotFindSolution, 'error');
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
          onPresentationToggle={handlePresentationToggle}
          theme={theme}
          onThemeToggle={handleThemeToggle}
          currentSection={currentSection}
          cartCount={cartCount}
          onCartClick={handleScrollToCart}
          onFindSolutionClick={handleAutoSelectSolution}
          canFindSolution={canFindSolution}
        />
      </Suspense>

      {/* Breadcrumbs */}
      <Suspense fallback={null}>
        <Breadcrumbs 
          currentSection={currentSection} 
          onSectionClick={(sectionId) => setCurrentSection(sectionId)}
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
                          onCBBMixToggle={handleCBBMixToggle}
                          onCBBMixCountChange={handleCBBMixCountChange}
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
                  onCashDiscountChange={handleCashDiscountChange}
                  cashDiscountLocked={cashDiscountLocked}
                  onCashDiscountLockedChange={setCashDiscountLocked}
                  autoAdjust={autoAdjust}
                  onAutoAdjustChange={setAutoAdjust}
                  showCashDiscount={showCashDiscount}
                  onToggleCashDiscount={handleToggleCashDiscount}
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

      {/* Help Button - Floating guide button */}
      <Suspense fallback={null}>
        <HelpButton />
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


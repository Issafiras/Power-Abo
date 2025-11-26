/**
 * App.jsx - Hovedkomponent
 * Bruger Context API for state management og orkestrerer alle subkomponenter
 */

import { useMemo, useCallback, lazy, Suspense, useEffect } from 'react';
import { useAppState } from './hooks/useAppState';
import { useAppActions } from './hooks/useAppActions';
import { useAutoSelectSolution } from './hooks/useAutoSelectSolution';
// Lazy load tunge komponenter for bedre initial load performance
const Header = lazy(() => import('./components/layout/Header'));
const StreamingSelector = lazy(() => import('./features/streaming/StreamingSelector'));
const ProviderTabs = lazy(() => import('./features/plans/ProviderTabs'));
const PlanCard = lazy(() => import('./features/plans/PlanCard'));
const Cart = lazy(() => import('./features/cart/Cart'));
const ComparisonPanel = lazy(() => import('./features/comparison/ComparisonPanel'));
const Footer = lazy(() => import('./components/layout/Footer'));
const PresentationView = lazy(() => import('./features/presentation/PresentationView'));
import { plans } from './data/plans';
import { toast } from './components/common/Toast';
import Icon from './components/common/Icon';
import COPY from './constants/copy';
import AccessibilityHelper from './components/common/AccessibilityHelper';

function App() {
  // Get state from Context
  const state = useAppState();
  const actions = useAppActions();

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

  // Cart handlers - wrapped for compatibility
  const handleAddToCart = useCallback((plan) => {
    actions.addToCart(
      plan,
      state.cbbMixEnabled[plan.id] || false,
      state.cbbMixCount[plan.id] || 2
    );
  }, [actions, state.cbbMixEnabled, state.cbbMixCount]);

  const handleRemoveFromCart = useCallback((planId) => {
    const item = state.cartItems.find(item => item.plan.id === planId);
    actions.removeFromCart(planId, item?.plan.name);
  }, [actions, state.cartItems]);

  const handleUpdateQuantity = useCallback((planId, newQuantity) => {
    actions.updateQuantity(planId, newQuantity);
  }, [actions]);

  // Auto-select løsning handler
  const handleAutoSelectSolution = useAutoSelectSolution(state, actions);

  // EAN søgning handler
  const handleEANSearch = useCallback(async (searchResult) => {
    actions.setIsSearching(true);
    actions.setEanSearchResults(searchResult);

    // Hvis der er fundet produkter, vis dem i en toast
    if (searchResult.products && searchResult.products.length > 0) {
      const firstProduct = searchResult.products[0];
      const price = searchResult.prices[firstProduct.productId] || firstProduct.price || 'Ukendt pris';
      toast(COPY.success.searchSuccess(firstProduct.title || firstProduct.name, price), 'success');

      // Auto-fyld original item price hvis der er en pris
      if (typeof price === 'number' && price > 0) {
        actions.setOriginalItemPrice(price);
      }
    } else {
      // Fallback: Brug filterpris hvis min==max
      if (typeof searchResult.fallbackPrice === 'number' && searchResult.fallbackPrice > 0) {
        actions.setOriginalItemPrice(searchResult.fallbackPrice);
        toast(COPY.success.priceFound(searchResult.fallbackPrice), 'success');
      } else {
        toast(COPY.error.noProductsFound, 'error');
      }
    }

    actions.setIsSearching(false);
  }, [actions]);

  // Cache dagens dato - kun opdater ved midnat (beregnes én gang per session)
  const todayMidnight = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.getTime(); // Brug timestamp for hurtigere sammenligning
  }, []); // Tom array = beregnes kun én gang ved mount

  // Filtrerede planer - memoized for performance (bruger debounced search query)
  const filteredPlans = useMemo(() => {
    const source = plans;
    let filtered = state.activeProvider === 'all'
      ? source
      : source.filter(p => p.provider === state.activeProvider);

    // Filtrer baseret på datoer (availableFrom og expiresAt)
    filtered = filtered.filter(plan => {
      // Tjek availableFrom - plan skal være tilgængelig fra denne dato
      if (plan.availableFrom) {
        const availableFromDate = new Date(plan.availableFrom);
        availableFromDate.setHours(0, 0, 0, 0);
        if (todayMidnight < availableFromDate.getTime()) {
          return false; // Plan er ikke tilgængelig endnu
        }
      }

      // Tjek expiresAt - plan skal være aktiv indtil denne dato
      // VIGTIGT: Kun ekskluder hvis expiresAt er sat (ikke campaignExpiresAt)
      // campaignExpiresAt betyder kun at kampagneprisen udløber, ikke planen selv
      if (plan.expiresAt && !plan.campaignExpiresAt) {
        const expiresAtDate = new Date(plan.expiresAt);
        expiresAtDate.setHours(23, 59, 59, 999);
        if (todayMidnight > expiresAtDate.getTime()) {
          return false; // Plan er udløbet
        }
      }

      return true;
    });

    if (state.debouncedSearchQuery.trim()) {
      const q = state.debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(plan => (
        (plan.name || '').toLowerCase().includes(q) ||
        (plan.data || '').toLowerCase().includes(q) ||
        (plan.provider || '').toLowerCase().includes(q) ||
        Array.isArray(plan.features) && plan.features.some(f => (String(f).toLowerCase().includes(q))) ||
        String(plan.price ?? '').includes(q)
      ));
    }

    return filtered;
  }, [state.activeProvider, state.debouncedSearchQuery, todayMidnight]);

  // Keyboard shortcut: Press 'P' to toggle presentation
  useEffect(() => {
    function handleKeyPress(e) {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }

      if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        actions.togglePresentation();
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [actions]);

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
          onReset={actions.resetAll}
          onPresentationToggle={actions.togglePresentation}
          theme={state.theme}
          onThemeToggle={() => actions.toggleTheme(state.theme)}
          cartCount={state.cartCount}
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
                  selectedStreaming={state.selectedStreaming}
                  onStreamingToggle={actions.toggleStreaming}
                  customerMobileCost={state.customerMobileCost}
                  onMobileCostChange={actions.setMobileCost}
                  numberOfLines={state.numberOfLines}
                  onNumberOfLinesChange={actions.setNumberOfLines}
                  originalItemPrice={state.originalItemPrice}
                  onOriginalItemPriceChange={actions.setOriginalItemPrice}
                  onEANSearch={handleEANSearch}
                  isSearching={state.isSearching}
                  onAutoSelectSolution={handleAutoSelectSolution}
                  existingBrands={state.existingBrands}
                  onExistingBrandsChange={actions.setExistingBrands}
                  cartItems={state.cartItems}
                  onCBBMixEnabled={actions.setCBBMixEnabled}
                  onCBBMixCount={actions.setCBBMixCount}
                  activeProvider={state.activeProvider}
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
                    activeProvider={state.activeProvider}
                    onProviderChange={actions.setActiveProvider}
                    searchQuery={state.searchQuery}
                    onSearch={actions.setSearchQuery}
                  />
                </Suspense>

                {/* Plans grid */}
                {state.activeProvider === 'all' ? (
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
                          onCBBMixToggle={actions.setCBBMixEnabled}
                          onCBBMixCountChange={actions.setCBBMixCount}
                          cbbMixEnabled={state.cbbMixEnabled[plan.id] || false}
                          cbbMixCount={state.cbbMixCount[plan.id] || 2}
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
                  cartItems={state.cartItems}
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
                  cartItems={state.cartItems}
                  selectedStreaming={state.selectedStreaming}
                  customerMobileCost={state.customerMobileCost}
                  numberOfLines={state.numberOfLines}
                  originalItemPrice={state.originalItemPrice}
                  cashDiscount={state.cashDiscount}
                  onCashDiscountChange={actions.setCashDiscount}
                  cashDiscountLocked={state.cashDiscountLocked}
                  onCashDiscountLockedChange={actions.setCashDiscountLocked}
                  autoAdjust={state.autoAdjust}
                  onAutoAdjustChange={actions.setAutoAdjust}
                  showCashDiscount={state.showCashDiscount}
                  onToggleCashDiscount={actions.toggleCashDiscount}
                />
              </Suspense>
            </div>
          </section>
        </div>
      </main>

      {/* Presentation view */}
      {state.showPresentation && (
        <Suspense fallback={<SectionSkeleton />}>
          <PresentationView
            cartItems={state.cartItems}
            selectedStreaming={state.selectedStreaming}
            customerMobileCost={state.customerMobileCost}
            originalItemPrice={state.originalItemPrice}
            cashDiscount={state.cashDiscount}
            onClose={() => actions.setShowPresentation(false)}
            onReset={actions.resetAll}
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
          padding: var(--spacing-lg) 0;
          padding-top: calc(120px + var(--spacing-lg));
          width: 100%;
          max-width: 100%;
        }

        .plans-section {
          padding: var(--spacing-md);
        }

        .section-header {
          margin-bottom: var(--spacing-md);
        }

        .section-header__title {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--font-2xl);
        }

        .plans-grid {
          margin-top: var(--spacing-md);
          gap: var(--spacing-md);
        }

        .cart-comparison-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--spacing-lg);
          align-items: start;
        }

        @media (min-width: 1200px) {
          .cart-comparison-grid {
            grid-template-columns: 1fr 1fr;
            gap: var(--spacing-lg);
          }
        }

        .cart-wrapper,
        .comparison-wrapper {
          width: 100%;
        }

        .section-divider {
          margin: var(--spacing-lg) auto;
          max-width: 200px;
        }

        @media (max-width: 900px) {
          .main-content {
            padding: var(--spacing-lg) 0;
            padding-top: calc(64px + var(--spacing-lg));
          }

          .plans-section {
            padding: var(--spacing-md);
          }
          
          .section-header {
            margin-bottom: var(--spacing-md) !important;
          }

          .plans-grid {
            gap: var(--spacing-md);
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

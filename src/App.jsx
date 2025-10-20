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
import { plans, getPlansByProvider, searchPlans } from './data/plans';
import {
  saveCart,
  loadCart,
  saveSelectedStreaming,
  loadSelectedStreaming,
  saveCustomerMobileCost,
  loadCustomerMobileCost,
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
  resetAll
} from './utils/storage';
import { validatePrice, validateQuantity } from './utils/validators';

function App() {
  // State
  const [cartItems, setCartItems] = useState([]);
  const [selectedStreaming, setSelectedStreaming] = useState([]);
  const [customerMobileCost, setCustomerMobileCost] = useState(0);
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
  
  // CBB MIX state
  const [cbbMixEnabled, setCbbMixEnabled] = useState({});
  const [cbbMixCount, setCbbMixCount] = useState({});

  // EAN søgning state
  const [eanSearchResults, setEanSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Load fra localStorage ved mount
  useEffect(() => {
    const savedCart = loadCart();
    const savedStreaming = loadSelectedStreaming();
    const savedMobileCost = loadCustomerMobileCost();
    const savedOriginalItemPrice = loadOriginalItemPrice();
    const savedCashDiscount = loadCashDiscount();
    const savedCashDiscountLocked = loadCashDiscountLocked();
    const savedAutoAdjust = loadAutoAdjust();
    const savedTheme = loadTheme();
    const savedShowCashDiscount = loadShowCashDiscount();

    setCartItems(savedCart);
    setSelectedStreaming(savedStreaming);
    setCustomerMobileCost(savedMobileCost);
    setOriginalItemPrice(savedOriginalItemPrice);
    setCashDiscount(savedCashDiscount);
    setCashDiscountLocked(savedCashDiscountLocked);
    setAutoAdjust(savedAutoAdjust);
    setTheme(savedTheme);
    setShowCashDiscount(savedShowCashDiscount);
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
    setOriginalItemPrice(0);
    setCashDiscount(null);
    setCashDiscountLocked(false);
    setAutoAdjust(false);
    setActiveProvider('all');
    setSearchQuery('');
    setCbbMixEnabled({});
    setCbbMixCount({});
    showToast('Alt nulstillet', 'success');
  };

  // Theme toggle
  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
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
    let filtered = activeProvider === 'all' 
      ? plans 
      : getPlansByProvider(activeProvider);
    
    if (searchQuery.trim()) {
      filtered = searchPlans(searchQuery).filter(plan => 
        activeProvider === 'all' || plan.provider === activeProvider
      );
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
            <StreamingSelector
              selectedStreaming={selectedStreaming}
              onStreamingToggle={handleStreamingToggle}
              customerMobileCost={customerMobileCost}
              onMobileCostChange={handleMobileCostChange}
              originalItemPrice={originalItemPrice}
              onOriginalItemPriceChange={handleOriginalItemPriceChange}
              onEANSearch={handleEANSearch}
              isSearching={isSearching}
            />
          </section>

          {/* Middle section: Provider selection & Plans */}
          <section className="section fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="plans-section glass-card">
              <div className="section-header">
                <h2>📱 Vælg Mobilabonnementer</h2>
                <p className="text-secondary">
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
                    Vælg Telmore, Telenor eller CBB for at se tilgængelige abonnementer
                  </p>
                </div>
              ) : filteredPlans.length > 0 ? (
                <div className="plans-grid grid grid-cols-3">
                  {filteredPlans.map((plan, index) => (
                    <div key={plan.id} className="stagger-item" style={{ animationDelay: `${index * 50}ms` }}>
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
                  <div className="empty-state-icon">🔍</div>
                  <p className="text-lg font-semibold">Ingen abonnementer fundet</p>
                  <p className="text-secondary">
                    Prøv at ændre søgeordet
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Bottom section: Cart & Comparison */}
          <section className="section fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="grid grid-cols-2">
              <Cart
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveFromCart}
              />
              <ComparisonPanel
                cartItems={cartItems}
                selectedStreaming={selectedStreaming}
                customerMobileCost={customerMobileCost}
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


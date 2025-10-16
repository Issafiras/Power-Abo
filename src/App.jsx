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
import { plans, getPlansByProvider, searchPlans } from './data/plans';
import {
  saveCart,
  loadCart,
  saveSelectedStreaming,
  loadSelectedStreaming,
  saveCustomerMobileCost,
  loadCustomerMobileCost,
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
  const [cashDiscount, setCashDiscount] = useState(0);
  const [cashDiscountLocked, setCashDiscountLocked] = useState(false);
  const [autoAdjust, setAutoAdjust] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [showCashDiscount, setShowCashDiscount] = useState(true);
  const [activeProvider, setActiveProvider] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPresentation, setShowPresentation] = useState(false);
  const [toast, setToast] = useState(null);

  // Load fra localStorage ved mount
  useEffect(() => {
    const savedCart = loadCart();
    const savedStreaming = loadSelectedStreaming();
    const savedMobileCost = loadCustomerMobileCost();
    const savedCashDiscount = loadCashDiscount();
    const savedCashDiscountLocked = loadCashDiscountLocked();
    const savedAutoAdjust = loadAutoAdjust();
    const savedTheme = loadTheme();
    const savedShowCashDiscount = loadShowCashDiscount();

    setCartItems(savedCart);
    setSelectedStreaming(savedStreaming);
    setCustomerMobileCost(savedMobileCost);
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
      // Tilføj ny
      setCartItems([...cartItems, { plan, quantity: 1 }]);
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

  // Cash discount handler
  const handleCashDiscountChange = (value) => {
    const validation = validatePrice(value);
    if (validation.valid) {
      setCashDiscount(validation.value);
    }
  };

  // Reset handler
  const handleReset = () => {
    resetAll();
    setCartItems([]);
    setSelectedStreaming([]);
    setCustomerMobileCost(0);
    setCashDiscount(0);
    setCashDiscountLocked(false);
    setAutoAdjust(false);
    setActiveProvider('all');
    setSearchQuery('');
    showToast('Alt nulstillet', 'success');
  };

  // Theme toggle
  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
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
          <section className="section">
            <StreamingSelector
              selectedStreaming={selectedStreaming}
              onStreamingToggle={handleStreamingToggle}
              customerMobileCost={customerMobileCost}
              onMobileCostChange={handleMobileCostChange}
            />
          </section>

          {/* Middle section: Cart & Comparison */}
          <section className="section">
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

          {/* Bottom section: Plans */}
          <section className="section">
            <div className="plans-section glass-card">
              <div className="section-header">
                <h2>📱 Vælg Mobilabonnementer</h2>
                <p className="text-secondary">
                  Vælg de planer der passer bedst til kunden
                </p>
              </div>

              <ProviderTabs
                activeProvider={activeProvider}
                onProviderChange={setActiveProvider}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
              />

              {/* Plans grid */}
              {filteredPlans.length > 0 ? (
                <div className="plans-grid grid grid-cols-3">
                  {filteredPlans.map(plan => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">🔍</div>
                  <p className="text-lg font-semibold">Ingen planer fundet</p>
                  <p className="text-secondary">
                    Prøv at ændre filter eller søgeord
                  </p>
                </div>
              )}
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

      <style jsx>{`
        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .main-content {
          flex: 1;
          padding: var(--spacing-2xl) 0;
        }

        .plans-section {
          padding: var(--spacing-2xl);
        }

        .section-header {
          margin-bottom: var(--spacing-xl);
        }

        .section-header h2 {
          margin-bottom: var(--spacing-sm);
        }

        .plans-grid {
          margin-top: var(--spacing-xl);
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


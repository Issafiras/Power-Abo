/**
 * AppContext - Central state management med Context API og reducer pattern
 * Konsoliderer al app state i én provider for at eliminere prop drilling
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { ActionTypes } from './ActionTypes';
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
  saveBroadbandCost,
  loadBroadbandCost,
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
  resetAll as resetStorage
} from '../utils/storage';

// Initial state
const initialState = {
  cart: {
    items: [],
    count: 0
  },
  customer: {
    mobileCost: 0,
    numberOfLines: 1,
    originalItemPrice: 0,
    existingBrands: [],
    broadbandCost: 0
  },
  streaming: {
    selected: [],
    total: 0
  },
  settings: {
    theme: 'dark',
    cashDiscount: null,
    cashDiscountLocked: false,
    autoAdjust: false,
    showCashDiscount: false,
    freeSetup: false
  },
  ui: {
    activeProvider: 'all',
    searchQuery: '',
    debouncedSearchQuery: '',
    showPresentation: false,
    cbbMixEnabled: {},
    cbbMixCount: {},
    eanSearchResults: null,
    isSearching: false,
    showHelpGuide: false
  }
};

// Action types imported from separate file to fix Fast Refresh issues

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    // Cart actions
    case ActionTypes.ADD_TO_CART: {
      const { plan, cbbMixEnabled, cbbMixCount } = action.payload;
      const existingItem = state.cart.items.find(item => item.plan.id === plan.id);
      
      let newItems;
      if (existingItem) {
        newItems = state.cart.items.map(item =>
          item.plan.id === plan.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...state.cart.items, {
          plan,
          quantity: 1,
          cbbMixEnabled: plan.cbbMixAvailable ? (cbbMixEnabled || false) : false,
          cbbMixCount: plan.cbbMixAvailable ? (cbbMixCount || 2) : 0
        }];
      }
      
      const count = newItems.reduce((sum, item) => sum + item.quantity, 0);
      return {
        ...state,
        cart: { items: newItems, count }
      };
    }
    
    case ActionTypes.REMOVE_FROM_CART: {
      const newItems = state.cart.items.filter(item => item.plan.id !== action.payload);
      const count = newItems.reduce((sum, item) => sum + item.quantity, 0);
      return {
        ...state,
        cart: { items: newItems, count }
      };
    }
    
    case ActionTypes.UPDATE_QUANTITY: {
      const { planId, quantity } = action.payload;
      if (quantity === 0) {
        return appReducer(state, { type: ActionTypes.REMOVE_FROM_CART, payload: planId });
      }
      const newItems = state.cart.items.map(item =>
        item.plan.id === planId
          ? { ...item, quantity }
          : item
      );
      const count = newItems.reduce((sum, item) => sum + item.quantity, 0);
      return {
        ...state,
        cart: { items: newItems, count }
      };
    }
    
    case ActionTypes.SET_CART: {
      const items = action.payload;
      const count = items.reduce((sum, item) => sum + item.quantity, 0);
      return {
        ...state,
        cart: { items, count }
      };
    }
    
    case ActionTypes.CLEAR_CART:
      return {
        ...state,
        cart: { items: [], count: 0 }
      };
    
    // Customer actions
    case ActionTypes.SET_MOBILE_COST:
      return {
        ...state,
        customer: { ...state.customer, mobileCost: action.payload }
      };
    
    case ActionTypes.SET_NUMBER_OF_LINES:
      return {
        ...state,
        customer: { ...state.customer, numberOfLines: action.payload }
      };
    
    case ActionTypes.SET_ORIGINAL_ITEM_PRICE:
      return {
        ...state,
        customer: { ...state.customer, originalItemPrice: action.payload }
      };
    
    case ActionTypes.SET_EXISTING_BRANDS:
      return {
        ...state,
        customer: { ...state.customer, existingBrands: action.payload }
      };

    case ActionTypes.SET_BROADBAND_COST:
      return {
        ...state,
        customer: { ...state.customer, broadbandCost: action.payload }
      };

    // Streaming actions
    case ActionTypes.TOGGLE_STREAMING: {
      const serviceId = action.payload;
      const selected = state.streaming.selected.includes(serviceId)
        ? state.streaming.selected.filter(id => id !== serviceId)
        : [...state.streaming.selected, serviceId];
      return {
        ...state,
        streaming: { ...state.streaming, selected }
      };
    }
    
    case ActionTypes.SET_STREAMING:
      return {
        ...state,
        streaming: { ...state.streaming, selected: action.payload }
      };
    
    case ActionTypes.CLEAR_STREAMING:
      return {
        ...state,
        streaming: { selected: [], total: 0 }
      };
    
    // Settings actions
    case ActionTypes.SET_THEME:
      return {
        ...state,
        settings: { ...state.settings, theme: action.payload }
      };
    
    case ActionTypes.SET_CASH_DISCOUNT:
      return {
        ...state,
        settings: { ...state.settings, cashDiscount: action.payload }
      };
    
    case ActionTypes.SET_CASH_DISCOUNT_LOCKED:
      return {
        ...state,
        settings: { ...state.settings, cashDiscountLocked: action.payload }
      };
    
    case ActionTypes.SET_AUTO_ADJUST:
      return {
        ...state,
        settings: { ...state.settings, autoAdjust: action.payload }
      };
    
    case ActionTypes.SET_SHOW_CASH_DISCOUNT:
      return {
        ...state,
        settings: { ...state.settings, showCashDiscount: action.payload }
      };
    
    case ActionTypes.TOGGLE_CASH_DISCOUNT:
      return {
        ...state,
        settings: { ...state.settings, showCashDiscount: !state.settings.showCashDiscount }
      };
    
    case ActionTypes.SET_FREE_SETUP:
      return {
        ...state,
        settings: { ...state.settings, freeSetup: action.payload }
      };
    
    // UI actions
    case ActionTypes.SET_ACTIVE_PROVIDER:
      return {
        ...state,
        ui: { ...state.ui, activeProvider: action.payload }
      };
    
    case ActionTypes.SET_SEARCH_QUERY:
      return {
        ...state,
        ui: { ...state.ui, searchQuery: action.payload }
      };
    
    case ActionTypes.SET_DEBOUNCED_SEARCH_QUERY:
      return {
        ...state,
        ui: { ...state.ui, debouncedSearchQuery: action.payload }
      };
    
    case ActionTypes.SET_SHOW_PRESENTATION:
      return {
        ...state,
        ui: { ...state.ui, showPresentation: action.payload }
      };
    
    case ActionTypes.TOGGLE_PRESENTATION:
      return {
        ...state,
        ui: { ...state.ui, showPresentation: !state.ui.showPresentation }
      };

    case ActionTypes.SET_SHOW_HELP_GUIDE:
      return {
        ...state,
        ui: { ...state.ui, showHelpGuide: action.payload }
      };

    case ActionTypes.TOGGLE_HELP_GUIDE:
      return {
        ...state,
        ui: { ...state.ui, showHelpGuide: !state.ui.showHelpGuide }
      };

    case ActionTypes.SET_CBB_MIX_ENABLED: {
      const { planId, enabled } = action.payload;
      return {
        ...state,
        ui: {
          ...state.ui,
          cbbMixEnabled: { ...state.ui.cbbMixEnabled, [planId]: enabled }
        }
      };
    }
    
    case ActionTypes.SET_CBB_MIX_COUNT: {
      const { planId, count } = action.payload;
      return {
        ...state,
        ui: {
          ...state.ui,
          cbbMixCount: { ...state.ui.cbbMixCount, [planId]: count }
        }
      };
    }
    
    case ActionTypes.SET_EAN_SEARCH_RESULTS:
      return {
        ...state,
        ui: { ...state.ui, eanSearchResults: action.payload }
      };
    
    case ActionTypes.SET_IS_SEARCHING:
      return {
        ...state,
        ui: { ...state.ui, isSearching: action.payload }
      };
    
    // Reset
    case ActionTypes.RESET_ALL:
      return initialState;
    
    // Load state
    case ActionTypes.LOAD_STATE:
      return action.payload;
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext(null);

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = {
      cart: {
        items: loadCart(),
        count: 0
      },
      customer: {
        mobileCost: loadCustomerMobileCost(),
        numberOfLines: loadNumberOfLines(),
        originalItemPrice: loadOriginalItemPrice(),
        existingBrands: loadExistingBrands(),
        broadbandCost: loadBroadbandCost()
      },
      streaming: {
        selected: loadSelectedStreaming(),
        total: 0
      },
      settings: {
        theme: loadTheme(),
        cashDiscount: loadCashDiscount(),
        cashDiscountLocked: loadCashDiscountLocked(),
        autoAdjust: loadAutoAdjust(),
        showCashDiscount: loadShowCashDiscount(),
        freeSetup: loadFreeSetup()
      },
      ui: {
        activeProvider: 'all',
        searchQuery: '',
        debouncedSearchQuery: '',
        showPresentation: false,
        cbbMixEnabled: {},
        cbbMixCount: {},
        eanSearchResults: null,
        isSearching: false
      }
    };
    
    // Calculate cart count
    savedState.cart.count = savedState.cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
    dispatch({ type: ActionTypes.LOAD_STATE, payload: savedState });
    
    // Set theme on document
    document.documentElement.setAttribute('data-theme', savedState.settings.theme);
  }, []);
  
  // Track if initial load is complete to avoid saving during mount
  const isInitialized = useRef(false);
  
  // Persist state to localStorage - batched for performance
  useEffect(() => {
    // Skip the initial render (state is loaded from storage above)
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }
    
    // Batch all localStorage writes with requestIdleCallback for better performance
    const saveToStorage = () => {
      // Cart
      if (state.cart.items) {
        saveCart(state.cart.items);
      }
      
      // Customer
      saveCustomerMobileCost(state.customer.mobileCost);
      saveNumberOfLines(state.customer.numberOfLines);
      saveOriginalItemPrice(state.customer.originalItemPrice);
      saveExistingBrands(state.customer.existingBrands);
      saveBroadbandCost(state.customer.broadbandCost);
      
      // Streaming
      saveSelectedStreaming(state.streaming.selected);
      
      // Settings
      saveCashDiscount(state.settings.cashDiscount);
      saveCashDiscountLocked(state.settings.cashDiscountLocked);
      saveAutoAdjust(state.settings.autoAdjust);
      saveShowCashDiscount(state.settings.showCashDiscount);
      saveFreeSetup(state.settings.freeSetup);
      saveTheme(state.settings.theme);
    };
    
    // Use requestIdleCallback if available, otherwise use setTimeout
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(saveToStorage, { timeout: 500 });
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(saveToStorage, 100);
      return () => clearTimeout(id);
    }
  }, [
    state.cart.items,
    state.customer.mobileCost,
    state.customer.numberOfLines,
    state.customer.originalItemPrice,
    state.customer.existingBrands,
    state.customer.broadbandCost,
    state.streaming.selected,
    state.settings.cashDiscount,
    state.settings.cashDiscountLocked,
    state.settings.autoAdjust,
    state.settings.showCashDiscount,
    state.settings.freeSetup,
    state.settings.theme
  ]);
  
  // Theme attribute update - immediate for visual feedback
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.settings.theme);
  }, [state.settings.theme]);
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: ActionTypes.SET_DEBOUNCED_SEARCH_QUERY, payload: state.ui.searchQuery });
    }, 300);
    return () => clearTimeout(timer);
  }, [state.ui.searchQuery]);
  
  const value = {
    state,
    dispatch,
    ActionTypes
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook to access context
// eslint-disable-next-line react-refresh/only-export-components
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

// ActionTypes are now imported from separate file to fix Fast Refresh issues


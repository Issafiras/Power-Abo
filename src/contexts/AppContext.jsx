/**
 * AppContext - Centraliseret state management
 * Tim Cook Rebuild: Separer state management fra UI komponenter
 */

import { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
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
} from '../utils/storage';
import { validatePrice, validateQuantity } from '../utils/validators';

// Initial state
const initialState = {
  cartItems: [],
  selectedStreaming: [],
  customerMobileCost: 0,
  numberOfLines: 1,
  originalItemPrice: 0,
  cashDiscount: null,
  cashDiscountLocked: false,
  autoAdjust: false,
  theme: 'dark',
  showCashDiscount: false,
  freeSetup: false,
  activeProvider: 'all',
  searchQuery: '',
  debouncedSearchQuery: '',
  showPresentation: false,
  cbbMixEnabled: {},
  cbbMixCount: {},
  existingBrands: [],
  eanSearchResults: null,
  isSearching: false
};

// Action types
const ActionTypes = {
  LOAD_STATE: 'LOAD_STATE',
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  TOGGLE_STREAMING: 'TOGGLE_STREAMING',
  SET_MOBILE_COST: 'SET_MOBILE_COST',
  SET_NUMBER_OF_LINES: 'SET_NUMBER_OF_LINES',
  SET_ORIGINAL_ITEM_PRICE: 'SET_ORIGINAL_ITEM_PRICE',
  SET_CASH_DISCOUNT: 'SET_CASH_DISCOUNT',
  SET_CASH_DISCOUNT_LOCKED: 'SET_CASH_DISCOUNT_LOCKED',
  SET_AUTO_ADJUST: 'SET_AUTO_ADJUST',
  SET_THEME: 'SET_THEME',
  TOGGLE_CASH_DISCOUNT: 'TOGGLE_CASH_DISCOUNT',
  SET_FREE_SETUP: 'SET_FREE_SETUP',
  SET_ACTIVE_PROVIDER: 'SET_ACTIVE_PROVIDER',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_DEBOUNCED_SEARCH_QUERY: 'SET_DEBOUNCED_SEARCH_QUERY',
  TOGGLE_PRESENTATION: 'TOGGLE_PRESENTATION',
  SET_CBB_MIX_ENABLED: 'SET_CBB_MIX_ENABLED',
  SET_CBB_MIX_COUNT: 'SET_CBB_MIX_COUNT',
  SET_EXISTING_BRANDS: 'SET_EXISTING_BRANDS',
  SET_EAN_SEARCH_RESULTS: 'SET_EAN_SEARCH_RESULTS',
  SET_IS_SEARCHING: 'SET_IS_SEARCHING',
  RESET_ALL: 'RESET_ALL'
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.LOAD_STATE:
      return {
        ...state,
        cartItems: loadCart(),
        selectedStreaming: loadSelectedStreaming(),
        customerMobileCost: loadCustomerMobileCost(),
        numberOfLines: loadNumberOfLines(),
        originalItemPrice: loadOriginalItemPrice(),
        cashDiscount: loadCashDiscount(),
        cashDiscountLocked: loadCashDiscountLocked(),
        autoAdjust: loadAutoAdjust(),
        theme: loadTheme(),
        showCashDiscount: loadShowCashDiscount(),
        existingBrands: loadExistingBrands(),
        freeSetup: loadFreeSetup()
      };

    case ActionTypes.ADD_TO_CART:
      const existingItem = state.cartItems.find(item => item.plan.id === action.payload.plan.id);
      if (existingItem) {
        const validation = validateQuantity(existingItem.quantity + 1);
        if (!validation.valid) {
          return state; // Don't update if invalid
        }
        const updated = state.cartItems.map(item =>
          item.plan.id === action.payload.plan.id
            ? { ...item, quantity: validation.value }
            : item
        );
        saveCart(updated);
        return { ...state, cartItems: updated };
      } else {
        const newItems = [...state.cartItems, action.payload];
        saveCart(newItems);
        return { ...state, cartItems: newItems };
      }

    case ActionTypes.REMOVE_FROM_CART:
      const filtered = state.cartItems.filter(item => item.plan.id !== action.payload);
      saveCart(filtered);
      return { ...state, cartItems: filtered };

    case ActionTypes.UPDATE_QUANTITY:
      const validation = validateQuantity(action.payload.quantity);
      if (!validation.valid) {
        return state;
      }
      if (validation.value === 0) {
        const removed = state.cartItems.filter(item => item.plan.id !== action.payload.planId);
        saveCart(removed);
        return { ...state, cartItems: removed };
      }
      const updated = state.cartItems.map(item =>
        item.plan.id === action.payload.planId
          ? { ...item, quantity: validation.value }
          : item
      );
      saveCart(updated);
      return { ...state, cartItems: updated };

    case ActionTypes.TOGGLE_STREAMING:
      const newStreaming = state.selectedStreaming.includes(action.payload)
        ? state.selectedStreaming.filter(id => id !== action.payload)
        : [...state.selectedStreaming, action.payload];
      saveSelectedStreaming(newStreaming);
      return { ...state, selectedStreaming: newStreaming };

    case ActionTypes.SET_MOBILE_COST:
      const mobileValidation = validatePrice(action.payload);
      if (!mobileValidation.valid) {
        return state;
      }
      saveCustomerMobileCost(mobileValidation.value);
      return { ...state, customerMobileCost: mobileValidation.value };

    case ActionTypes.SET_NUMBER_OF_LINES:
      const linesValidation = validateQuantity(action.payload);
      if (!linesValidation.valid) {
        return state;
      }
      saveNumberOfLines(linesValidation.value);
      return { ...state, numberOfLines: linesValidation.value };

    case ActionTypes.SET_ORIGINAL_ITEM_PRICE:
      const priceValidation = validatePrice(action.payload);
      if (!priceValidation.valid) {
        return state;
      }
      saveOriginalItemPrice(priceValidation.value);
      return { ...state, originalItemPrice: priceValidation.value };

    case ActionTypes.SET_CASH_DISCOUNT:
      const discountValidation = validatePrice(action.payload);
      if (!discountValidation.valid) {
        return state;
      }
      saveCashDiscount(discountValidation.value);
      return { ...state, cashDiscount: discountValidation.value };

    case ActionTypes.SET_CASH_DISCOUNT_LOCKED:
      saveCashDiscountLocked(action.payload);
      return { ...state, cashDiscountLocked: action.payload };

    case ActionTypes.SET_AUTO_ADJUST:
      saveAutoAdjust(action.payload);
      return { ...state, autoAdjust: action.payload };

    case ActionTypes.SET_THEME:
      saveTheme(action.payload);
      document.documentElement.setAttribute('data-theme', action.payload);
      return { ...state, theme: action.payload };

    case ActionTypes.TOGGLE_CASH_DISCOUNT:
      const newShowCashDiscount = !state.showCashDiscount;
      saveShowCashDiscount(newShowCashDiscount);
      return { ...state, showCashDiscount: newShowCashDiscount };

    case ActionTypes.SET_FREE_SETUP:
      saveFreeSetup(action.payload);
      return { ...state, freeSetup: action.payload };

    case ActionTypes.SET_ACTIVE_PROVIDER:
      return { ...state, activeProvider: action.payload };

    case ActionTypes.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };

    case ActionTypes.SET_DEBOUNCED_SEARCH_QUERY:
      return { ...state, debouncedSearchQuery: action.payload };

    case ActionTypes.TOGGLE_PRESENTATION:
      return { ...state, showPresentation: !state.showPresentation };

    case ActionTypes.SET_CBB_MIX_ENABLED:
      return {
        ...state,
        cbbMixEnabled: {
          ...state.cbbMixEnabled,
          [action.payload.planId]: action.payload.enabled
        }
      };

    case ActionTypes.SET_CBB_MIX_COUNT:
      return {
        ...state,
        cbbMixCount: {
          ...state.cbbMixCount,
          [action.payload.planId]: action.payload.count
        }
      };

    case ActionTypes.SET_EXISTING_BRANDS:
      saveExistingBrands(action.payload);
      return { ...state, existingBrands: action.payload };

    case ActionTypes.SET_EAN_SEARCH_RESULTS:
      return { ...state, eanSearchResults: action.payload };

    case ActionTypes.SET_IS_SEARCHING:
      return { ...state, isSearching: action.payload };

    case ActionTypes.RESET_ALL:
      resetAll();
      return initialState;

    default:
      return state;
  }
}

// Context
const AppContext = createContext(null);

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state on mount
  useMemo(() => {
    dispatch({ type: ActionTypes.LOAD_STATE });
  }, []);

  // Action creators
  const actions = useMemo(() => ({
    addToCart: (plan, cbbMixEnabled = false, cbbMixCount = 2) => {
      dispatch({
        type: ActionTypes.ADD_TO_CART,
        payload: {
          plan,
          quantity: 1,
          cbbMixEnabled: plan.cbbMixAvailable ? cbbMixEnabled : false,
          cbbMixCount: plan.cbbMixAvailable ? cbbMixCount : 0
        }
      });
    },

    removeFromCart: (planId) => {
      dispatch({ type: ActionTypes.REMOVE_FROM_CART, payload: planId });
    },

    updateQuantity: (planId, quantity) => {
      dispatch({ type: ActionTypes.UPDATE_QUANTITY, payload: { planId, quantity } });
    },

    toggleStreaming: (serviceId) => {
      dispatch({ type: ActionTypes.TOGGLE_STREAMING, payload: serviceId });
    },

    setMobileCost: (cost) => {
      dispatch({ type: ActionTypes.SET_MOBILE_COST, payload: cost });
    },

    setNumberOfLines: (lines) => {
      dispatch({ type: ActionTypes.SET_NUMBER_OF_LINES, payload: lines });
    },

    setOriginalItemPrice: (price) => {
      dispatch({ type: ActionTypes.SET_ORIGINAL_ITEM_PRICE, payload: price });
    },

    setCashDiscount: (discount) => {
      dispatch({ type: ActionTypes.SET_CASH_DISCOUNT, payload: discount });
    },

    setCashDiscountLocked: (locked) => {
      dispatch({ type: ActionTypes.SET_CASH_DISCOUNT_LOCKED, payload: locked });
    },

    setAutoAdjust: (enabled) => {
      dispatch({ type: ActionTypes.SET_AUTO_ADJUST, payload: enabled });
    },

    setTheme: (theme) => {
      dispatch({ type: ActionTypes.SET_THEME, payload: theme });
    },

    toggleCashDiscount: () => {
      dispatch({ type: ActionTypes.TOGGLE_CASH_DISCOUNT });
    },

    setFreeSetup: (enabled) => {
      dispatch({ type: ActionTypes.SET_FREE_SETUP, payload: enabled });
    },

    setActiveProvider: (provider) => {
      dispatch({ type: ActionTypes.SET_ACTIVE_PROVIDER, payload: provider });
    },

    setSearchQuery: (query) => {
      dispatch({ type: ActionTypes.SET_SEARCH_QUERY, payload: query });
    },

    setDebouncedSearchQuery: (query) => {
      dispatch({ type: ActionTypes.SET_DEBOUNCED_SEARCH_QUERY, payload: query });
    },

    togglePresentation: () => {
      dispatch({ type: ActionTypes.TOGGLE_PRESENTATION });
    },

    setCbbMixEnabled: (planId, enabled) => {
      if (typeof planId === 'string' && typeof enabled === 'boolean') {
        dispatch({
          type: ActionTypes.SET_CBB_MIX_ENABLED,
          payload: { planId, enabled }
        });
      }
    },

    setCbbMixCount: (planId, count) => {
      if (typeof planId === 'string' && typeof count === 'number') {
        dispatch({
          type: ActionTypes.SET_CBB_MIX_COUNT,
          payload: { planId, count }
        });
      }
    },

    setExistingBrands: (brands) => {
      dispatch({ type: ActionTypes.SET_EXISTING_BRANDS, payload: brands });
    },

    setEanSearchResults: (results) => {
      dispatch({ type: ActionTypes.SET_EAN_SEARCH_RESULTS, payload: results });
    },

    setIsSearching: (isSearching) => {
      dispatch({ type: ActionTypes.SET_IS_SEARCHING, payload: isSearching });
    },

    resetAll: () => {
      dispatch({ type: ActionTypes.RESET_ALL });
    }
  }), []);

  const value = useMemo(() => ({
    ...state,
    ...actions
  }), [state, actions]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

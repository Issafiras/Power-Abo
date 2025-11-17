/**
 * useAppActions - Hook for at udføre actions
 * Giver nem adgang til alle actions med validering og toast notifications
 */

import { useCallback } from 'react';
import { useAppContext, ActionTypes } from '../context/AppContext';
import { validatePrice, validateQuantity } from '../utils/validators';
import { toast } from '../components/common/Toast';
import { resetAll as resetStorage } from '../utils/storage';
import COPY from '../constants/copy';

export function useAppActions() {
  const { dispatch } = useAppContext();
  
  // Cart actions
  const addToCart = useCallback((plan, cbbMixEnabled = false, cbbMixCount = 2) => {
    dispatch({
      type: ActionTypes.ADD_TO_CART,
      payload: { plan, cbbMixEnabled, cbbMixCount }
    });
    toast(COPY.success.addedToCart(plan.name), 'success');
  }, [dispatch]);
  
  const removeFromCart = useCallback((planId, itemName) => {
    if (itemName) {
      toast(COPY.success.removedFromCart(itemName), 'error');
    }
    dispatch({ type: ActionTypes.REMOVE_FROM_CART, payload: planId });
  }, [dispatch]);
  
  const updateQuantity = useCallback((planId, newQuantity) => {
    const validation = validateQuantity(newQuantity);
    if (!validation.valid) {
      toast(validation.error, 'error');
      return;
    }
    
    if (validation.value === 0) {
      removeFromCart(planId);
      return;
    }
    
    dispatch({
      type: ActionTypes.UPDATE_QUANTITY,
      payload: { planId, quantity: validation.value }
    });
  }, [dispatch, removeFromCart]);
  
  const setCart = useCallback((items) => {
    dispatch({ type: ActionTypes.SET_CART, payload: items });
  }, [dispatch]);
  
  const clearCart = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_CART });
  }, [dispatch]);
  
  // Customer actions
  const setMobileCost = useCallback((value) => {
    const validation = validatePrice(value);
    if (validation.valid) {
      dispatch({ type: ActionTypes.SET_MOBILE_COST, payload: validation.value });
    }
  }, [dispatch]);
  
  const setNumberOfLines = useCallback((value) => {
    const validation = validateQuantity(value);
    if (validation.valid) {
      dispatch({ type: ActionTypes.SET_NUMBER_OF_LINES, payload: validation.value });
    }
  }, [dispatch]);
  
  const setOriginalItemPrice = useCallback((value) => {
    const validation = validatePrice(value);
    if (validation.valid) {
      dispatch({ type: ActionTypes.SET_ORIGINAL_ITEM_PRICE, payload: validation.value });
    }
  }, [dispatch]);
  
  const setExistingBrands = useCallback((brands) => {
    dispatch({ type: ActionTypes.SET_EXISTING_BRANDS, payload: brands });
  }, [dispatch]);
  
  // Streaming actions
  const toggleStreaming = useCallback((serviceId) => {
    dispatch({ type: ActionTypes.TOGGLE_STREAMING, payload: serviceId });
  }, [dispatch]);
  
  const setStreaming = useCallback((streamingIds) => {
    dispatch({ type: ActionTypes.SET_STREAMING, payload: streamingIds });
  }, [dispatch]);
  
  const clearStreaming = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_STREAMING });
  }, [dispatch]);
  
  // Settings actions
  const setTheme = useCallback((theme) => {
    dispatch({ type: ActionTypes.SET_THEME, payload: theme });
  }, [dispatch]);
  
  const toggleTheme = useCallback((currentTheme) => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    dispatch({ type: ActionTypes.SET_THEME, payload: newTheme });
  }, [dispatch]);
  
  const setCashDiscount = useCallback((value) => {
    const validation = validatePrice(value);
    if (validation.valid || value === null) {
      dispatch({ type: ActionTypes.SET_CASH_DISCOUNT, payload: value === null ? null : validation.value });
    }
  }, [dispatch]);
  
  const setCashDiscountLocked = useCallback((locked) => {
    dispatch({ type: ActionTypes.SET_CASH_DISCOUNT_LOCKED, payload: locked });
  }, [dispatch]);
  
  const setAutoAdjust = useCallback((enabled) => {
    dispatch({ type: ActionTypes.SET_AUTO_ADJUST, payload: enabled });
  }, [dispatch]);
  
  const toggleCashDiscount = useCallback(() => {
    dispatch({ type: ActionTypes.TOGGLE_CASH_DISCOUNT });
  }, [dispatch]);
  
  const setFreeSetup = useCallback((enabled) => {
    dispatch({ type: ActionTypes.SET_FREE_SETUP, payload: enabled });
  }, [dispatch]);
  
  // UI actions
  const setActiveProvider = useCallback((provider) => {
    dispatch({ type: ActionTypes.SET_ACTIVE_PROVIDER, payload: provider });
  }, [dispatch]);
  
  const setSearchQuery = useCallback((query) => {
    dispatch({ type: ActionTypes.SET_SEARCH_QUERY, payload: query });
  }, [dispatch]);
  
  const setShowPresentation = useCallback((show) => {
    dispatch({ type: ActionTypes.SET_SHOW_PRESENTATION, payload: show });
  }, [dispatch]);
  
  const togglePresentation = useCallback(() => {
    dispatch({ type: ActionTypes.TOGGLE_PRESENTATION });
  }, [dispatch]);
  
  const setCBBMixEnabled = useCallback((planId, enabled) => {
    dispatch({
      type: ActionTypes.SET_CBB_MIX_ENABLED,
      payload: { planId, enabled }
    });
  }, [dispatch]);
  
  const setCBBMixCount = useCallback((planId, count) => {
    dispatch({
      type: ActionTypes.SET_CBB_MIX_COUNT,
      payload: { planId, count }
    });
  }, [dispatch]);
  
  const setEanSearchResults = useCallback((results) => {
    dispatch({ type: ActionTypes.SET_EAN_SEARCH_RESULTS, payload: results });
  }, [dispatch]);
  
  const setIsSearching = useCallback((searching) => {
    dispatch({ type: ActionTypes.SET_IS_SEARCHING, payload: searching });
  }, [dispatch]);
  
  // Reset action
  const resetAll = useCallback(() => {
    resetStorage();
    dispatch({ type: ActionTypes.RESET_ALL });
    toast(COPY.success.reset, 'success');
  }, [dispatch]);
  
  return {
    // Cart
    addToCart,
    removeFromCart,
    updateQuantity,
    setCart,
    clearCart,
    
    // Customer
    setMobileCost,
    setNumberOfLines,
    setOriginalItemPrice,
    setExistingBrands,
    
    // Streaming
    toggleStreaming,
    setStreaming,
    clearStreaming,
    
    // Settings
    setTheme,
    toggleTheme,
    setCashDiscount,
    setCashDiscountLocked,
    setAutoAdjust,
    toggleCashDiscount,
    setFreeSetup,
    
    // UI
    setActiveProvider,
    setSearchQuery,
    setShowPresentation,
    togglePresentation,
    setCBBMixEnabled,
    setCBBMixCount,
    setEanSearchResults,
    setIsSearching,
    
    // Reset
    resetAll
  };
}

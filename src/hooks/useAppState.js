/**
 * useAppState - Hook for at tilgå app state
 * Giver nem adgang til state uden at skulle bruge dispatch direkte
 */

import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';

export function useAppState() {
  const { state } = useAppContext();
  
  // Memoized state slices for bedre performance
  return useMemo(() => ({
    // Cart state
    cartItems: state.cart.items,
    cartCount: state.cart.count,

    // Customer state
    customerMobileCost: state.customer.mobileCost,
    numberOfLines: state.customer.numberOfLines,
    originalItemPrice: state.customer.originalItemPrice,
    existingBrands: state.customer.existingBrands,
    broadbandCost: state.customer.broadbandCost,
    buybackAmount: state.customer.buybackAmount,

    // Streaming state
    selectedStreaming: state.streaming.selected,
    streamingTotal: state.streaming.total,

    // Settings state
    theme: state.settings.theme,
    cashDiscount: state.settings.cashDiscount,
    cashDiscountLocked: state.settings.cashDiscountLocked,
    autoAdjust: state.settings.autoAdjust,
    showCashDiscount: state.settings.showCashDiscount,
    freeSetup: state.settings.freeSetup,

    // UI state
    activeProvider: state.ui.activeProvider,
    searchQuery: state.ui.searchQuery,
    debouncedSearchQuery: state.ui.debouncedSearchQuery,
    showPresentation: state.ui.showPresentation,
    showHelpGuide: state.ui.showHelpGuide,
    cbbMixEnabled: state.ui.cbbMixEnabled,
    cbbMixCount: state.ui.cbbMixCount,
    eanSearchResults: state.ui.eanSearchResults,
    isSearching: state.ui.isSearching,

    // Full state (for edge cases)
    fullState: state
  }), [state]);
}


/**
 * Optimization utilities
 * Debouncing, throttling, and performance helpers
 */

import { useMemo, useCallback } from 'react';

/**
 * Debounce hook
 * @param {Function} callback - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function useDebounce(callback, delay = 300) {
  const debounceRef = useMemo(() => {
    let timeoutId = null;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        callback(...args);
      }, delay);
    };
  }, [callback, delay]);

  return debounceRef;
}

/**
 * Throttle hook
 * @param {Function} callback - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export function useThrottle(callback, delay = 300) {
  const throttleRef = useMemo(() => {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        callback(...args);
      }
    };
  }, [callback, delay]);

  return throttleRef;
}

/**
 * Virtual scrolling helper
 * Calculates visible items for large lists
 */
export function useVirtualScroll(items, itemHeight, containerHeight) {
  return useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = 0;
    const endIndex = Math.min(startIndex + visibleCount + 2, items.length); // +2 for buffer
    
    return {
      visibleItems: items.slice(startIndex, endIndex),
      startIndex,
      endIndex,
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight]);
}


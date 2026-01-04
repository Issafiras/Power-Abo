/**
 * useAdminAuth Hook
 * Simpel password authentication til admin dashboard
 * Password gemmes hashet i localStorage
 */

import { useState, useEffect, useCallback } from 'react';

const ADMIN_AUTH_KEY = 'admin_auth_token';
const ADMIN_PASSWORD_ENV = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'; // Default password for development

/**
 * Simpel hash funktion (ikke kryptografisk sikkert - kun til development)
 * I produktion bør dette erstattes med proper authentication
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * Hook til admin authentication
 * @returns {{isAuthenticated: boolean, login: (password: string) => boolean, logout: () => void, isLoading: boolean}}
 */
export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Tjek authentication ved mount
  useEffect(() => {
    const storedHash = localStorage.getItem(ADMIN_AUTH_KEY);
    const expectedHash = simpleHash(ADMIN_PASSWORD_ENV);
    
    if (storedHash === expectedHash) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  /**
   * Login med password
   * @param {string} password - Password til admin
   * @returns {boolean} True hvis login var succesfuldt
   */
  const login = useCallback((password) => {
    if (!password) return false;

    // Tjek mod environment variable eller default
    const isValid = password === ADMIN_PASSWORD_ENV;
    
    if (isValid) {
      const hash = simpleHash(password);
      localStorage.setItem(ADMIN_AUTH_KEY, hash);
      setIsAuthenticated(true);
      return true;
    }
    
    return false;
  }, []);

  /**
   * Logout og fjern authentication
   */
  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    login,
    logout,
    isLoading
  };
}

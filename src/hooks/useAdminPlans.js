/**
 * useAdminPlans Hook
 * Henter alle planer fra lokal data til admin dashboard (ReadOnly efter Supabase fjernelse)
 */

import { useState, useEffect, useCallback } from 'react';
import { plans as localPlans } from '../data/plans.js';

/**
 * Hook til at fetche alle planer til admin dashboard
 * @returns {{plans: Array, loading: boolean, error: string|null, refetch: () => Promise<void>}}
 */
export function useAdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(true);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Simuler async fetch
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setPlans(localPlans);
      setUsingFallback(true);
    } catch (err) {
      console.error('❌ Fejl ved hentning af planer til admin:', err);
      setError(err.message || 'Ukendt fejl');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    loading,
    error,
    usingFallback,
    refetch: fetchPlans
  };
}
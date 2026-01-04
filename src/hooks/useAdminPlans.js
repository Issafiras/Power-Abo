/**
 * useAdminPlans Hook
 * Henter alle planer (inkl. inaktive) fra Supabase til admin dashboard
 */

import { useState, useEffect, useCallback } from 'react';
import { getAllPlans } from '../utils/adminApi.js';
import { plans as fallbackPlans } from '../data/plans.js';

/**
 * Hook til at fetche alle planer til admin dashboard
 * @returns {{plans: Array, loading: boolean, error: string|null, refetch: () => Promise<void>}}
 */
export function useAdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await getAllPlans();

      if (fetchError) {
        throw fetchError;
      }

      if (data && data.length > 0) {
        // Konverter database format til app format
        const convertedPlans = data.map(plan => convertDbPlanToAppFormat(plan));
        setPlans(convertedPlans);
        setUsingFallback(false);
      } else {
        // Ingen data i database, brug fallback
        setPlans(fallbackPlans);
        setUsingFallback(true);
      }
    } catch (err) {
      console.error('❌ Fejl ved hentning af planer til admin:', err);
      // Fallback til lokal data
      setPlans(fallbackPlans);
      setUsingFallback(true);
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

/**
 * Konverterer en plan fra database format til app format
 */
function convertDbPlanToAppFormat(dbPlan) {
  const appPlan = {
    id: dbPlan.id,
    provider: dbPlan.provider,
    name: dbPlan.name,
    data: dbPlan.data_label || dbPlan.data, // Map 'data_label' tilbage til 'data'
    price: dbPlan.price,
    earnings: dbPlan.earnings,
    features: dbPlan.features || [],
    color: dbPlan.color,
    logo: dbPlan.logo,
    streaming: dbPlan.streaming || []
  };

  // Håndter kampagnepris hvis aktiv
  if (dbPlan.campaign_price && dbPlan.campaign_end_date) {
    const campaignEndDate = new Date(dbPlan.campaign_end_date);
    const now = new Date();
    
    if (campaignEndDate > now) {
      // Kampagne er aktiv
      appPlan.campaignPrice = dbPlan.campaign_price;
      appPlan.originalPrice = dbPlan.price;
      appPlan.campaignExpiresAt = dbPlan.campaign_end_date;
      appPlan.campaign = true;
    }
  }

  // Tilføj ekstra felter hvis de findes
  if (dbPlan.family_discount !== undefined) appPlan.familyDiscount = dbPlan.family_discount;
  if (dbPlan.business !== undefined) appPlan.business = dbPlan.business;
  if (dbPlan.price_vat_excluded !== undefined) appPlan.priceVatExcluded = dbPlan.price_vat_excluded;
  if (dbPlan.most_popular !== undefined) appPlan.mostPopular = dbPlan.most_popular;
  if (dbPlan.earnings_additional) appPlan.earningsAdditional = dbPlan.earnings_additional;
  if (dbPlan.expires_at) appPlan.expiresAt = dbPlan.expires_at;
  if (dbPlan.intro_price) appPlan.introPrice = dbPlan.intro_price;
  if (dbPlan.intro_months) appPlan.introMonths = dbPlan.intro_months;
  if (dbPlan.original_price) appPlan.originalPrice = dbPlan.original_price;
  if (dbPlan.campaign_expires_at) appPlan.campaignExpiresAt = dbPlan.campaign_expires_at;
  if (dbPlan.campaign !== undefined) appPlan.campaign = dbPlan.campaign;
  if (dbPlan.streaming_count) appPlan.streamingCount = dbPlan.streaming_count;
  if (dbPlan.cbb_mix_available !== undefined) appPlan.cbbMixAvailable = dbPlan.cbb_mix_available;
  if (dbPlan.cbb_mix_pricing) appPlan.cbbMixPricing = dbPlan.cbb_mix_pricing;
  if (dbPlan.type) appPlan.type = dbPlan.type;
  if (dbPlan.is_active !== undefined) appPlan.isActive = dbPlan.is_active;
  if (dbPlan.sorting_order !== undefined) appPlan.sortingOrder = dbPlan.sorting_order;
  if (dbPlan.campaign_price) appPlan.campaignPrice = dbPlan.campaign_price;
  if (dbPlan.campaign_end_date) appPlan.campaignEndDate = dbPlan.campaign_end_date;

  return appPlan;
}

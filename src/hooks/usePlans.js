import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase.js';
import { plans as fallbackPlans } from '../data/plans.js';

/**
 * Hook til at fetche mobile planer fra Supabase
 * Fallback til lokal data hvis database connection fejler
 */
export function usePlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    async function fetchPlans() {
      // Hvis Supabase ikke er konfigureret, brug fallback
      if (!supabase) {
        console.warn('⚠️ Supabase ikke konfigureret. Bruger lokal fallback data.');
        setPlans(fallbackPlans);
        setUsingFallback(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch aktive planer, sorteret efter sorting_order
        const { data, error: fetchError } = await supabase
          .from('mobile_plans')
          .select('*')
          .eq('is_active', true)
          .order('sorting_order', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        // Konverter database format til app format
        const convertedPlans = data.map(plan => convertDbPlanToAppFormat(plan));
        
        setPlans(convertedPlans);
        setUsingFallback(false);
      } catch (err) {
        console.error('❌ Fejl ved hentning af planer fra Supabase:', err);
        console.warn('⚠️ Bruger lokal fallback data.');
        
        // Fallback til lokal data
        setPlans(fallbackPlans);
        setUsingFallback(true);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  return { plans, loading, error, usingFallback };
}

/**
 * Konverterer en plan fra database format til app format
 */
function convertDbPlanToAppFormat(dbPlan) {
  const appPlan = {
    id: dbPlan.id,
    provider: dbPlan.provider,
    name: dbPlan.name,
    data: dbPlan.data_label, // Map 'data_label' tilbage til 'data'
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
      // Kampagne er aktiv - brug kampagnepris
      appPlan.price = dbPlan.campaign_price;
      appPlan.originalPrice = dbPlan.price;
      appPlan.campaignPrice = dbPlan.campaign_price;
      appPlan.campaignExpiresAt = dbPlan.campaign_end_date;
      appPlan.campaign = true;
    }
  }

  // Tilføj ekstra felter hvis de findes
  if (dbPlan.family_discount) appPlan.familyDiscount = dbPlan.family_discount;
  if (dbPlan.business) appPlan.business = dbPlan.business;
  if (dbPlan.price_vat_excluded) appPlan.priceVatExcluded = dbPlan.price_vat_excluded;
  if (dbPlan.most_popular) appPlan.mostPopular = dbPlan.most_popular;
  if (dbPlan.earnings_additional) appPlan.earningsAdditional = dbPlan.earnings_additional;
  if (dbPlan.expires_at) appPlan.expiresAt = dbPlan.expires_at;
  if (dbPlan.intro_price) appPlan.introPrice = dbPlan.intro_price;
  if (dbPlan.intro_months) appPlan.introMonths = dbPlan.intro_months;
  if (dbPlan.original_price) appPlan.originalPrice = dbPlan.original_price;
  if (dbPlan.campaign_expires_at) appPlan.campaignExpiresAt = dbPlan.campaign_expires_at;
  if (dbPlan.campaign !== undefined) appPlan.campaign = dbPlan.campaign;
  if (dbPlan.streaming_count) appPlan.streamingCount = dbPlan.streaming_count;
  if (dbPlan.cbb_mix_available) appPlan.cbbMixAvailable = dbPlan.cbb_mix_available;
  if (dbPlan.cbb_mix_pricing) appPlan.cbbMixPricing = dbPlan.cbb_mix_pricing;
  if (dbPlan.type) appPlan.type = dbPlan.type;

  return appPlan;
}

/**
 * Hook til at fetche en specifik plan efter ID
 */
export function usePlanById(planId) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!planId) {
      setLoading(false);
      return;
    }

    async function fetchPlan() {
      // Hvis Supabase ikke er konfigureret, brug fallback
      if (!supabase) {
        const fallbackPlan = fallbackPlans.find(p => p.id === planId);
        setPlan(fallbackPlan || null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('mobile_plans')
          .select('*')
          .eq('id', planId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          setPlan(convertDbPlanToAppFormat(data));
        } else {
          // Fallback til lokal data
          const fallbackPlan = fallbackPlans.find(p => p.id === planId);
          setPlan(fallbackPlan || null);
        }
      } catch (err) {
        console.error('❌ Fejl ved hentning af plan:', err);
        // Fallback til lokal data
        const fallbackPlan = fallbackPlans.find(p => p.id === planId);
        setPlan(fallbackPlan || null);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPlan();
  }, [planId]);

  return { plan, loading, error };
}

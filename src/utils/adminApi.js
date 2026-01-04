import { supabase } from './supabase.js';

/**
 * Admin API funktioner til at administrere mobile planer
 * Kræver authenticated Supabase session
 */

/**
 * Opdater pris og earnings for en plan
 * @param {string} id - Plan ID
 * @param {number} price - Ny pris
 * @param {number} earnings - Nye earnings (optional)
 * @returns {Promise<{data: any, error: any}>}
 */
export async function updatePlanPrice(id, price, earnings = null) {
  if (!supabase) {
    throw new Error('Supabase client er ikke initialiseret');
  }

  const updateData = { price };
  if (earnings !== null) {
    updateData.earnings = earnings;
  }

  const { data, error } = await supabase
    .from('mobile_plans')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Fejl ved opdatering af plan pris:', error);
    throw error;
  }

  return { data, error: null };
}

/**
 * Sæt kampagne for en plan
 * @param {string} id - Plan ID
 * @param {number} campaignPrice - Kampagnepris
 * @param {Date|string} endDate - Slutdato for kampagne
 * @returns {Promise<{data: any, error: any}>}
 */
export async function setCampaign(id, campaignPrice, endDate) {
  if (!supabase) {
    throw new Error('Supabase client er ikke initialiseret');
  }

  // Konverter endDate til ISO string hvis det er en Date
  const endDateISO = endDate instanceof Date 
    ? endDate.toISOString() 
    : new Date(endDate).toISOString();

  const { data, error } = await supabase
    .from('mobile_plans')
    .update({
      campaign_price: campaignPrice,
      campaign_end_date: endDateISO,
      campaign: true
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Fejl ved opdatering af kampagne:', error);
    throw error;
  }

  return { data, error: null };
}

/**
 * Fjern kampagne for en plan
 * @param {string} id - Plan ID
 * @returns {Promise<{data: any, error: any}>}
 */
export async function removeCampaign(id) {
  if (!supabase) {
    throw new Error('Supabase client er ikke initialiseret');
  }

  const { data, error } = await supabase
    .from('mobile_plans')
    .update({
      campaign_price: null,
      campaign_end_date: null,
      campaign: false
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Fejl ved fjernelse af kampagne:', error);
    throw error;
  }

  return { data, error: null };
}

/**
 * Toggle plan status (aktiv/inaktiv)
 * @param {string} id - Plan ID
 * @param {boolean} isActive - Om planen skal være aktiv
 * @returns {Promise<{data: any, error: any}>}
 */
export async function togglePlanStatus(id, isActive) {
  if (!supabase) {
    throw new Error('Supabase client er ikke initialiseret');
  }

  const { data, error } = await supabase
    .from('mobile_plans')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Fejl ved opdatering af plan status:', error);
    throw error;
  }

  return { data, error: null };
}

/**
 * Opdater sorting order for en plan
 * @param {string} id - Plan ID
 * @param {number} sortingOrder - Ny sorting order
 * @returns {Promise<{data: any, error: any}>}
 */
export async function updateSortingOrder(id, sortingOrder) {
  if (!supabase) {
    throw new Error('Supabase client er ikke initialiseret');
  }

  const { data, error } = await supabase
    .from('mobile_plans')
    .update({ sorting_order: sortingOrder })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Fejl ved opdatering af sorting order:', error);
    throw error;
  }

  return { data, error: null };
}

/**
 * Hent alle planer (inkl. inaktive) - kun til admin
 * @returns {Promise<{data: any[], error: any}>}
 */
export async function getAllPlans() {
  if (!supabase) {
    throw new Error('Supabase client er ikke initialiseret');
  }

  const { data, error } = await supabase
    .from('mobile_plans')
    .select('*')
    .order('sorting_order', { ascending: true });

  if (error) {
    console.error('Fejl ved hentning af alle planer:', error);
    throw error;
  }

  return { data, error: null };
}

/**
 * Opdater en hel plan
 * @param {string} id - Plan ID
 * @param {object} planData - Plan data at opdatere
 * @returns {Promise<{data: any, error: any}>}
 */
export async function updatePlan(id, planData) {
  if (!supabase) {
    throw new Error('Supabase client er ikke initialiseret');
  }

  // Konverter app format til database format hvis nødvendigt
  const dbData = { ...planData };
  if (dbData.data) {
    dbData.data_label = dbData.data;
    delete dbData.data;
  }

  const { data, error } = await supabase
    .from('mobile_plans')
    .update(dbData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Fejl ved opdatering af plan:', error);
    throw error;
  }

  return { data, error: null };
}

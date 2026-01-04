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
 * Konverter app format plan data til database format
 * @param {object} appPlan - Plan data i app format
 * @returns {object} Plan data i database format
 */
function convertAppPlanToDbFormat(appPlan) {
  const dbData = { ...appPlan };

  // Map 'data' til 'data_label'
  if (dbData.data !== undefined) {
    dbData.data_label = dbData.data;
    delete dbData.data;
  }

  // Map camelCase til snake_case for database felter
  if (dbData.familyDiscount !== undefined) {
    dbData.family_discount = dbData.familyDiscount;
    delete dbData.familyDiscount;
  }
  if (dbData.priceVatExcluded !== undefined) {
    dbData.price_vat_excluded = dbData.priceVatExcluded;
    delete dbData.priceVatExcluded;
  }
  if (dbData.mostPopular !== undefined) {
    dbData.most_popular = dbData.mostPopular;
    delete dbData.mostPopular;
  }
  if (dbData.earningsAdditional !== undefined) {
    dbData.earnings_additional = dbData.earningsAdditional;
    delete dbData.earningsAdditional;
  }
  if (dbData.expiresAt !== undefined) {
    dbData.expires_at = dbData.expiresAt;
    delete dbData.expiresAt;
  }
  if (dbData.introPrice !== undefined) {
    dbData.intro_price = dbData.introPrice;
    delete dbData.introPrice;
  }
  if (dbData.introMonths !== undefined) {
    dbData.intro_months = dbData.introMonths;
    delete dbData.introMonths;
  }
  if (dbData.originalPrice !== undefined) {
    dbData.original_price = dbData.originalPrice;
    delete dbData.originalPrice;
  }
  if (dbData.campaignExpiresAt !== undefined) {
    dbData.campaign_expires_at = dbData.campaignExpiresAt;
    delete dbData.campaignExpiresAt;
  }
  if (dbData.streamingCount !== undefined) {
    dbData.streaming_count = dbData.streamingCount;
    delete dbData.streamingCount;
  }
  if (dbData.cbbMixAvailable !== undefined) {
    dbData.cbb_mix_available = dbData.cbbMixAvailable;
    delete dbData.cbbMixAvailable;
  }
  if (dbData.cbbMixPricing !== undefined) {
    dbData.cbb_mix_pricing = dbData.cbbMixPricing;
    delete dbData.cbbMixPricing;
  }
  if (dbData.isActive !== undefined) {
    dbData.is_active = dbData.isActive;
    delete dbData.isActive;
  }
  if (dbData.sortingOrder !== undefined) {
    dbData.sorting_order = dbData.sortingOrder;
    delete dbData.sortingOrder;
  }
  if (dbData.campaignPrice !== undefined) {
    dbData.campaign_price = dbData.campaignPrice;
    delete dbData.campaignPrice;
  }
  if (dbData.campaignEndDate !== undefined) {
    dbData.campaign_end_date = dbData.campaignEndDate;
    delete dbData.campaignEndDate;
  }

  // Håndter kampagne felter
  if (dbData.campaign !== undefined && dbData.campaign === false) {
    // Hvis campaign er false, sæt kampagne felter til null
    if (!dbData.campaign_price && !dbData.campaign_end_date) {
      dbData.campaign_price = null;
      dbData.campaign_end_date = null;
    }
  }

  // Konverter dates til ISO strings hvis de er Date objekter
  if (dbData.expires_at instanceof Date) {
    dbData.expires_at = dbData.expires_at.toISOString().split('T')[0];
  }
  if (dbData.campaign_expires_at instanceof Date) {
    dbData.campaign_expires_at = dbData.campaign_expires_at.toISOString().split('T')[0];
  }
  if (dbData.campaign_end_date instanceof Date) {
    dbData.campaign_end_date = dbData.campaign_end_date.toISOString();
  }

  // Sørg for at JSONB felter er arrays eller objekter
  if (dbData.features && !Array.isArray(dbData.features)) {
    dbData.features = [];
  }
  if (dbData.streaming && !Array.isArray(dbData.streaming)) {
    dbData.streaming = [];
  }
  if (dbData.cbb_mix_pricing && typeof dbData.cbb_mix_pricing !== 'object') {
    dbData.cbb_mix_pricing = null;
  }

  return dbData;
}

/**
 * Opdater en hel plan
 * @param {string} id - Plan ID
 * @param {object} planData - Plan data at opdatere (i app format)
 * @returns {Promise<{data: any, error: any}>}
 */
export async function updatePlan(id, planData) {
  if (!supabase) {
    throw new Error('Supabase client er ikke initialiseret');
  }

  // Konverter app format til database format
  const dbData = convertAppPlanToDbFormat(planData);

  // Fjern id fra update data (kan ikke opdateres)
  delete dbData.id;

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

/**
 * Opret en ny plan
 * @param {object} planData - Plan data (i app format)
 * @returns {Promise<{data: any, error: any}>}
 */
export async function createPlan(planData) {
  if (!supabase) {
    throw new Error('Supabase client er ikke initialiseret');
  }

  if (!planData.id) {
    throw new Error('Plan ID er påkrævet');
  }

  // Konverter app format til database format
  const dbData = convertAppPlanToDbFormat(planData);

  const { data, error } = await supabase
    .from('mobile_plans')
    .insert(dbData)
    .select()
    .single();

  if (error) {
    console.error('Fejl ved oprettelse af plan:', error);
    throw error;
  }

  return { data, error: null };
}

/**
 * Slet en plan
 * @param {string} id - Plan ID
 * @returns {Promise<{data: any, error: any}>}
 */
export async function deletePlan(id) {
  if (!supabase) {
    throw new Error('Supabase client er ikke initialiseret');
  }

  const { data, error } = await supabase
    .from('mobile_plans')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Fejl ved sletning af plan:', error);
    throw error;
  }

  return { data, error: null };
}

/**
 * Admin API funktioner (MOCKED - Supabase fjernet)
 * Alle ændringer vil kun være lokale eller logges til konsollen.
 */

export async function updatePlanPrice(id, price, earnings = null) {
  console.log(`Mock updatePlanPrice: id=${id}, price=${price}, earnings=${earnings}`);
  return { data: { id, price, earnings }, error: null };
}

export async function setCampaign(id, campaignPrice, endDate) {
  console.log(`Mock setCampaign: id=${id}, price=${campaignPrice}, end=${endDate}`);
  return { data: { id, campaign_price: campaignPrice, campaign_end_date: endDate, campaign: true }, error: null };
}

export async function removeCampaign(id) {
  console.log(`Mock removeCampaign: id=${id}`);
  return { data: { id, campaign: false }, error: null };
}

export async function togglePlanStatus(id, isActive) {
  console.log(`Mock togglePlanStatus: id=${id}, isActive=${isActive}`);
  return { data: { id, is_active: isActive }, error: null };
}

export async function updateSortingOrder(id, sortingOrder) {
  console.log(`Mock updateSortingOrder: id=${id}, order=${sortingOrder}`);
  return { data: { id, sorting_order: sortingOrder }, error: null };
}

export async function getAllPlans() {
  console.log('Mock getAllPlans');
  // Returner tom array eller importer data hvis nødvendigt, men useAdminPlans bruger direkte import nu
  return { data: [], error: null }; 
}

export async function updatePlan(id, planData) {
  console.log(`Mock updatePlan: id=${id}`, planData);
  return { data: { id, ...planData }, error: null };
}

export async function createPlan(planData) {
  console.log('Mock createPlan:', planData);
  return { data: { ...planData, id: planData.id || 'mock-id' }, error: null };
}

export async function deletePlan(id) {
  console.log(`Mock deletePlan: id=${id}`);
  return { data: { id }, error: null };
}
/**
 * Test usePlans hook funktionalitet
 * Simulerer hvordan hook'en vil fungere i React app
 */

import { loadEnv } from './load-env.js';
loadEnv();

import { createClient } from '@supabase/supabase-js';
import { plans as fallbackPlans } from '../src/data/plans.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Environment variables mangler!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Konverterer en plan fra database format til app format
 */
function convertDbPlanToAppFormat(dbPlan) {
  const appPlan = {
    id: dbPlan.id,
    provider: dbPlan.provider,
    name: dbPlan.name,
    data: dbPlan.data_label,
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
      appPlan.price = dbPlan.campaign_price;
      appPlan.originalPrice = dbPlan.price;
      appPlan.campaignPrice = dbPlan.campaign_price;
      appPlan.campaignExpiresAt = dbPlan.campaign_end_date;
      appPlan.campaign = true;
    }
  }

  // Tilføj ekstra felter
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

async function testUsePlans() {
  console.log('🧪 Tester usePlans hook funktionalitet...\n');

  try {
    // Simuler hvad usePlans hook gør
    console.log('📡 Fetcher planer fra Supabase...');
    
    const { data, error: fetchError } = await supabase
      .from('mobile_plans')
      .select('*')
      .eq('is_active', true)
      .order('sorting_order', { ascending: true });

    if (fetchError) {
      throw fetchError;
    }

    // Konverter til app format
    const convertedPlans = data.map(plan => convertDbPlanToAppFormat(plan));
    
    console.log(`✅ Hentet ${convertedPlans.length} aktive planer\n`);

    // Verificer at data er korrekt konverteret
    console.log('🔍 Verificerer data konvertering...');
    
    const samplePlan = convertedPlans[0];
    console.log('\n📋 Eksempel konverteret plan:');
    console.log(`   ID: ${samplePlan.id}`);
    console.log(`   Navn: ${samplePlan.name}`);
    console.log(`   Provider: ${samplePlan.provider}`);
    console.log(`   Data: ${samplePlan.data}`);
    console.log(`   Pris: ${samplePlan.price} kr`);
    console.log(`   Features: ${samplePlan.features.length} features`);
    console.log(`   Logo: ${samplePlan.logo ? 'Ja' : 'Nej'}`);

    // Tjek at alle nødvendige felter er til stede
    const requiredFields = ['id', 'provider', 'name', 'data', 'price'];
    const missingFields = requiredFields.filter(field => !samplePlan[field]);
    
    if (missingFields.length > 0) {
      console.error(`\n❌ Manglende felter: ${missingFields.join(', ')}`);
      return false;
    }

    console.log('\n✅ Alle nødvendige felter er til stede');

    // Sammenlign med fallback data
    console.log('\n🔍 Sammenligner med fallback data...');
    const fallbackCount = fallbackPlans.length;
    console.log(`   Fallback planer: ${fallbackCount}`);
    console.log(`   Database planer: ${convertedPlans.length}`);
    
    if (convertedPlans.length === fallbackCount) {
      console.log('✅ Antal planer matcher!');
    } else {
      console.log(`⚠️  Antal planer matcher ikke (forskel: ${Math.abs(convertedPlans.length - fallbackCount)})`);
    }

    // Test kampagne håndtering
    const campaignPlans = convertedPlans.filter(p => p.campaign && p.campaignPrice);
    if (campaignPlans.length > 0) {
      console.log(`\n🎯 Kampagne planer fundet: ${campaignPlans.length}`);
      campaignPlans.forEach(plan => {
        console.log(`   - ${plan.name}: ${plan.campaignPrice} kr (original: ${plan.originalPrice} kr)`);
      });
    }

    console.log('\n✅ usePlans hook test bestået!');
    return true;
  } catch (error) {
    console.error('❌ Fejl ved test:', error.message);
    console.log('\n⚠️  Hook vil falde tilbage til lokal data');
    return false;
  }
}

testUsePlans()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Fatal fejl:', error);
    process.exit(1);
  });

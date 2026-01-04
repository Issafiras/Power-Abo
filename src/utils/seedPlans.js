/**
 * Seed script til at importere planer fra plans.js til Supabase database
 * 
 * Brug: node src/utils/seedPlans.js
 * Eller: npm run seed (hvis script er tilføjet til package.json)
 */

import { plans } from '../data/plans.js';
import { createClient } from '@supabase/supabase-js';

// Opret Supabase client fra environment variables
// I Node.js scripts bruger vi process.env i stedet for import.meta.env
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Konverterer en plan fra plans.js format til database format
 */
function convertPlanToDbFormat(plan, index) {
  return {
    id: plan.id,
    provider: plan.provider,
    name: plan.name,
    data_label: plan.data, // Map 'data' til 'data_label'
    price: plan.price,
    earnings: plan.earnings || null,
    features: plan.features || [],
    color: plan.color || null,
    logo: plan.logo || null,
    streaming: plan.streaming || [],
    
    // Admin felter
    campaign_price: plan.campaignPrice || plan.campaign_price || null,
    campaign_end_date: plan.campaignExpiresAt || plan.campaign_end_date 
      ? new Date(plan.campaignExpiresAt || plan.campaign_end_date).toISOString()
      : null,
    is_active: true,
    sorting_order: index,
    
    // Ekstra felter
    family_discount: plan.familyDiscount || false,
    business: plan.business || false,
    price_vat_excluded: plan.priceVatExcluded || false,
    most_popular: plan.mostPopular || false,
    earnings_additional: plan.earningsAdditional || null,
    expires_at: plan.expiresAt || null,
    intro_price: plan.introPrice || null,
    intro_months: plan.introMonths || null,
    original_price: plan.originalPrice || null,
    campaign_expires_at: plan.campaignExpiresAt || null,
    campaign: plan.campaign || false,
    streaming_count: plan.streamingCount || null,
    cbb_mix_available: plan.cbbMixAvailable || false,
    cbb_mix_pricing: plan.cbbMixPricing || null,
    type: plan.type || null
  };
}

/**
 * Seeder database med planer fra plans.js
 */
export async function seedDatabase() {
  // Hvis supabase ikke er sat (fra import), opret en ny client
  let client = supabase;
  if (!client) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase client er ikke initialiseret. Tjek dine environment variables.');
      console.error('   VITE_SUPABASE_URL og VITE_SUPABASE_ANON_KEY skal være sat i .env filen.');
      process.exit(1);
    }
    
    const { createClient } = await import('@supabase/supabase-js');
    client = createClient(supabaseUrl, supabaseAnonKey);
  }

  console.log('🌱 Starter seeding af mobile planer...');
  console.log(`📊 Antal planer at importere: ${plans.length}`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < plans.length; i++) {
    const plan = plans[i];
    const dbPlan = convertPlanToDbFormat(plan, i);

    try {
      const { data, error } = await client
        .from('mobile_plans')
        .upsert(dbPlan, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select();

      if (error) {
        console.error(`❌ Fejl ved import af plan ${plan.id}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Importeret: ${plan.id} (${plan.name})`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Uventet fejl ved import af plan ${plan.id}:`, err.message);
      errorCount++;
    }
  }

  console.log('\n📈 Seeding færdig!');
  console.log(`✅ Succes: ${successCount}`);
  console.log(`❌ Fejl: ${errorCount}`);
  console.log(`📊 Total: ${plans.length}`);

  return {
    success: successCount,
    errors: errorCount,
    total: plans.length
  };
}

// Hvis scriptet køres direkte (ikke som modul)
// Tjek om vi kører som main modul
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1]?.includes('seedPlans') ||
                     process.argv[1]?.endsWith('seedPlans.js');

if (isMainModule) {
  seedDatabase()
    .then((result) => {
      if (result.errors === 0) {
        console.log('\n🎉 Alle planer er blevet importeret succesfuldt!');
        process.exit(0);
      } else {
        console.log('\n⚠️  Nogle planer kunne ikke importeres. Tjek fejlene ovenfor.');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n💥 Fatal fejl:', error);
      process.exit(1);
    });
}

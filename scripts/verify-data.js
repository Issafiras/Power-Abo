/**
 * Script til at verificere data i Supabase database
 */

import { loadEnv } from './load-env.js';
loadEnv();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Environment variables mangler!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyData() {
  console.log('🔍 Verificerer data i Supabase...\n');

  try {
    // Hent alle planer
    const { data: allPlans, error: allError, count } = await supabase
      .from('mobile_plans')
      .select('*', { count: 'exact' });

    if (allError) throw allError;

    console.log(`📊 Total antal planer: ${count}\n`);

    // Gruppér efter provider
    const byProvider = {};
    allPlans.forEach(plan => {
      if (!byProvider[plan.provider]) {
        byProvider[plan.provider] = [];
      }
      byProvider[plan.provider].push(plan);
    });

    console.log('📋 Planer pr. provider:');
    Object.keys(byProvider).forEach(provider => {
      console.log(`   ${provider}: ${byProvider[provider].length} planer`);
    });

    // Tjek aktive planer
    const { data: activePlans } = await supabase
      .from('mobile_plans')
      .select('id, name, provider, is_active')
      .eq('is_active', true);

    console.log(`\n✅ Aktive planer: ${activePlans?.length || 0}`);

    // Tjek kampagner
    const { data: campaigns } = await supabase
      .from('mobile_plans')
      .select('id, name, campaign_price, campaign_end_date')
      .not('campaign_price', 'is', null);

    if (campaigns && campaigns.length > 0) {
      console.log(`\n🎯 Aktive kampagner: ${campaigns.length}`);
      campaigns.forEach(c => {
        const endDate = c.campaign_end_date ? new Date(c.campaign_end_date).toLocaleDateString('da-DK') : 'N/A';
        console.log(`   - ${c.name}: ${c.campaign_price} kr (til ${endDate})`);
      });
    }

    // Vis eksempler
    console.log('\n📋 Eksempel planer:');
    const examples = allPlans.slice(0, 3);
    examples.forEach(plan => {
      console.log(`\n   ID: ${plan.id}`);
      console.log(`   Navn: ${plan.name}`);
      console.log(`   Provider: ${plan.provider}`);
      console.log(`   Data: ${plan.data_label}`);
      console.log(`   Pris: ${plan.price} kr`);
      console.log(`   Earnings: ${plan.earnings || 'N/A'} kr`);
      console.log(`   Aktiv: ${plan.is_active ? 'Ja' : 'Nej'}`);
      console.log(`   Features: ${plan.features?.length || 0} features`);
    });

    console.log('\n✅ Data verificering færdig!');
    return true;
  } catch (error) {
    console.error('❌ Fejl ved verificering:', error.message);
    return false;
  }
}

verifyData()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Fatal fejl:', error);
    process.exit(1);
  });

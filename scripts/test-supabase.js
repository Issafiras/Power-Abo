/**
 * Test script til at verificere Supabase connection og database setup
 */

// Load environment variables from .env file
import { loadEnv } from './load-env.js';
loadEnv();

// Import Supabase client
import { createClient } from '@supabase/supabase-js';

async function testSupabaseConnection() {
  console.log('🔍 Tester Supabase connection...\n');

  // Tjek environment variables (fra .env fil eller process.env)
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Environment variables mangler!');
    console.log('   Tjek at .env filen indeholder:');
    console.log('   - VITE_SUPABASE_URL');
    console.log('   - VITE_SUPABASE_ANON_KEY');
    return false;
  }

  console.log('✅ Environment variables fundet');
  console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`);
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...\n`);

  // Opret Supabase client direkte
  const testSupabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client initialiseret\n');

  // Test database connection
  try {
    console.log('🔍 Tester database connection...');
    
    // Prøv at fetche fra mobile_plans tabel
    const { data, error, count } = await testSupabase
      .from('mobile_plans')
      .select('*', { count: 'exact' })
      .limit(1);

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.error('❌ Tabel "mobile_plans" findes ikke!');
        console.log('\n📋 Næste skridt:');
        console.log('   1. Gå til Supabase dashboard → SQL Editor');
        console.log('   2. Åbn filen: supabase/schema.sql');
        console.log('   3. Kopier og kør SQL scriptet');
        return false;
      } else if (error.code === 'PGRST301' || error.message.includes('permission')) {
        console.error('❌ Permission denied!');
        console.log('   Tjek RLS policies i Supabase dashboard');
        return false;
      } else {
        throw error;
      }
    }

    console.log('✅ Database connection succesfuld!');
    console.log(`   Antal planer i database: ${count || 0}\n`);

    if (count === 0) {
      console.log('⚠️  Databasen er tom!');
      console.log('   Kør "npm run seed" for at importere planer\n');
    } else {
      console.log('✅ Data fundet i databasen!');
      
      // Vis første plan som eksempel
      if (data && data.length > 0) {
        const firstPlan = data[0];
        console.log('\n📋 Eksempel plan:');
        console.log(`   ID: ${firstPlan.id}`);
        console.log(`   Navn: ${firstPlan.name}`);
        console.log(`   Provider: ${firstPlan.provider}`);
        console.log(`   Pris: ${firstPlan.price} kr`);
        console.log(`   Aktiv: ${firstPlan.is_active ? 'Ja' : 'Nej'}\n`);
      }
    }

    // Test RLS - prøv at læse aktive planer
    console.log('🔍 Tester RLS (Row Level Security)...');
    const { data: activePlans, error: rlsError } = await testSupabase
      .from('mobile_plans')
      .select('id, name, is_active')
      .eq('is_active', true)
      .limit(5);

    if (rlsError) {
      console.error('❌ RLS test fejlede:', rlsError.message);
      return false;
    }

    console.log(`✅ RLS virker korrekt! Kan læse ${activePlans?.length || 0} aktive planer\n`);

    return true;
  } catch (error) {
    console.error('❌ Fejl ved database test:', error.message);
    console.error('   Detaljer:', error);
    return false;
  }
}

// Kør test
testSupabaseConnection()
  .then((success) => {
    if (success) {
      console.log('🎉 Alle tests bestået! Supabase er klar til brug.');
      process.exit(0);
    } else {
      console.log('\n⚠️  Nogle tests fejlede. Tjek fejlbeskederne ovenfor.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n💥 Fatal fejl:', error);
    process.exit(1);
  });

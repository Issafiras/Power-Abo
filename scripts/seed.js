/**
 * Wrapper script til at køre seedPlans.js
 * Dette script sikrer at environment variables er indlæst korrekt
 */

// Load environment variables from .env file
import { loadEnv } from './load-env.js';
loadEnv();

import { seedDatabase } from '../src/utils/seedPlans.js';

// Kør seeding
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

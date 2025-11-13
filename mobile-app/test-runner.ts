/**
 * Simple Test Runner for Mobile App
 * Run with: npx ts-node test-runner.ts
 */

import { runStoreTests } from './__tests__/store.test';

async function main() {
  console.log('🚀 Running Mobile App Tests\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const storeTestsPassed = await runStoreTests();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (storeTestsPassed) {
    console.log('\n✅ All tests passed!\n');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed\n');
    process.exit(1);
  }
}

main().catch(console.error);


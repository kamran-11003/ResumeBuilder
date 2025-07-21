import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local BEFORE any other imports
config({ path: resolve(process.cwd(), '.env.local') });

import { seedTemplates } from '../src/lib/seed/templates';

async function main() {
  console.log('🌱 Starting template seeding...');
  
  try {
    await seedTemplates();
    console.log('✅ Template seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Template seeding failed:', error);
    process.exit(1);
  }
}

main(); 
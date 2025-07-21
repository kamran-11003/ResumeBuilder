const { seedTemplates } = require('../src/lib/seed/templates.ts');

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
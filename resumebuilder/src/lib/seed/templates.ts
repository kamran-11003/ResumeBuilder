import dbConnect from '../db';
import { Template } from '../models/Template';

const mainTex = `
% PASTE THE FULL main.tex CONTENT PROVIDED BY THE USER HERE
`;

const resumeCls = `
% PASTE THE FULL resume.cls CONTENT PROVIDED BY THE USER HERE
`;

export async function seedTemplates() {
  try {
    await dbConnect();
    // Remove all previous templates
    await Template.deleteMany({});
    // Create new template
    const templateDoc = new Template({
      name: 'Kamran Main Resume',
      description: 'Kamran Ali modern professional resume template.',
      category: 'modern',
      author: 'Kamran Ali',
      version: '1.0',
      latexCode: mainTex,
      classFile: resumeCls,
      isActive: true,
      isPremium: false,
      tags: ['modern', 'professional', 'kamran'],
      metadata: {
        sections: [
          'summary',
          'education',
          'skills',
          'projects',
          'certifications'
        ],
        colors: ['black', 'blue'],
        fonts: ['default'],
        features: ['single-column', 'modern', 'kamran']
      },
      usage: {
        totalUses: 0
      }
    });
    await templateDoc.save();
    console.log('✅ Kamran template seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
  }
}

if (require.main === module) {
  seedTemplates()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
} 
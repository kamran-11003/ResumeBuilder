import dbConnect from '../db';
import { Template } from '../models/Template';
import fs from 'fs';
import path from 'path';

const mainTex = fs.readFileSync(path.join(process.cwd(), 'templates', 'main.tex'), 'utf8');
const resumeCls = fs.readFileSync(path.join(process.cwd(), 'templates', 'resume.cls'), 'utf8');

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
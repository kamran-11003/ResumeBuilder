import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Template } from '@/lib/models/Template';

// GET /api/templates - Get all templates
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPremium = searchParams.get('isPremium');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    let query: any = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (isPremium !== null) {
      query.isPremium = isPremium === 'true';
    }
    
    const templates = await Template.find(query)
      .sort({ 'usage.totalUses': -1 })
      .limit(limit)
      .select('-latexCode'); // Don't send LaTeX code in list view
    
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create new template (admin only)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { name, description, category, author, version, latexCode, tags, metadata } = body;
    
    // Validate required fields
    if (!name || !description || !category || !author || !latexCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if template with same name already exists
    const existingTemplate = await Template.findOne({ name });
    if (existingTemplate) {
      return NextResponse.json(
        { error: 'Template with this name already exists' },
        { status: 409 }
      );
    }
    
    const template = new Template({
      name,
      description,
      category,
      author,
      version: version || '1.0.0',
      latexCode,
      tags: tags || [],
      metadata: metadata || {
        sections: [],
        colors: [],
        fonts: [],
        features: []
      },
      isActive: true,
      isPremium: false,
      usage: {
        totalUses: 0
      }
    });
    
    await template.save();
    
    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
} 
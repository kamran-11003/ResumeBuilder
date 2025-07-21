import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Template } from '@/lib/models/Template';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const template = await Template.findById(id);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// PUT /api/templates/[id] - Update template (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { name, description, category, version, latexCode, tags, metadata, isActive, isPremium } = body;
    
    const template = await Template.findById(params.id);
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    
    // Update fields if provided
    if (name) template.name = name;
    if (description) template.description = description;
    if (category) template.category = category;
    if (version) template.version = version;
    if (latexCode) template.latexCode = latexCode;
    if (tags) template.tags = tags;
    if (metadata) template.metadata = metadata;
    if (typeof isActive === 'boolean') template.isActive = isActive;
    if (typeof isPremium === 'boolean') template.isPremium = isPremium;
    
    await template.save();
    
    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/[id] - Delete template (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const template = await Template.findById(params.id);
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    
    // Soft delete by setting isActive to false
    template.isActive = false;
    await template.save();
    
    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
} 
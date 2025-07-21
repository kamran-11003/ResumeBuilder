import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/resumes - Get user's resumes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    // For now, return mock data
    // In production, fetch from database using session.user.id
    const mockResumes = [
      {
        id: '1',
        title: 'Software Engineer Resume',
        template: 'Deedy Resume',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T14:45:00Z',
        isPublic: true,
        userId: session.user.id
      },
      {
        id: '2',
        title: 'Product Manager Resume',
        template: 'Modern Template',
        createdAt: '2024-01-10T09:15:00Z',
        updatedAt: '2024-01-18T16:20:00Z',
        isPublic: false,
        userId: session.user.id
      }
    ];

    return NextResponse.json({ resumes: mockResumes });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resumes' },
      { status: 500 }
    );
  }
}

// POST /api/resumes - Create new resume
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, template, content, isPublic = false } = body;

    if (!title || !template) {
      return NextResponse.json(
        { error: 'Title and template are required' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // For now, return mock response
    // In production, save to database
    const newResume = {
      id: Date.now().toString(),
      title,
      template,
      content,
      isPublic,
      userId: session.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({ resume: newResume }, { status: 201 });
  } catch (error) {
    console.error('Error creating resume:', error);
    return NextResponse.json(
      { error: 'Failed to create resume' },
      { status: 500 }
    );
  }
} 
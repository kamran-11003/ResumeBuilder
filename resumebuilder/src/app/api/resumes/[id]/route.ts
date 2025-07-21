import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/resumes/[id] - Get specific resume
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    // In production, fetch from database using params.id and session.user.id
    const mockResume = {
      id: params.id,
      title: 'Software Engineer Resume',
      template: 'Deedy Resume',
      content: {
        personalInfo: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA',
          linkedin: 'linkedin.com/in/johndoe'
        },
        experience: [
          {
            company: 'Tech Corp',
            position: 'Senior Software Engineer',
            startDate: '2022-01',
            endDate: 'Present',
            description: 'Led development of web applications using React and Node.js'
          }
        ],
        education: [
          {
            institution: 'University of Technology',
            degree: 'Bachelor of Science',
            field: 'Computer Science',
            startDate: '2018-09',
            endDate: '2022-05',
            gpa: 3.8
          }
        ],
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB']
      },
      isPublic: true,
      userId: session.user.id,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-20T14:45:00Z'
    };

    return NextResponse.json({ resume: mockResume });
  } catch (error) {
    console.error('Error fetching resume:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume' },
      { status: 500 }
    );
  }
}

// PUT /api/resumes/[id] - Update resume
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, template, content, isPublic } = body;

    await dbConnect();
    
    // For now, return mock response
    // In production, update in database
    const updatedResume = {
      id: params.id,
      title: title || 'Updated Resume',
      template: template || 'Deedy Resume',
      content: content || {},
      isPublic: isPublic !== undefined ? isPublic : true,
      userId: session.user.id,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({ resume: updatedResume });
  } catch (error) {
    console.error('Error updating resume:', error);
    return NextResponse.json(
      { error: 'Failed to update resume' },
      { status: 500 }
    );
  }
}

// DELETE /api/resumes/[id] - Delete resume
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    // For now, return success
    // In production, delete from database
    return NextResponse.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    );
  }
} 
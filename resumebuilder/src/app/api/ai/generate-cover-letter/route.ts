import { NextRequest, NextResponse } from 'next/server';
import { geminiService, UserProfile, JobDescription } from '@/lib/ai/gemini';
import { latexCompiler } from '@/lib/latex/compiler';

export async function POST(request: NextRequest) {
  try {
    const { userProfile, jobDescription, resumeData, tone } = await request.json();

    // Validate input
    if (!userProfile || !jobDescription) {
      return NextResponse.json(
        { error: 'User profile and job description are required' },
        { status: 400 }
      );
    }

    // Generate cover letter LaTeX code using AI
    const latexCode = await geminiService.generateCoverLetter(
      userProfile,
      jobDescription,
      resumeData || {},
      tone || 'professional'
    );

    // Compile LaTeX to PDF
    const compilationResult = await latexCompiler.compileCoverLetter(latexCode);

    if (!compilationResult.success) {
      return NextResponse.json(
        { 
          error: 'Failed to compile cover letter PDF',
          details: compilationResult.error,
          latexCode // Return LaTeX code for debugging
        },
        { status: 500 }
      );
    }

    // Get PDF buffer for download
    const pdfBuffer = await latexCompiler.getPDFBuffer(compilationResult.pdfPath!);

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="cover-letter.pdf"',
      },
    });
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return NextResponse.json(
      { error: 'Failed to generate cover letter' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { geminiService, JobDescription } from '@/lib/ai/gemini';

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription } = await request.json();

    // Validate input
    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: 'Resume text and job description are required' },
        { status: 400 }
      );
    }

    // Analyze ATS compatibility using AI
    const analysis = await geminiService.analyzeATS(resumeText, jobDescription);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing ATS:', error);
    return NextResponse.json(
      { error: 'Failed to analyze ATS compatibility' },
      { status: 500 }
    );
  }
} 
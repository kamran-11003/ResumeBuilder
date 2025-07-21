import { NextRequest, NextResponse } from 'next/server';
import { geminiService, UserProfile, JobDescription } from '@/lib/ai/gemini';

export async function POST(request: NextRequest) {
  try {
    const { userProfile, jobDescription } = await request.json();

    // Validate input
    if (!userProfile || !jobDescription) {
      return NextResponse.json(
        { error: 'User profile and job description are required' },
        { status: 400 }
      );
    }

    // Generate questions using AI
    const questions = await geminiService.generateQuestions(userProfile, jobDescription);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
} 
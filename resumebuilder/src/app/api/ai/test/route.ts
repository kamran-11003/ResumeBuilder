import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '@/lib/ai/gemini';

export async function GET(request: NextRequest) {
  try {
    const testResult = await geminiService.testConnection();
    
    if (testResult.success) {
      return NextResponse.json({ 
        status: 'success', 
        message: 'Gemini API is working correctly' 
      });
    } else {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Gemini API test failed',
        error: testResult.error 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error testing API:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to test API',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
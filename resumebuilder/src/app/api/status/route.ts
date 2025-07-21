import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '@/lib/ai/gemini';
import { latexCompiler } from '@/lib/latex/compiler';

export async function GET(request: NextRequest) {
  try {
    // Check Gemini API
    const geminiTest = await geminiService.testConnection();
    
    // Check LaTeX installation
    const isLaTeXInstalled = await latexCompiler.checkLaTeXInstallation();
    
    // Check environment variables
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;
    const hasMongoURI = !!process.env.MONGODB_URI;
    
    const status = {
      timestamp: new Date().toISOString(),
      services: {
        gemini: {
          status: geminiTest.success ? '✅ Working' : '❌ Failed',
          error: geminiTest.error || null
        },
        latex: {
          status: isLaTeXInstalled ? '✅ Installed' : '⚠️ Not Installed (HTML fallback available)',
          installed: isLaTeXInstalled
        },
        database: {
          status: hasMongoURI ? '✅ Configured' : '❌ Not Configured',
          hasURI: hasMongoURI
        }
      },
      environment: {
        geminiKey: hasGeminiKey ? '✅ Set' : '❌ Missing',
        mongoURI: hasMongoURI ? '✅ Set' : '❌ Missing'
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };

    const allServicesWorking = geminiTest.success && hasGeminiKey && hasMongoURI;
    
    return NextResponse.json(status, {
      status: allServicesWorking ? 200 : 503
    });
  } catch (error) {
    console.error('Error checking system status:', error);
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: 'Failed to check system status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
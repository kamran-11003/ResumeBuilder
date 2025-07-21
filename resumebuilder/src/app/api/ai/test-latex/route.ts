import { NextRequest, NextResponse } from 'next/server';
import { latexCompiler } from '@/lib/latex/compiler';

export async function GET(request: NextRequest) {
  try {
    // Test with a simple LaTeX document
    const testLatex = `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{geometry}
\\usepackage{hyperref}
\\usepackage{xcolor}

\\geometry{margin=1in}

\\begin{document}

\\begin{center}
{\\Huge \\textbf{Test Resume}} \\\\
\\textit{Software Developer} \\\\
\\href{mailto:test@example.com}{test@example.com}
\\end{center}

\\section*{Summary}
This is a test resume to verify LaTeX compilation is working correctly.

\\section*{Skills}
\\begin{itemize}
\\item JavaScript
\\item React
\\item Node.js
\\end{itemize}

\\section*{Experience}
\\textbf{Software Developer} \\hfill 2022 - Present \\\\
\\textit{Test Company} \\\\
Developed web applications using modern technologies.

\\end{document}`;

    console.log('🧪 Testing LaTeX compilation with simple document...');
    const result = await latexCompiler.compileToPDF(testLatex, 'test_resume');
    
    if (result.success) {
      return NextResponse.json({
        status: 'success',
        message: 'LaTeX compilation test successful',
        pdfPath: result.pdfPath,
        log: result.log
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'LaTeX compilation test failed',
        error: result.error,
        log: result.log
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error testing LaTeX:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to test LaTeX',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { geminiService, UserProfile, JobDescription } from '@/lib/ai/gemini';
import { latexCompiler } from '@/lib/latex/compiler';
import { PDFGenerator } from '@/lib/pdf/generator';
import { Template } from '@/lib/models/Template';

export async function POST(request: NextRequest) {
  try {
    const { userProfile, jobDescription, additionalAnswers, templateId } = await request.json();

    // Validate input
    if (!userProfile || !jobDescription || !templateId) {
      return NextResponse.json(
        { error: 'User profile, job description, and template ID are required' },
        { status: 400 }
      );
    }

    // Fetch template from DB
    const template = await Template.findById(templateId);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Generate LaTeX code using AI
    const latexCode = await geminiService.generateResume(
      userProfile,
      jobDescription,
      additionalAnswers || {},
      templateId
    );

    // Display LaTeX code in console for debugging
    console.log('📄 Generated LaTeX Code:');
    console.log('='.repeat(80));
    console.log(latexCode);
    console.log('='.repeat(80));

    let pdfBuffer: Buffer;

    try {
      // Try LaTeX compilation first
      console.log('🔄 Attempting LaTeX compilation...');
      const compilationResult = await latexCompiler.compileToPDF(
        latexCode,
        undefined,
        template.classFile ? { name: 'resume.cls', content: template.classFile } : undefined
      );

      if (compilationResult.success && compilationResult.pdfPath) {
        // Get PDF buffer for download
        pdfBuffer = await latexCompiler.getPDFBuffer(compilationResult.pdfPath);
        console.log('✅ LaTeX compilation successful');
      } else {
        console.log('⚠️ LaTeX compilation failed, using HTML fallback');
        console.log('❌ LaTeX Error:', compilationResult.error);
        console.log('📋 LaTeX Log:', compilationResult.log);
        throw new Error('LaTeX compilation failed');
      }
    } catch (latexError) {
      console.log('🔄 LaTeX compilation failed, using HTML fallback:', latexError);
      
      try {
        // Fallback to HTML-to-PDF generation
        console.log('🔄 Converting LaTeX to HTML...');
        const htmlContent = PDFGenerator.convertLaTeXToHTML(latexCode);
        console.log('📄 Generated HTML:');
        console.log('='.repeat(80));
        console.log(htmlContent.substring(0, 1000) + '...'); // Show first 1000 chars
        console.log('='.repeat(80));
        
        pdfBuffer = await PDFGenerator.generateFromHTML(htmlContent);
        console.log('✅ HTML-to-PDF fallback successful');
      } catch (htmlError) {
        console.error('❌ HTML fallback also failed:', htmlError);
        throw new Error('Both LaTeX and HTML PDF generation failed');
      }
    }

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
      },
    });
  } catch (error) {
    console.error('Error generating resume:', error);
    return NextResponse.json(
      { error: 'Failed to generate resume' },
      { status: 500 }
    );
  }
} 
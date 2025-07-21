import puppeteer from 'puppeteer';

export class PDFGenerator {
  /**
   * Generate PDF from HTML content
   */
  static async generateFromHTML(htmlContent: string): Promise<Buffer> {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      
      // Set content and wait for it to load
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        },
        printBackground: true
      });

      await browser.close();
      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  /**
   * Convert LaTeX-like content to HTML for PDF generation
   */
  static convertLaTeXToHTML(latexContent: string): string {
    // Simple LaTeX to HTML conversion for basic resume formatting
    let html = latexContent
      .replace(/\\documentclass[\s\S]*?\\begin\{document\}/, '')
      .replace(/\\end\{document\}/, '')
      .replace(/\\section\*\{([^}]+)\}/g, '<h2>$1</h2>')
      .replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>')
      .replace(/\\\\/g, '<br>')
      .replace(/\\vspace\{([^}]+)\}/g, '<div style="margin-top: $1;"></div>')
      .replace(/\\begin\{center\}/g, '<div style="text-align: center;">')
      .replace(/\\end\{center\}/g, '</div>')
      .replace(/\\begin\{flushleft\}/g, '<div style="text-align: left;">')
      .replace(/\\end\{flushleft\}/g, '</div>');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Resume</title>
        <style>
          body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          h1 {
            font-size: 24pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 10px;
            color: #2c3e50;
          }
          h2 {
            font-size: 16pt;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 10px;
            color: #34495e;
            border-bottom: 2px solid #3498db;
            padding-bottom: 5px;
          }
          h3 {
            font-size: 14pt;
            font-weight: bold;
            margin-top: 15px;
            margin-bottom: 5px;
            color: #2c3e50;
          }
          p {
            margin: 5px 0;
          }
          .contact-info {
            text-align: center;
            margin-bottom: 20px;
          }
          .experience-item, .education-item {
            margin-bottom: 15px;
          }
          .job-title {
            font-weight: bold;
            color: #2c3e50;
          }
          .company {
            font-style: italic;
            color: #7f8c8d;
          }
          .date {
            color: #95a5a6;
            font-size: 11pt;
          }
          .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          .skill {
            background-color: #ecf0f1;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 11pt;
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;
  }
} 
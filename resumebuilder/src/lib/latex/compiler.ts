import latex from 'node-latex';
import streamToBuffer from 'stream-to-buffer';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface CompilationResult {
  success: boolean;
  pdfPath?: string;
  error?: string;
  log?: string;
}

export class LaTeXCompiler {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp', 'latex');
    this.ensureTempDir();
  }

  private async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Error creating temp directory:', error);
    }
  }

  /**
   * Compile LaTeX code to PDF
   */
  async compileToPDF(latexCode: string, filename?: string): Promise<CompilationResult> {
    const id = uuidv4();
    const baseName = filename || `resume_${id}`;
    const pdfPath = path.join(this.tempDir, `${baseName}.pdf`);
    try {
      // Write LaTeX code to file (for debugging or user download)
      const texPath = path.join(this.tempDir, `${baseName}.tex`);
      await fs.writeFile(texPath, latexCode, 'utf8');

      // Use node-latex to compile
      const output = latex(latexCode, { inputs: [this.tempDir] });
      const buffer: Buffer = await new Promise((resolve, reject) => {
        streamToBuffer(output, (err: Error | null, buf: Buffer) => {
          if (err) reject(err);
          else resolve(buf);
        });
      });
      // Save PDF for download (optional)
      await fs.writeFile(pdfPath, buffer);
      return {
        success: true,
        pdfPath,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown LaTeX compilation error',
        log: error.stack || '',
      };
    }
  }

  /**
   * Compile cover letter to PDF
   */
  async compileCoverLetter(latexCode: string, filename?: string): Promise<CompilationResult> {
    const id = uuidv4();
    const baseName = filename || `cover_letter_${id}`;
    const texPath = path.join(this.tempDir, `${baseName}.tex`);
    const pdfPath = path.join(this.tempDir, `${baseName}.pdf`);
    const logPath = path.join(this.tempDir, `${baseName}.log`);

    try {
      // Write LaTeX code to file
      await fs.writeFile(texPath, latexCode, 'utf8');

      // Compile LaTeX to PDF
      const output = latex(latexCode, { inputs: [this.tempDir] });
      const buffer: Buffer = await new Promise((resolve, reject) => {
        streamToBuffer(output, (err: Error | null, buf: Buffer) => {
          if (err) reject(err);
          else resolve(buf);
        });
      });
      // Save PDF for download (optional)
      await fs.writeFile(pdfPath, buffer);

      // Check if PDF was created
      try {
        await fs.access(pdfPath);
        
        let log = '';
        try {
          log = await fs.readFile(logPath, 'utf8');
        } catch (error) {
          // Log file might not exist
        }

        return {
          success: true,
          pdfPath,
          log: log || '' // stdout is no longer available
        };
      } catch (error) {
        return {
          success: false,
          error: 'PDF compilation failed', // stderr is no longer available
          log: '' // stdout is no longer available
        };
      }
    } catch (error) {
      console.error('Cover letter compilation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown compilation error'
      };
    } finally {
      // Clean up temporary files (except PDF)
      await this.cleanupTempFiles(baseName, ['pdf']);
    }
  }

  /**
   * Clean up temporary files
   */
  private async cleanupTempFiles(baseName: string, keepExtensions: string[] = []) {
    const extensions = ['tex', 'log', 'aux', 'out', 'toc', 'lof', 'lot', 'fls', 'fdb_latexmk'];
    
    for (const ext of extensions) {
      if (!keepExtensions.includes(ext)) {
        try {
          const filePath = path.join(this.tempDir, `${baseName}.${ext}`);
          await fs.unlink(filePath);
        } catch (error) {
          // File might not exist, ignore error
        }
      }
    }
  }

  /**
   * Get PDF as buffer for download
   */
  async getPDFBuffer(pdfPath: string): Promise<Buffer> {
    try {
      return await fs.readFile(pdfPath);
    } catch (error) {
      throw new Error('Failed to read PDF file');
    }
  }

  /**
   * Delete PDF file
   */
  async deletePDF(pdfPath: string): Promise<void> {
    try {
      await fs.unlink(pdfPath);
    } catch (error) {
      console.error('Error deleting PDF:', error);
    }
  }

  /**
   * Check if LaTeX is installed
   */
  async checkLaTeXInstallation(): Promise<boolean> {
    // node-latex requires a TeX distribution, but we assume it's installed if node-latex runs
    return true;
  }

  /**
   * Get LaTeX version
   */
  async getLaTeXVersion(): Promise<string> {
    return 'node-latex';
  }
}

export const latexCompiler = new LaTeXCompiler(); 
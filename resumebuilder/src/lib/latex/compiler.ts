import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

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
    // Check if LaTeX is installed first
    const isLaTeXInstalled = await this.checkLaTeXInstallation();
    if (!isLaTeXInstalled) {
      console.log('❌ LaTeX not found in PATH. Available PATH entries:');
      console.log(process.env.PATH?.split(';').filter(p => p.includes('MiKTeX')));
      return {
        success: false,
        error: 'LaTeX is not installed on this system. Please install a LaTeX distribution like MiKTeX or TeX Live.'
      };
    }

    console.log('✅ LaTeX installation detected');

    const id = uuidv4();
    const baseName = filename || `resume_${id}`;
    const texPath = path.join(this.tempDir, `${baseName}.tex`);
    const pdfPath = path.join(this.tempDir, `${baseName}.pdf`);
    const logPath = path.join(this.tempDir, `${baseName}.log`);

    try {
      // Write LaTeX code to file
      console.log(`📝 Writing LaTeX to: ${texPath}`);
      await fs.writeFile(texPath, latexCode, 'utf8');

      // Compile LaTeX to PDF
      const pdflatexPath = 'C:\\Users\\Kamra\\AppData\\Local\\Programs\\MiKTeX\\miktex\\bin\\x64\\pdflatex.exe';
      const command = `"${pdflatexPath}" -interaction=nonstopmode -output-directory="${this.tempDir}" "${texPath}"`;
      console.log(`🔄 Running command: ${command}`);
      
      const { stdout, stderr } = await execAsync(command, { timeout: 120000 }); // 2 minute timeout for package installation

      console.log('📋 LaTeX stdout:', stdout);
      if (stderr) {
        console.log('⚠️ LaTeX stderr:', stderr);
      }

      // Check if PDF was created
      try {
        await fs.access(pdfPath);
        console.log(`✅ PDF created at: ${pdfPath}`);
        
        // Read the log file for any warnings
        let log = '';
        try {
          log = await fs.readFile(logPath, 'utf8');
          console.log('📋 LaTeX log file content:');
          console.log(log);
        } catch (error) {
          console.log('⚠️ Could not read log file');
        }

        return {
          success: true,
          pdfPath,
          log: log || stdout
        };
      } catch (error) {
        // PDF was not created
        console.log(`❌ PDF not found at: ${pdfPath}`);
        console.log('📋 Available files in temp directory:');
        try {
          const files = await fs.readdir(this.tempDir);
          console.log(files);
        } catch (err) {
          console.log('Could not list temp directory');
        }
        
        return {
          success: false,
          error: stderr || 'PDF compilation failed',
          log: stdout
        };
      }
    } catch (error) {
      console.error('❌ LaTeX compilation error:', error);
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
      const { stdout, stderr } = await execAsync(
        `pdflatex -interaction=nonstopmode -output-directory="${this.tempDir}" "${texPath}"`,
        { timeout: 30000 }
      );

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
          log: log || stdout
        };
      } catch (error) {
        return {
          success: false,
          error: stderr || 'PDF compilation failed',
          log: stdout
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
    try {
      // Try the full path first
      const fullPath = 'C:\\Users\\Kamra\\AppData\\Local\\Programs\\MiKTeX\\miktex\\bin\\x64\\pdflatex.exe';
      const { stdout } = await execAsync(`"${fullPath}" --version`);
      return stdout.includes('pdfTeX');
    } catch (error) {
      // Try PATH as fallback
      try {
        const { stdout } = await execAsync('pdflatex --version');
        return stdout.includes('pdfTeX');
      } catch (pathError) {
        return false;
      }
    }
  }

  /**
   * Get LaTeX version
   */
  async getLaTeXVersion(): Promise<string> {
    try {
      const fullPath = 'C:\\Users\\Kamra\\AppData\\Local\\Programs\\MiKTeX\\miktex\\bin\\x64\\pdflatex.exe';
      const { stdout } = await execAsync(`"${fullPath}" --version`);
      return stdout.split('\n')[0];
    } catch (error) {
      return 'Unknown';
    }
  }
}

export const latexCompiler = new LaTeXCompiler(); 
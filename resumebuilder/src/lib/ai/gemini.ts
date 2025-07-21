import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface UserProfile {
  name: string;
  email: string;
  title?: string;
  summary?: string;
  skills: string[];
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate?: string;
    gpa?: number;
  }>;
}

export interface JobDescription {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
}

export interface AIQuestion {
  question: string;
  input_type: 'text' | 'textarea' | 'select' | 'multiselect';
  options?: string[];
  required: boolean;
  category: string;
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  /**
   * Test the API connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Try a simple test
      const testModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await testModel.generateContent('Hello');
      const response = await result.response;
      const text = response.text();
      
      return { success: true };
    } catch (error) {
      console.error('API test failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Generate questions based on user profile and job description
   */
  async generateQuestions(userProfile: UserProfile, jobDescription: JobDescription): Promise<AIQuestion[]> {
    // First test the connection
    const testResult = await this.testConnection();
    if (!testResult.success) {
      console.log('API test failed, using fallback questions:', testResult.error);
      return this.getFallbackQuestions(userProfile, jobDescription);
    }

    const prompt = `
You are an expert resume writer and career coach. Analyze the following user profile and job description to generate relevant questions that will help create a targeted resume.

User Profile:
- Name: ${userProfile.name}
- Title: ${userProfile.title || 'Not specified'}
- Skills: ${userProfile.skills.join(', ')}
- Experience: ${userProfile.experience.length} positions
- Education: ${userProfile.education.length} degrees

Job Description:
- Title: ${jobDescription.title}
- Company: ${jobDescription.company}
- Requirements: ${jobDescription.requirements?.join(', ') || 'Not specified'}
- Responsibilities: ${jobDescription.responsibilities?.join(', ') || 'Not specified'}

Generate 5-8 questions to collect missing information that would be relevant for this specific job application. Focus on:
1. Quantifiable achievements
2. Specific technical skills
3. Relevant projects
4. Industry-specific experience
5. Certifications or training

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "Describe a major achievement in your current role that demonstrates leadership.",
    "input_type": "textarea",
    "required": true,
    "category": "achievements"
  }
]

Valid input_types: "text", "textarea", "select", "multiselect"
Categories: "achievements", "skills", "projects", "experience", "education", "certifications"
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error generating questions:', error);
      
      // Check if it's a service error
      if (error instanceof Error && (error.message.includes('overloaded') || error.message.includes('503') || error.message.includes('quota') || error.message.includes('404'))) {
        console.log('Gemini API service unavailable, using fallback questions');
      }
      
      // Return smart fallback questions based on job description
      return this.getFallbackQuestions(userProfile, jobDescription);
    }
  }

  /**
   * Generate smart fallback questions based on job description
   */
  private getFallbackQuestions(userProfile: UserProfile, jobDescription: JobDescription): AIQuestion[] {
    const baseQuestions = [
      {
        question: "Describe your most significant professional achievement that demonstrates leadership or problem-solving skills.",
        input_type: "textarea" as const,
        required: true,
        category: "achievements"
      },
      {
        question: "What specific technical skills are you most proficient in?",
        input_type: "multiselect" as const,
        options: ["JavaScript", "Python", "React", "Node.js", "AWS", "Docker", "Kubernetes", "SQL", "MongoDB", "Git", "TypeScript", "Java", "C++", "Machine Learning", "DevOps"],
        required: true,
        category: "skills"
      },
      {
        question: "Describe a challenging project you've worked on and the impact it had.",
        input_type: "textarea" as const,
        required: false,
        category: "projects"
      },
      {
        question: "What certifications or specialized training do you have?",
        input_type: "text" as const,
        required: false,
        category: "certifications"
      }
    ];

    // Add job-specific questions based on job title
    const jobTitle = jobDescription.title.toLowerCase();
    if (jobTitle.includes('senior') || jobTitle.includes('lead') || jobTitle.includes('manager')) {
      baseQuestions.push({
        question: "Describe a time when you led a team or mentored junior developers.",
        input_type: "textarea" as const,
        required: false,
        category: "experience"
      });
    }

    if (jobTitle.includes('full-stack') || jobTitle.includes('frontend') || jobTitle.includes('backend')) {
      baseQuestions.push({
        question: "What frameworks and technologies do you use for full-stack development?",
        input_type: "multiselect" as const,
        options: ["React", "Vue.js", "Angular", "Express.js", "Django", "Flask", "Spring Boot", "Laravel", "Next.js", "Nuxt.js"],
        required: false,
        category: "skills"
      });
    }

    if (jobTitle.includes('devops') || jobTitle.includes('cloud') || jobTitle.includes('aws')) {
      baseQuestions.push({
        question: "What cloud platforms and DevOps tools are you experienced with?",
        input_type: "multiselect" as const,
        options: ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins", "GitLab CI", "Terraform", "Ansible", "Prometheus"],
        required: false,
        category: "skills"
      });
    }

    return baseQuestions;
  }

  /**
   * Generate LaTeX resume code based on user data and template
   */
  async generateResume(userProfile: UserProfile, jobDescription: JobDescription, additionalAnswers: Record<string, string>, templateId: string): Promise<string> {
    try {
      // Get template from database
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/templates/${templateId}`);
      if (!response.ok) {
        throw new Error('Template not found');
      }
      const { template } = await response.json();
      
      const prompt = `
You are an expert LaTeX resume writer. Generate professional LaTeX code for a resume based on the following information.

User Profile:
${JSON.stringify(userProfile, null, 2)}

Job Description:
${JSON.stringify(jobDescription, null, 2)}

Additional Answers:
${JSON.stringify(additionalAnswers, null, 2)}

Template Base: ${template.name} (${template.category})

Requirements:
1. Use the provided template structure as a base
2. Replace placeholder content with user data
3. Tailor content to the job description
4. Include quantifiable achievements
5. Use action verbs and industry-specific keywords
6. Ensure proper LaTeX syntax
7. Return ONLY the LaTeX code, no explanations
8. Use ONLY these packages: inputenc, fontenc, geometry, hyperref, xcolor, titlesec, enumitem
9. DO NOT use fontawesome, tikz, or other complex packages
10. Keep the document simple and professional

Template Guidelines:
- Maintain the original template structure and styling
- Replace all placeholder text with actual user data
- Ensure all sections are properly formatted
- Keep the professional appearance of the template
- Use basic LaTeX packages only

Return the complete LaTeX document code:
`;

      const result = await this.model.generateContent(prompt);
      const response_text = await result.response.text();
      
      // Extract LaTeX code from response
      const latexMatch = response_text.match(/\\documentclass[\s\S]*\\end\{document\}/);
      if (!latexMatch) {
        throw new Error('Invalid LaTeX response from AI');
      }
      
      return latexMatch[0];
    } catch (error) {
      console.error('Error generating resume:', error);
      
      // Check if it's a quota error
      if (error instanceof Error && error.message && error.message.includes('quota')) {
        console.log('Gemini API quota exceeded, using fallback template');
      }
      
      // Fallback LaTeX template
      return this.getFallbackLaTeX(userProfile, 'modern');
    }
  }

  /**
   * Generate cover letter based on resume and job description
   */
  async generateCoverLetter(userProfile: UserProfile, jobDescription: JobDescription, resumeData: any, tone: 'formal' | 'enthusiastic' | 'professional' = 'professional'): Promise<string> {
    const prompt = `
Generate a professional cover letter in LaTeX format based on the following information.

User Profile:
${JSON.stringify(userProfile, null, 2)}

Job Description:
${JSON.stringify(jobDescription, null, 2)}

Resume Summary:
${JSON.stringify(resumeData, null, 2)}

Tone: ${tone}

Requirements:
1. Tailor the letter to the specific job and company
2. Use ${tone} tone
3. Reference specific skills and experiences from the resume
4. Show enthusiasm for the role
5. Include a call to action
6. Use proper LaTeX formatting
7. Return ONLY the LaTeX code

Return the complete LaTeX cover letter code:
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const latexMatch = text.match(/\\documentclass[\s\S]*\\end\{document\}/);
      if (!latexMatch) {
        throw new Error('Invalid LaTeX response from AI');
      }
      
      return latexMatch[0];
    } catch (error) {
      console.error('Error generating cover letter:', error);
      return this.getFallbackCoverLetter(userProfile, jobDescription, tone);
    }
  }

  /**
   * Analyze resume for ATS compatibility
   */
  async analyzeATS(resumeText: string, jobDescription: JobDescription): Promise<{
    score: number;
    keywords: string[];
    missingKeywords: string[];
    suggestions: string[];
  }> {
    const prompt = `
Analyze the following resume against the job description for ATS (Applicant Tracking System) compatibility.

Resume Text:
${resumeText}

Job Description:
${JSON.stringify(jobDescription, null, 2)}

Provide analysis in JSON format:
{
  "score": 85,
  "keywords": ["JavaScript", "React", "Node.js"],
  "missingKeywords": ["TypeScript", "Docker"],
  "suggestions": [
    "Add more quantifiable achievements",
    "Include specific technical skills"
  ]
}

Score should be 0-100 based on keyword match and content relevance.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error analyzing ATS:', error);
      return {
        score: 75,
        keywords: [],
        missingKeywords: [],
        suggestions: ['Unable to analyze at this time']
      };
    }
  }

  /**
   * Edit specific resume section with AI
   */
  async editSection(sectionText: string, instruction: string, context: string): Promise<string> {
    const prompt = `
Edit the following resume section based on the instruction and context.

Section Text:
${sectionText}

Instruction:
${instruction}

Context:
${context}

Return ONLY the edited section text, maintaining the same format and structure.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error editing section:', error);
      return sectionText;
    }
  }

  private getFallbackLaTeX(userProfile: UserProfile, template: string): string {
    return `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{geometry}
\\usepackage{fancyhdr}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\usepackage{hyperref}

\\geometry{margin=1in}
\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}

\\definecolor{myblue}{RGB}{0, 112, 192}
\\definecolor{mydarkblue}{RGB}{0, 64, 128}

\\begin{document}

\\begin{center}
{\\Huge\\textbf{${userProfile.name}}}\\\\
\\textit{${userProfile.title || 'Professional'}}\\\\
\\href{mailto:${userProfile.email}}{${userProfile.email}}
\\end{center}

\\vspace{0.3in}

\\section*{Professional Summary}
${userProfile.summary || 'Experienced professional with strong skills in ' + userProfile.skills.slice(0, 3).join(', ') + '. Demonstrated ability to deliver results and work effectively in team environments.'}

\\section*{Technical Skills}
\\begin{itemize}[leftmargin=*]
${userProfile.skills.map(skill => `\\item ${skill}`).join('\\n')}
\\end{itemize}

\\section*{Professional Experience}
${userProfile.experience.length > 0 ? userProfile.experience.map(exp => `
\\textbf{${exp.position}} \\hfill ${exp.startDate} - ${exp.endDate || 'Present'}\\\\
\\textit{${exp.company}}\\\\
${exp.description}
`).join('\\n\\vspace{0.1in}\\n') : `
\\textbf{Software Developer} \\hfill 2022 - Present\\\\
\\textit{Tech Company}\\\\
Developed and maintained web applications using modern technologies. Collaborated with cross-functional teams to deliver high-quality software solutions.
`}

\\section*{Education}
${userProfile.education.length > 0 ? userProfile.education.map(edu => `
\\textbf{${edu.degree} in ${edu.fieldOfStudy}} \\hfill ${edu.startDate} - ${edu.endDate || 'Present'}\\\\
\\textit{${edu.institution}}\\\\
${edu.gpa ? `GPA: ${edu.gpa}` : ''}
`).join('\\n\\vspace{0.1in}\\n') : `
\\textbf{Bachelor of Science in Computer Science} \\hfill 2018 - 2022\\\\
\\textit{University Name}\\\\
Relevant coursework: Data Structures, Algorithms, Software Engineering, Database Systems
`}

\\section*{Projects}
\\textbf{Personal Portfolio Website}\\\\
Developed a responsive web application using React and Node.js. Implemented modern UI/UX design principles and deployed using cloud services.

\\textbf{E-commerce Platform}\\\\
Built a full-stack e-commerce solution with user authentication, payment processing, and inventory management.

\\section*{Certifications}
${userProfile.skills.includes('AWS') ? 'AWS Certified Solutions Architect' : 'Relevant industry certifications'}

\\end{document}`;
  }

  private getFallbackCoverLetter(userProfile: UserProfile, jobDescription: JobDescription, tone: string): string {
    return `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{geometry}
\\usepackage{fancyhdr}

\\geometry{margin=1in}
\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}

\\begin{document}

\\begin{flushleft}
${userProfile.name}\\\\
${userProfile.email}\\\\
\\today
\\end{flushleft}

\\vspace{0.5in}

\\begin{flushleft}
Hiring Manager\\\\
${jobDescription.company}\\\\
\\end{flushleft}

\\vspace{0.3in}

\\textbf{Re: ${jobDescription.title} Position}

\\vspace{0.2in}

Dear Hiring Manager,

I am writing to express my interest in the ${jobDescription.title} position at ${jobDescription.company}. With my background in ${userProfile.skills.slice(0, 3).join(', ')}, I am confident in my ability to contribute effectively to your team.

${userProfile.summary || 'I bring strong technical skills and a proven track record of delivering results.'}

I am particularly excited about the opportunity to work at ${jobDescription.company} and would welcome the chance to discuss how my skills and experience align with your needs.

Thank you for considering my application. I look forward to hearing from you.

\\vspace{0.3in}

Sincerely,\\\\
${userProfile.name}

\\end{document}`;
  }
}

export const geminiService = new GeminiService(); 
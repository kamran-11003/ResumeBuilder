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
  input_type: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox';
  options?: string[];
  required: boolean;
  category: string;
  can_add_more?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export class CohereService {
  private apiKey = process.env.COHERE_API_KEY!;
  private apiUrl = 'https://api.cohere.ai/v1/chat';

  async generateQuestions(userProfile: UserProfile, jobDescription: JobDescription, promptOverride?: string): Promise<AIQuestion[]> {
    const prompt = promptOverride || `You are an expert resume writer and career coach. Given the following user profile and job description, generate 5-8 highly relevant, diverse, and helpful questions that:
- Help fill in gaps in the resume
- Surface strong achievements
- Match user skills to the job requirements
- Use a variety of input types: "text", "textarea", "multiselect", "checkbox"
- For skills, certifications, and languages, use "multiselect" or "checkbox" and provide a list of options extracted from the job description and common industry skills. Set can_add_more: true for these.
- For each question, include:
  - question (string)
  - input_type ("text" | "textarea" | "multiselect" | "checkbox")
  - required (true/false)
  - category ("summary" | "experience" | "skills" | "achievements" | "certifications" | "languages" | "education")
  - options (string[], for multiselect/checkbox only)
  - priority ("low" | "medium" | "high")
  - can_add_more (boolean, for skills/certifications/languages)

User Profile:
${JSON.stringify(userProfile, null, 2)}

Job Description:
${JSON.stringify(jobDescription, null, 2)}

Return ONLY a valid JSON array of questions as described above.`;

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command-r-plus',
        message: prompt,
      }),
    });
    if (!response.ok) throw new Error('Cohere API error');
    const data = await response.json();
    // Cohere returns {text: ...} or {message: ...}
    const text = data.text || data.message || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Invalid JSON response from Cohere');
    return JSON.parse(jsonMatch[0]);
  }

  async generateResume(userProfile: UserProfile, jobDescription: JobDescription, additionalAnswers: Record<string, string>, templateId: string): Promise<string> {
    const prompt = `You are an expert LaTeX resume writer. Generate professional LaTeX code for a resume based on the following information.\n\nUser Profile:\n${JSON.stringify(userProfile, null, 2)}\n\nJob Description:\n${JSON.stringify(jobDescription, null, 2)}\n\nAdditional Answers:\n${JSON.stringify(additionalAnswers, null, 2)}\n\nRequirements:\n1. Use a clean, modern LaTeX template.\n2. Replace placeholder content with user data.\n3. Tailor content to the job description.\n4. Include quantifiable achievements.\n5. Use action verbs and industry-specific keywords.\n6. Ensure proper LaTeX syntax.\n7. Return ONLY the LaTeX code, no explanations.\n8. Use ONLY these packages: inputenc, fontenc, geometry, hyperref, xcolor, titlesec, enumitem.\n9. DO NOT use fontawesome, tikz, or other complex packages.\n10. Keep the document simple and professional.\n\nReturn the complete LaTeX document code:`;
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command-r-plus',
        message: prompt,
      }),
    });
    if (!response.ok) throw new Error('Cohere API error');
    const data = await response.json();
    const text = data.text || data.message || '';
    // Try to extract LaTeX code
    const latexMatch = text.match(/\\documentclass[\s\S]*\\end\{document\}/);
    if (!latexMatch) throw new Error('Invalid LaTeX response from Cohere');
    return latexMatch[0];
  }

  async generateCoverLetter(userProfile: UserProfile, jobDescription: JobDescription, resumeData: any, tone: 'formal' | 'enthusiastic' | 'professional' = 'professional'): Promise<string> {
    const prompt = `Generate a professional cover letter in LaTeX format based on the following information.\n\nUser Profile:\n${JSON.stringify(userProfile, null, 2)}\n\nJob Description:\n${JSON.stringify(jobDescription, null, 2)}\n\nResume Summary:\n${JSON.stringify(resumeData, null, 2)}\n\nTone: ${tone}\n\nRequirements:\n1. Tailor the letter to the specific job and company\n2. Use ${tone} tone\n3. Reference specific skills and experiences from the resume\n4. Show enthusiasm for the role\n5. Include a call to action\n6. Use proper LaTeX formatting\n7. Return ONLY the LaTeX code\n\nReturn the complete LaTeX cover letter code:`;
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command-r-plus',
        message: prompt,
      }),
    });
    if (!response.ok) throw new Error('Cohere API error');
    const data = await response.json();
    const text = data.text || data.message || '';
    const latexMatch = text.match(/\\documentclass[\s\S]*\\end\{document\}/);
    if (!latexMatch) throw new Error('Invalid LaTeX response from Cohere');
    return latexMatch[0];
  }

  async analyzeATS(resumeText: string, jobDescription: JobDescription): Promise<{
    score: number;
    keywords: string[];
    missingKeywords: string[];
    suggestions: string[];
  }> {
    const prompt = `Analyze the following resume against the job description for ATS (Applicant Tracking System) compatibility.\n\nResume Text:\n${resumeText}\n\nJob Description:\n${JSON.stringify(jobDescription, null, 2)}\n\nProvide analysis in JSON format:\n{\n  "score": 85,\n  "keywords": ["JavaScript", "React", "Node.js"],\n  "missingKeywords": ["TypeScript", "Docker"],\n  "suggestions": [\n    "Add more quantifiable achievements",\n    "Include specific technical skills"\n  ]\n}\n\nScore should be 0-100 based on keyword match and content relevance.`;
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command-r-plus',
        message: prompt,
      }),
    });
    if (!response.ok) throw new Error('Cohere API error');
    const data = await response.json();
    const text = data.text || data.message || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON response from Cohere');
    return JSON.parse(jsonMatch[0]);
  }

  async editSection(sectionText: string, instruction: string, context: string): Promise<string> {
    const prompt = `Edit the following resume section based on the instruction and context.\n\nSection Text:\n${sectionText}\n\nInstruction:\n${instruction}\n\nContext:\n${context}\n\nReturn ONLY the edited section text, maintaining the same format and structure.`;
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command-r-plus',
        message: prompt,
      }),
    });
    if (!response.ok) throw new Error('Cohere API error');
    const data = await response.json();
    const text = data.text || data.message || '';
    return text.trim();
  }
}

export const geminiService = new CohereService(); 
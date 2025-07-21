import { NextRequest, NextResponse } from 'next/server';
import { geminiService, UserProfile, JobDescription } from '@/lib/ai/gemini';

function sanitize(str: string) {
  return (str || '').replace(/[^ -~\w\s.,-]/g, '').trim();
}

function extractSkillsFromJD(job: any) {
  const techKeywords = ['React', 'Node.js', 'MongoDB', 'Express', 'Next.js', 'TypeScript', 'Docker', 'GraphQL'];
  const descText = [job.description, ...(job.requirements || []), ...(job.responsibilities || [])].join(' ');
  return techKeywords.filter(skill => descText.toLowerCase().includes(skill.toLowerCase()));
}

function generateDynamicQuestions(userProfile: any, jobDescription: any) {
  const questions = [];
  if (!userProfile.summary || userProfile.summary === 'Professional summary will be added here.') {
    questions.push({
      question: 'Write a professional summary tailored to this job.',
      input_type: 'textarea',
      required: true,
      category: 'summary',
      priority: 'high'
    });
  }
  if (!userProfile.skills?.length) {
    questions.push({
      question: 'Select your strongest technical skills for this role.',
      input_type: 'checkbox',
      options: [...extractSkillsFromJD(jobDescription)],
      required: true,
      category: 'skills',
      priority: 'high',
      can_add_more: true
    });
  }
  if (!userProfile.experience?.length) {
    questions.push({
      question: 'Describe a project where you demonstrated key skills for this role.',
      input_type: 'textarea',
      required: true,
      category: 'experience',
      priority: 'medium'
    });
  }
  // Add more dynamic logic as needed
  return questions;
}

export async function POST(request: NextRequest) {
  try {
    const { userProfile, jobDescription } = await request.json();
    if (!userProfile || !jobDescription) {
      return NextResponse.json(
        { error: 'User profile and job description are required' },
        { status: 400 }
      );
    }
    // Preprocess and sanitize
    const cleanJobDescription = sanitize(jobDescription.description || '');
    const combinedPrompt = {
      title: jobDescription.title || '',
      company: jobDescription.company || '',
      description: cleanJobDescription,
      requirements: jobDescription.requirements || [],
      responsibilities: jobDescription.responsibilities || [],
    };
    const cleanedUserProfile = {
      name: userProfile.name,
      email: userProfile.email,
      title: userProfile.title || '',
      summary: userProfile.summary || '',
      skills: userProfile.skills || [],
      experience: userProfile.experience || [],
      education: userProfile.education || [],
    };
    // Dynamic question engine
    const dynamicQuestions = generateDynamicQuestions(cleanedUserProfile, combinedPrompt);
    // Prompt engineering
    const prompt = `
You are an expert career coach and resume builder. Given the job description and user profile below, generate 5-8 highly relevant, diverse, and helpful questions that:
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

Job Description:
${JSON.stringify(combinedPrompt, null, 2)}

User Profile:
${JSON.stringify(cleanedUserProfile, null, 2)}

Return ONLY a valid JSON array of questions as described above.
`;
    // Call AI
    let questions: any[] = [];
    try {
      questions = await geminiService.generateQuestions(cleanedUserProfile, combinedPrompt, prompt);
    } catch (e) {
      // fallback
      questions = [];
    }
    // Merge dynamic and AI questions, dedupe by question text
    const allQuestions = [...dynamicQuestions, ...(questions || [])].filter((q, i, arr) => arr.findIndex(x => x.question === q.question) === i);
    return NextResponse.json({ questions: allQuestions });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
} 
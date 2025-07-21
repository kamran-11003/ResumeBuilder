'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Brain, 
  Download, 
  Eye,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Zap,
  Target,
  MessageSquare,
  X,
  User
} from 'lucide-react';
import Link from 'next/link';
import TemplateSelector from '@/components/TemplateSelector';
import dynamic from 'next/dynamic';
import PDFPreview from '@/components/PDFPreview'; // Assume you have or will create this
import Sidebar from '@/components/Sidebar'; // Assume you have or will create this
import NavBar from '@/components/NavBar'; // Assume you have or will create this

interface JobDescription {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
}

interface AIQuestion {
  question: string;
  input_type: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox';
  options?: string[];
  required: boolean;
  category: string;
  can_add_more?: boolean;
}

interface UserProfile {
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

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function BuildResumeAI() {
  const [step, setStep] = useState(1);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [jobDescription, setJobDescription] = useState<JobDescription>({
    title: '',
    company: '',
    description: '',
    requirements: [],
    responsibilities: []
  });
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    title: '',
    summary: '',
    skills: [],
    experience: [],
    education: []
  });
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [latexCode, setLatexCode] = useState<string>('');
  const [compileError, setCompileError] = useState<string | null>(null);
  const compileTimeout = useRef<NodeJS.Timeout | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [customOptions, setCustomOptions] = useState<Record<number, string[]>>({});
  const [customInput, setCustomInput] = useState<Record<number, string>>({});

  // After resume is generated, set LaTeX code
  useEffect(() => {
    if (step === 4 && !latexCode && pdfUrl) {
      // Fetch the LaTeX code from the backend or from the last AI response
      // For now, assume it's available in a variable or state (update as needed)
      // setLatexCode(generatedLatexCode);
    }
  }, [step, pdfUrl]);

  // Debounced compile on LaTeX code change
  useEffect(() => {
    if (step === 4 && latexCode) {
      if (compileTimeout.current) clearTimeout(compileTimeout.current);
      compileTimeout.current = setTimeout(() => {
        compileLatex(latexCode);
      }, 800);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latexCode]);

  useEffect(() => {
    // Fetch user profile from API on mount
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setUserProfile({
            name: data.name || '',
            email: data.email || '',
            title: data.personalInfo?.title || '',
            summary: data.personalInfo?.summary || '',
            skills: Array.isArray(data.skills) ? data.skills.map((s: any) => s.name || s) : [],
            experience: Array.isArray(data.workExperience) ? data.workExperience.map((exp: any) => ({
              company: exp.company || '',
              position: exp.position || '',
              startDate: exp.startDate || '',
              endDate: exp.endDate || '',
              description: exp.description || '',
              achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
            })) : [],
            education: Array.isArray(data.education) ? data.education.map((edu: any) => ({
              institution: edu.institution || '',
              degree: edu.degree || '',
              fieldOfStudy: edu.fieldOfStudy || '',
              startDate: edu.startDate || '',
              endDate: edu.endDate || '',
              gpa: edu.gpa || undefined,
            })) : [],
          });
        }
      } catch (err) {
        // handle error
      }
    };
    fetchProfile();
  }, []);

  const compileLatex = async (code: string) => {
    setCompileError(null);
    setIsCompiling(true);
    try {
      const res = await fetch('/api/ai/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile,
          jobDescription,
          additionalAnswers: answers,
          templateId: selectedTemplateId,
          latexOverride: code,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setCompileError(data.error || 'Failed to compile LaTeX');
        setIsCompiling(false);
        return;
      }
      const blob = await res.blob();
      setPdfUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      setCompileError(err.message || 'Failed to compile LaTeX');
    }
    setIsCompiling(false);
  };

  const handleUserProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile.name || !userProfile.email) return;
    setStep(2);
  };

  const handleJobDescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.title || !jobDescription.company || !jobDescription.description) return;

    setIsGenerating(true);
    try {
      const requestBody = { userProfile, jobDescription };
      console.log('🔎 [Generate Questions] Prompt:', requestBody);
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error('Failed to generate questions');

      const data = await response.json();
      console.log('🧠 [Generate Questions] Response:', data.questions);
      setQuestions(data.questions);
      setStep(3);
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswersSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.title || !jobDescription.company || !jobDescription.description) return;

    setIsCompiling(true);
    try {
      const response = await fetch('/api/ai/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile,
          jobDescription,
          additionalAnswers: answers,
          templateId: selectedTemplateId
        })
      });

      if (!response.ok) throw new Error('Failed to generate resume');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setStep(4);
    } catch (error) {
      console.error('Error generating resume:', error);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleInputChange = (questionIndex: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex.toString()]: value
    }));
  };

  const handleAddCustomOption = (index: number, newOption: string) => {
    setCustomOptions(prev => ({
      ...prev,
      [index]: [...(prev[index] || []), newOption]
    }));
    setQuestions(prev => prev.map((q, i) =>
      i === index ? { ...q, options: [...(q.options || []), newOption] } : q
    ));
    setCustomInput(prev => ({ ...prev, [index]: '' }));
  };

  const renderQuestion = (question: AIQuestion, index: number) => {
    const value = answers[index.toString()] || '';
    if (index !== currentQuestion) return null;
    return (
      <div>
        <label className="block text-lg font-medium text-gray-900 mb-3">
          {question.question}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {(() => {
          switch (question.input_type) {
            case 'textarea':
              return (
                <textarea
                  value={value}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Enter your answer..."
                  required={question.required}
                />
              );
            case 'select':
              return (
                <select
                  value={value}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={question.required}
                >
                  <option value="">Select an option...</option>
                  {question.options?.map((option, i) => (
                    <option key={i} value={option}>{option}</option>
                  ))}
                  {(customOptions[index] || []).map((option, i) => (
                    <option key={`custom-${i}`} value={option}>{option}</option>
                  ))}
                </select>
              );
            case 'multiselect':
            case 'checkbox': {
              const selectedValues = value ? value.split(',') : [];
              const allOptions = [...(question.options || []), ...(customOptions[index] || [])];
              return (
                <div className="space-y-2">
                  {allOptions.map((option, i) => (
                    <label key={i} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedValues.includes(option)}
                        onChange={(e) => {
                          const newValues = e.target.checked
                            ? [...selectedValues, option]
                            : selectedValues.filter(v => v !== option);
                          handleInputChange(index, newValues.join(','));
                        }}
                        className="mr-2"
                      />
                      {option}
                    </label>
                  ))}
                  {question.can_add_more && (
                    <div className="flex mt-2">
                      <input
                        type="text"
                        placeholder="Add another..."
                        className="flex-1 px-2 py-1 border border-gray-300 rounded-l"
                        value={customInput[index] || ''}
                        onChange={e => setCustomInput(prev => ({ ...prev, [index]: e.target.value }))}
                      />
                      <button
                        type="button"
                        className="px-3 py-1 bg-blue-600 text-white rounded-r"
                        onClick={() => {
                          const input = customInput[index] || '';
                          if (input.trim()) {
                            handleAddCustomOption(index, input.trim());
                          }
                        }}
                      >Add</button>
                    </div>
                  )}
                </div>
              );
            }
            default:
              return (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your answer..."
                  required={question.required}
                />
              );
          }
        })()}
        {question.category && (
          <div className="mt-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {question.category}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex flex-1">
          {/* Center: PDF Preview */}
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
            <PDFPreview pdfUrl={pdfUrl} />
          </div>
          {/* Right: LaTeX Code Editor */}
          <div className="w-1/3 flex flex-col border-l">
            <MonacoEditor
              value={latexCode}
              onChange={setLatexCode}
              language="latex"
              theme="vs-dark"
              options={{ fontSize: 14 }}
            />
            <button
              className="m-4 px-6 py-2 bg-blue-600 text-white rounded"
              onClick={() => compileLatex(latexCode)}
            >
              Compile
            </button>
          </div>
        </div>
      </div>
      {/* Tools Panel (optional, floating) */}
      {/* <ToolsPanel /> */}
    </div>
  );
} 
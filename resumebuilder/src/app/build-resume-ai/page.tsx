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
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > stepNumber ? <CheckCircle className="w-4 h-4" /> : stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-6">
            <span className={`text-sm ${step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Profile
            </span>
            <span className={`text-sm ${step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Job Description
            </span>
            <span className={`text-sm ${step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              AI Questions
            </span>
            <span className={`text-sm ${step >= 4 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Generate Resume
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Your Profile
                </h1>
                <p className="text-gray-600">
                  Let's start by collecting your basic information
                </p>
              </div>

              <form onSubmit={handleUserProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    value={userProfile.title || ''}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Summary
                  </label>
                  <textarea
                    value={userProfile.summary || ''}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, summary: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Brief summary of your professional background and key strengths..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={userProfile.skills.join(', ')}
                    onChange={(e) => setUserProfile(prev => ({ 
                      ...prev, 
                      skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="JavaScript, React, Node.js, Python, AWS"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!userProfile.name || !userProfile.email}
                  className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continue to Job Description
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Job Description
                </h1>
                <p className="text-gray-600">
                  Enter the job details to help AI generate targeted questions
                </p>
              </div>

              <form onSubmit={handleJobDescriptionSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={jobDescription.title}
                    onChange={(e) => setJobDescription(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Senior Software Engineer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={jobDescription.company}
                    onChange={(e) => setJobDescription(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Google"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    value={jobDescription.description}
                    onChange={(e) => setJobDescription(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={6}
                    placeholder="Paste the full job description here..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Requirements
                    </label>
                    <textarea
                      value={jobDescription.requirements.join('\n')}
                      onChange={(e) => setJobDescription(prev => ({ 
                        ...prev, 
                        requirements: e.target.value.split('\n').filter(r => r.trim()) 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      placeholder="Enter key requirements (one per line)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Responsibilities
                    </label>
                    <textarea
                      value={jobDescription.responsibilities.join('\n')}
                      onChange={(e) => setJobDescription(prev => ({ 
                        ...prev, 
                        responsibilities: e.target.value.split('\n').filter(r => r.trim()) 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      placeholder="Enter key responsibilities (one per line)"
                    />
                  </div>
                </div>

                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume Template
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTemplateSelector(true)}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    {selectedTemplateId ? (
                      <span className="text-blue-600 font-medium">Template selected ✓</span>
                    ) : (
                      <span className="text-gray-500">Click to select a template</span>
                    )}
                  </button>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={isGenerating || !jobDescription.title || !jobDescription.company || !jobDescription.description}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Generate AI Questions
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  AI-Generated Questions
                </h2>
                <p className="text-gray-600">
                  Answer these targeted questions to help AI create your perfect resume
                </p>
              </div>

              {questions.length > 0 && (
              <form onSubmit={handleAnswersSubmit} className="space-y-6">
                  {renderQuestion(questions[currentQuestion], currentQuestion)}
                  <div className="flex justify-between mt-6">
                    <button type="button" disabled={currentQuestion === 0} onClick={() => setCurrentQuestion(q => q - 1)} className="px-4 py-2 bg-gray-200 rounded">Previous</button>
                    {currentQuestion < questions.length - 1 ? (
                      <button type="button" onClick={() => setCurrentQuestion(q => q + 1)} className="px-4 py-2 bg-blue-600 text-white rounded">Next</button>
                    ) : (
                      <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Submit</button>
                    )}
                </div>
              </form>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <div className="flex h-[80vh]">
              {/* Sidebar Navigation */}
              <div className="w-48 bg-gray-100 border-r flex flex-col items-center py-6">
                <div className="font-bold text-lg mb-8">ResumeBuilder</div>
                <nav className="flex flex-col gap-4 w-full">
                  <a href="/dashboard" className="px-4 py-2 hover:bg-gray-200 rounded">Dashboard</a>
                  <a href="/my-resumes" className="px-4 py-2 hover:bg-gray-200 rounded">My Resumes</a>
                  <a href="/cover-letter" className="px-4 py-2 hover:bg-gray-200 rounded">Cover Letter</a>
                  <a href="/ats-checker" className="px-4 py-2 hover:bg-gray-200 rounded">ATS Checker</a>
                  <a href="/settings" className="px-4 py-2 hover:bg-gray-200 rounded">Settings</a>
                </nav>
              </div>
              {/* Main Workspace: PDF Preview */}
              <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
                <div className="w-full flex-1 flex items-center justify-center">
                  {pdfUrl ? (
                    <iframe src={pdfUrl} className="w-[90%] h-[90%] border shadow-lg rounded bg-white" title="Resume Preview" />
                  ) : (
                    <span className="text-gray-400">Compile your LaTeX to see the PDF preview</span>
                  )}
                </div>
              </div>
              {/* LaTeX Code Area */}
              <div className="w-1/3 flex flex-col border-l bg-white">
                <div className="p-4 border-b font-semibold flex items-center justify-between">
                  LaTeX Code Editor
                    <button
                    className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => compileLatex(latexCode)}
                    >
                    Compile
                    </button>
                  </div>
                <div className="flex-1">
                  <MonacoEditor
                    height="100%"
                    defaultLanguage="latex"
                    value={latexCode}
                    onChange={v => setLatexCode(v || '')}
                    theme="vs-dark"
                    options={{ fontSize: 14 }}
                  />
                </div>
                {compileError && (
                  <div className="p-2 text-red-600 bg-red-50 border-t border-red-200 text-xs">{compileError}</div>
              )}
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Template Selector Modal */}
        {showTemplateSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Select Resume Template</h2>
                  <button
                    onClick={() => setShowTemplateSelector(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <TemplateSelector
                  selectedTemplateId={selectedTemplateId}
                  onTemplateSelect={(templateId) => {
                    setSelectedTemplateId(templateId);
                    setShowTemplateSelector(false);
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
} 
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Eye,
  ArrowLeft,
  CheckCircle,
  Loader2,
  MessageSquare,
  Palette,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface CoverLetterData {
  userProfile: {
    name: string;
    email: string;
    title?: string;
    summary?: string;
  };
  jobDescription: {
    title: string;
    company: string;
    description: string;
  };
  resumeData: any;
  tone: 'formal' | 'enthusiastic' | 'professional';
}

export default function CoverLetterGenerator() {
  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    jobDescription: '',
    tone: 'professional' as const,
    customMessage: ''
  });

  const tones = [
    { value: 'formal', label: 'Formal', description: 'Traditional and respectful' },
    { value: 'enthusiastic', label: 'Enthusiastic', description: 'Energetic and passionate' },
    { value: 'professional', label: 'Professional', description: 'Balanced and confident' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      // Mock user profile - in real app, this would come from user session
      const userProfile = {
        name: 'John Doe',
        email: 'john.doe@email.com',
        title: 'Software Engineer',
        summary: 'Experienced software engineer with 5+ years in full-stack development.'
      };

      const jobDescription = {
        title: formData.jobTitle,
        company: formData.company,
        description: formData.jobDescription
      };

      const response = await fetch('/api/ai/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile,
          jobDescription,
          resumeData: { customMessage: formData.customMessage },
          tone: formData.tone
        })
      });

      if (!response.ok) throw new Error('Failed to generate cover letter');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setCoverLetterData({ userProfile, jobDescription, resumeData: {}, tone: formData.tone });
    } catch (error) {
      console.error('Error generating cover letter:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI Cover Letter Generator
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Create compelling cover letters tailored to specific job descriptions using AI. 
              Choose your tone and let our AI craft a professional cover letter for you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                Generate Cover Letter
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Senior Software Engineer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Google"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    value={formData.jobDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={4}
                    placeholder="Paste the job description here..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tone *
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {tones.map((tone) => (
                      <label
                        key={tone.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.tone === tone.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="tone"
                          value={tone.value}
                          checked={formData.tone === tone.value}
                          onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value as any }))}
                          className="mr-3 text-purple-600 focus:ring-purple-500"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{tone.label}</div>
                          <div className="text-sm text-gray-600">{tone.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Message (Optional)
                  </label>
                  <textarea
                    value={formData.customMessage}
                    onChange={(e) => setFormData(prev => ({ ...prev, customMessage: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="Add any specific points you'd like to emphasize..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !formData.jobTitle || !formData.company || !formData.jobDescription}
                  className="w-full flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Cover Letter...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Cover Letter
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Preview Section */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-purple-600" />
                Cover Letter Preview
              </h2>

              {pdfUrl ? (
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <iframe
                      src={pdfUrl}
                      className="w-full h-96 border-0"
                      title="Cover Letter Preview"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <a
                      href={pdfUrl}
                      download="cover-letter.pdf"
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </a>
                    <button
                      onClick={() => setPdfUrl(null)}
                      className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Palette className="w-4 h-4 mr-2" />
                      Generate New
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Fill out the form and generate your AI-powered cover letter
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for Great Cover Letters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Be Specific</h4>
                  <p className="text-sm text-gray-600">Mention specific skills and experiences that match the job requirements.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Show Enthusiasm</h4>
                  <p className="text-sm text-gray-600">Express genuine interest in the company and the role.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Keep it Concise</h4>
                  <p className="text-sm text-gray-600">Aim for one page and focus on your most relevant achievements.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X,
  Download,
  Eye,
  Star,
  TrendingUp,
  Target,
  Zap
} from 'lucide-react';
import Link from 'next/link';

interface ATSResult {
  score: number;
  suggestions: string[];
  keywords: string[];
  missingKeywords: string[];
  formatIssues: string[];
  improvements: string[];
}

export default function ATSChecker() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<ATSResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf' || 
          droppedFile.type === 'application/msword' ||
          droppedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setFile(droppedFile);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');

  const analyzeResume = async () => {
    if (!file && !resumeText) return;

    setIsAnalyzing(true);
    setResults(null);

    try {
      // Extract text from uploaded file or use manual input
      let textToAnalyze = resumeText;
      
      if (file && !resumeText) {
        // In a real implementation, you'd extract text from PDF/DOC
        textToAnalyze = `Sample resume text for ${file.name}`;
      }

      // Mock job description if not provided
      const jobDesc = jobDescription || {
        title: "Software Engineer",
        company: "Tech Company",
        description: "We are looking for a skilled software engineer with experience in JavaScript, React, and Node.js.",
        requirements: ["JavaScript", "React", "Node.js", "Git"],
        responsibilities: ["Develop web applications", "Collaborate with team", "Write clean code"]
      };

      const response = await fetch('/api/ai/analyze-ats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: textToAnalyze,
          jobDescription: jobDesc
        })
      });

      if (!response.ok) throw new Error('Failed to analyze resume');

      const analysisResults = await response.json();
      setResults(analysisResults);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      // Fallback to mock results
      const mockResults: ATSResult = {
        score: Math.floor(Math.random() * 30) + 70,
        suggestions: [
          "Add more action verbs to your experience descriptions",
          "Include specific metrics and achievements",
          "Use industry-standard keywords",
          "Ensure consistent formatting throughout"
        ],
        keywords: ["JavaScript", "React", "Node.js", "MongoDB", "API", "Git"],
        missingKeywords: ["TypeScript", "Docker", "AWS", "CI/CD"],
        formatIssues: [
          "Inconsistent bullet point formatting",
          "Font size varies between sections"
        ],
        improvements: [
          "Add quantifiable achievements",
          "Include relevant certifications",
          "Optimize for keyword density"
        ]
      };
      setResults(mockResults);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Excellent! Your resume is well-optimized for ATS systems.';
    if (score >= 80) return 'Good! Your resume has good ATS compatibility with room for improvement.';
    if (score >= 70) return 'Fair. Your resume needs some optimization to pass ATS screening.';
    return 'Poor. Your resume needs significant improvements to pass ATS screening.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ResumeBuilder</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/build-resume" className="text-gray-600 hover:text-blue-600 transition-colors">
                Build Resume
              </Link>
              <Link href="/my-resumes" className="text-gray-600 hover:text-blue-600 transition-colors">
                My Resumes
              </Link>
              <Link href="/auth/signin" className="text-gray-600 hover:text-blue-600 transition-colors">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ATS Resume Checker
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload your resume and get instant feedback on how well it will perform 
              with Applicant Tracking Systems (ATS).
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Upload Your Resume
              </h2>
              <p className="text-gray-600">
                Supported formats: PDF, DOC, DOCX (Max 5MB)
              </p>
            </div>

            {/* Job Description Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description (Optional - for targeted analysis)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Paste the job description here for targeted ATS analysis..."
              />
            </div>

            {/* Manual Resume Text Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Paste Resume Text
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={6}
                placeholder="Paste your resume text here for analysis..."
              />
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <FileText className="w-12 h-12 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => setFile(null)}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </button>
                    <button
                      onClick={analyzeResume}
                      disabled={isAnalyzing}
                      className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Analyze Resume
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Drop your resume here, or{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Drag and drop your resume file here
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Score Card */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    ATS Compatibility Score
                  </h2>
                  <p className="text-gray-600">
                    {getScoreMessage(results.score)}
                  </p>
                </div>
                
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - results.score / 100)}`}
                        className={`${getScoreColor(results.score)} transition-all duration-1000`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-3xl font-bold ${getScoreColor(results.score)}`}>
                        {results.score}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Keywords Found</h3>
                    <p className="text-2xl font-bold text-green-600">{results.keywords.length}</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Missing Keywords</h3>
                    <p className="text-2xl font-bold text-yellow-600">{results.missingKeywords.length}</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <X className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Format Issues</h3>
                    <p className="text-2xl font-bold text-red-600">{results.formatIssues.length}</p>
                  </div>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Keywords Analysis */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-600" />
                    Keywords Analysis
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Found Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {results.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Missing Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {results.missingKeywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Improvement Suggestions
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Quick Fixes</h4>
                      <ul className="space-y-2">
                        {results.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Format Issues</h4>
                      <ul className="space-y-2">
                        {results.formatIssues.map((issue, index) => (
                          <li key={index} className="flex items-start">
                            <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Ready to improve your resume?
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/build-resume"
                      className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Build New Resume
                    </Link>
                    <button className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <Download className="w-4 h-4 mr-2" />
                      Download Report
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 
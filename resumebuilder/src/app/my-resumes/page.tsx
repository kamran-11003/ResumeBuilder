'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Download, 
  Trash2, 
  Eye,
  Copy,
  Share2,
  Calendar,
  Star,
  Search,
  Filter
} from 'lucide-react';
import Link from 'next/link';

interface Resume {
  id: string;
  name: string;
  template: string;
  lastModified: Date;
  isActive: boolean;
  isFavorite: boolean;
  sections: string[];
  previewUrl?: string;
}

export default function MyResumes() {
  const [resumes, setResumes] = useState<Resume[]>([
    {
      id: '1',
      name: 'Software Engineer Resume',
      template: 'modern',
      lastModified: new Date('2024-01-15'),
      isActive: true,
      isFavorite: true,
      sections: ['Personal Info', 'Experience', 'Education', 'Skills', 'Projects'],
      previewUrl: '/preview/1'
    },
    {
      id: '2',
      name: 'Product Manager Resume',
      template: 'classic',
      lastModified: new Date('2024-01-10'),
      isActive: false,
      isFavorite: false,
      sections: ['Personal Info', 'Experience', 'Education', 'Skills'],
      previewUrl: '/preview/2'
    },
    {
      id: '3',
      name: 'UX Designer Resume',
      template: 'creative',
      lastModified: new Date('2024-01-05'),
      isActive: false,
      isFavorite: true,
      sections: ['Personal Info', 'Experience', 'Education', 'Skills', 'Projects', 'Certifications'],
      previewUrl: '/preview/3'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredResumes = resumes.filter(resume => {
    const matchesSearch = resume.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && resume.isActive) ||
                         (filter === 'favorites' && resume.isFavorite);
    return matchesSearch && matchesFilter;
  });

  const toggleFavorite = (id: string) => {
    setResumes(resumes.map(resume => 
      resume.id === id ? { ...resume, isFavorite: !resume.isFavorite } : resume
    ));
  };

  const deleteResume = (id: string) => {
    setResumes(resumes.filter(resume => resume.id !== id));
  };

  const duplicateResume = (resume: Resume) => {
    const newResume = {
      ...resume,
      id: Date.now().toString(),
      name: `${resume.name} (Copy)`,
      isActive: false,
      lastModified: new Date()
    };
    setResumes([...resumes, newResume]);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getTemplateColor = (template: string) => {
    switch (template) {
      case 'modern': return 'bg-blue-100 text-blue-800';
      case 'classic': return 'bg-gray-100 text-gray-800';
      case 'creative': return 'bg-purple-100 text-purple-800';
      case 'minimal': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Resumes</h1>
              <p className="text-gray-600">
                Manage and organize your professional resumes
              </p>
            </div>
            <Link
              href="/build-resume"
              className="mt-4 sm:mt-0 flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Resume
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resumes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Resumes</option>
                  <option value="active">Active</option>
                  <option value="favorites">Favorites</option>
                </select>
              </div>
            </div>
          </div>

          {/* Resumes Grid */}
          {filteredResumes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No resumes found' : 'No resumes yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms or filters.'
                  : 'Create your first professional resume to get started.'
                }
              </p>
              <Link
                href="/build-resume"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Resume
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResumes.map((resume) => (
                <motion.div
                  key={resume.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Resume Preview */}
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="w-16 h-16 text-gray-400" />
                    </div>
                    {resume.isActive && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Active
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => toggleFavorite(resume.id)}
                      className={`absolute top-3 right-3 p-1 rounded-full transition-colors ${
                        resume.isFavorite 
                          ? 'bg-yellow-100 text-yellow-600' 
                          : 'bg-white text-gray-400 hover:text-yellow-600'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${resume.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Resume Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {resume.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTemplateColor(resume.template)}`}>
                        {resume.template.charAt(0).toUpperCase() + resume.template.slice(1)}
                      </span>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(resume.lastModified)}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Sections:</p>
                      <div className="flex flex-wrap gap-1">
                        {resume.sections.slice(0, 3).map((section, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {section}
                          </span>
                        ))}
                        {resume.sections.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{resume.sections.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(resume.previewUrl, '_blank')}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/build-resume?id=${resume.id}`}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => duplicateResume(resume)}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Share"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteResume(resume.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Stats */}
          {resumes.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{resumes.length}</div>
                  <div className="text-sm text-gray-600">Total Resumes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {resumes.filter(r => r.isActive).length}
                  </div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {resumes.filter(r => r.isFavorite).length}
                  </div>
                  <div className="text-sm text-gray-600">Favorites</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Set(resumes.map(r => r.template)).size}
                  </div>
                  <div className="text-sm text-gray-600">Templates Used</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 
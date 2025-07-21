'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Star, 
  Crown,
  CheckCircle,
  Eye
} from 'lucide-react';

interface Template {
  _id: string;
  name: string;
  description: string;
  category: 'modern' | 'classic' | 'creative' | 'minimal' | 'professional';
  author: string;
  version: string;
  isPremium: boolean;
  tags: string[];
  metadata: {
    sections: string[];
    colors: string[];
    fonts: string[];
    features: string[];
  };
  usage: {
    totalUses: number;
    lastUsed?: Date;
  };
}

interface TemplateSelectorProps {
  selectedTemplateId: string;
  onTemplateSelect: (templateId: string) => void;
}

export default function TemplateSelector({ selectedTemplateId, onTemplateSelect }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates?limit=20');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
        
        // Auto-select first template if none selected
        if (!selectedTemplateId && data.templates.length > 0) {
          onTemplateSelect(data.templates[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Templates', count: templates.length },
    { id: 'professional', name: 'Professional', count: templates.filter(t => t.category === 'professional').length },
    { id: 'modern', name: 'Modern', count: templates.filter(t => t.category === 'modern').length },
    { id: 'classic', name: 'Classic', count: templates.filter(t => t.category === 'classic').length },
    { id: 'creative', name: 'Creative', count: templates.filter(t => t.category === 'creative').length },
    { id: 'minimal', name: 'Minimal', count: templates.filter(t => t.category === 'minimal').length }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'modern': return 'bg-green-100 text-green-800';
      case 'classic': return 'bg-gray-100 text-gray-800';
      case 'creative': return 'bg-purple-100 text-purple-800';
      case 'minimal': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading templates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
            <span className="ml-1 text-xs opacity-75">({category.count})</span>
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <motion.div
            key={template._id}
            whileHover={{ y: -2 }}
            className={`relative cursor-pointer rounded-lg border-2 transition-all ${
              selectedTemplateId === template._id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => onTemplateSelect(template._id)}
          >
            {/* Premium Badge */}
            {template.isPremium && (
              <div className="absolute top-2 right-2">
                <Crown className="w-4 h-4 text-yellow-500" />
              </div>
            )}

            {/* Selected Check */}
            {selectedTemplateId === template._id && (
              <div className="absolute top-2 left-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
              </div>
            )}

            <div className="p-4">
              {/* Template Preview */}
              <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>

              {/* Template Info */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {template.name}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <Eye className="w-3 h-3 mr-1" />
                    {template.usage.totalUses}
                  </div>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2">
                  {template.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                    {template.category}
                  </span>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <span>v{template.version}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      +{template.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Author */}
                <div className="text-xs text-gray-500">
                  by {template.author}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No templates found for this category.</p>
        </div>
      )}
    </div>
  );
} 
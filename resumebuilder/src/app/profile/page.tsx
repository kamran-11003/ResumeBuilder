'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  User, 
  Edit3, 
  Save, 
  X,
  Linkedin,
  Github,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Plus,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import Link from 'next/link';

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
  description?: string;
}

interface Language {
  id: string;
  name: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
}

interface UserProfile {
  personalInfo: {
    firstName: string;
    lastName: string;
    title: string;
    summary: string;
    contactInfo: {
      email: string;
      phone: string;
      location: string;
      linkedin: string;
      github: string;
      website: string;
    };
  };
  experience: Array<{
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    current: boolean;
    gpa: number;
  }>;
  skills: Array<{
    id: string;
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    category: string;
  }>;
  certificates: Certificate[];
  languages: Language[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    personalInfo: {
      firstName: '',
      lastName: '',
      title: '',
      summary: '',
      contactInfo: {
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        website: ''
      }
    },
    experience: [],
    education: [],
    skills: [],
    certificates: [],
    languages: []
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [linkedinData, setLinkedinData] = useState<any>(null);

  useEffect(() => {
    // Fetch user profile from API
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile({
            personalInfo: data.personalInfo || {
              firstName: '',
              lastName: '',
              title: '',
              summary: '',
              contactInfo: {
                email: '',
                phone: '',
                location: '',
                linkedin: '',
                github: '',
                website: ''
              }
            },
            experience: Array.isArray(data.workExperience) ? data.workExperience : [],
            education: Array.isArray(data.education) ? data.education : [],
            skills: Array.isArray(data.skills) ? data.skills : [],
            certificates: Array.isArray(data.certifications) ? data.certifications : [],
            languages: Array.isArray(data.languages) ? data.languages : [],
          });
        }
      } catch (err) {
        // handle error
      }
    };
    fetchProfile();
  }, []);

  const loadProfile = async () => {
    // In a real app, this would fetch from API
    const mockProfile: UserProfile = {
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        title: 'Senior Software Engineer',
        summary: 'Experienced software engineer with 5+ years in full-stack development, specializing in React, Node.js, and cloud technologies.',
        contactInfo: {
          email: 'john.doe@email.com',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA',
          linkedin: 'linkedin.com/in/johndoe',
          github: 'github.com/johndoe',
          website: 'johndoe.com'
        }
      },
      experience: [
        {
          id: '1',
          company: 'Tech Corp',
          position: 'Senior Software Engineer',
          location: 'San Francisco, CA',
          startDate: '2022-01',
          endDate: '',
          current: true,
          description: 'Lead development of web applications using React and Node.js',
          achievements: [
            'Led a team of 5 developers to deliver a major feature',
            'Improved application performance by 40%',
            'Mentored junior developers'
          ]
        }
      ],
      education: [
        {
          id: '1',
          institution: 'Stanford University',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          startDate: '2018-09',
          endDate: '2022-05',
          current: false,
          gpa: 3.8
        }
      ],
      skills: [
        { id: '1', name: 'JavaScript', level: 'expert', category: 'Programming' },
        { id: '2', name: 'React', level: 'advanced', category: 'Frontend' },
        { id: '3', name: 'Node.js', level: 'advanced', category: 'Backend' }
      ],
      certificates: [],
      languages: []
    };
    setProfile(mockProfile);
  };

  const handleLinkedInImport = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would trigger LinkedIn OAuth
      const mockLinkedinData = {
        name: 'John Doe',
        headline: 'Senior Software Engineer at Tech Corp',
        summary: 'Experienced software engineer with expertise in React, Node.js, and cloud technologies.',
        experience: [
          {
            company: 'Tech Corp',
            title: 'Senior Software Engineer',
            duration: '2 years',
            description: 'Lead development of web applications'
          }
        ],
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS']
      };
      
      setLinkedinData(mockLinkedinData);
      
      // Auto-populate profile with LinkedIn data
      setProfile(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          firstName: mockLinkedinData.name.split(' ')[0],
          lastName: mockLinkedinData.name.split(' ')[1] || '',
          title: mockLinkedinData.headline,
          summary: mockLinkedinData.summary
        },
        skills: mockLinkedinData.skills.map((skill, index) => ({
          id: (index + 1).toString(),
          name: skill,
          level: 'intermediate' as const,
          category: 'Technical'
        }))
      }));
    } catch (error) {
      console.error('Error importing LinkedIn data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addExperience = () => {
    const newExperience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: []
    };
    setProfile(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  const removeExperience = (id: string) => {
    setProfile(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
              <p className="text-gray-600">Manage your professional information</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleLinkedInImport}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Linkedin className="w-4 h-4 mr-2" />
                Import from LinkedIn
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
              {isEditing && (
                <button
                  onClick={saveProfile}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </button>
              )}
            </div>
          </div>

          {/* LinkedIn Import Success */}
          {linkedinData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Linkedin className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">LinkedIn data imported successfully!</span>
              </div>
            </div>
          )}

          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={profile.personalInfo.firstName || ''}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, firstName: e.target.value }
                  }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={profile.personalInfo.lastName || ''}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, lastName: e.target.value }
                  }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Professional Title</label>
                <input
                  type="text"
                  value={profile.personalInfo.title || ''}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, title: e.target.value }
                  }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
                <textarea
                  value={profile.personalInfo.summary || ''}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, summary: e.target.value }
                  }))}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="flex">
                    <Mail className="w-4 h-4 text-gray-400 mt-3 mr-2" />
                    <input
                      type="email"
                      value={profile.personalInfo.contactInfo.email || ''}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        personalInfo: {
                          ...prev.personalInfo,
                          contactInfo: { ...prev.personalInfo.contactInfo, email: e.target.value }
                        }
                      }))}
                      disabled={!isEditing}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="flex">
                    <Phone className="w-4 h-4 text-gray-400 mt-3 mr-2" />
                    <input
                      type="tel"
                      value={profile.personalInfo.contactInfo.phone || ''}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        personalInfo: {
                          ...prev.personalInfo,
                          contactInfo: { ...prev.personalInfo.contactInfo, phone: e.target.value }
                        }
                      }))}
                      disabled={!isEditing}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="flex">
                    <MapPin className="w-4 h-4 text-gray-400 mt-3 mr-2" />
                    <input
                      type="text"
                      value={profile.personalInfo.contactInfo.location || ''}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        personalInfo: {
                          ...prev.personalInfo,
                          contactInfo: { ...prev.personalInfo.contactInfo, location: e.target.value }
                        }
                      }))}
                      disabled={!isEditing}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <div className="flex">
                    <Globe className="w-4 h-4 text-gray-400 mt-3 mr-2" />
                    <input
                      type="url"
                      value={profile.personalInfo.contactInfo.website || ''}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        personalInfo: {
                          ...prev.personalInfo,
                          contactInfo: { ...prev.personalInfo.contactInfo, website: e.target.value }
                        }
                      }))}
                      disabled={!isEditing}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <div className="flex">
                    <Linkedin className="w-4 h-4 text-gray-400 mt-3 mr-2" />
                    <input
                      type="url"
                      value={profile.personalInfo.contactInfo.linkedin || ''}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        personalInfo: {
                          ...prev.personalInfo,
                          contactInfo: { ...prev.personalInfo.contactInfo, linkedin: e.target.value }
                        }
                      }))}
                      disabled={!isEditing}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                  <div className="flex">
                    <Github className="w-4 h-4 text-gray-400 mt-3 mr-2" />
                    <input
                      type="url"
                      value={profile.personalInfo.contactInfo.github || ''}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        personalInfo: {
                          ...prev.personalInfo,
                          contactInfo: { ...prev.personalInfo.contactInfo, github: e.target.value }
                        }
                      }))}
                      disabled={!isEditing}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Experience Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Work Experience
              </h2>
              {isEditing && (
                <button
                  onClick={addExperience}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Experience
                </button>
              )}
            </div>

            <div className="space-y-6">
              {profile.experience.map((exp, index) => (
                <div key={exp.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{exp.position}</h3>
                    {isEditing && (
                      <button
                        onClick={() => removeExperience(exp.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                      <input
                        type="text"
                        value={exp.company || ''}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={exp.location || ''}
                        onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="month"
                        value={exp.startDate || ''}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="month"
                        value={exp.endDate || ''}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        disabled={!isEditing || exp.current}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={exp.description || ''}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Code className="w-5 h-5 mr-2" />
              Skills
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.skills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{skill.name}</div>
                    <div className="text-sm text-gray-600 capitalize">{skill.level}</div>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => setProfile(prev => ({
                        ...prev,
                        skills: prev.skills.filter(s => s.id !== skill.id)
                      }))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
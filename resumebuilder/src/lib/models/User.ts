import mongoose, { Schema, Document } from 'mongoose';

// Interface for Contact Information
interface ContactInfo {
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  linkedin?: string;
  github?: string;
  portfolio?: string;
  website?: string;
}

// Interface for Work Experience
interface WorkExperience {
  company: string;
  position: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
  highlights: string[];
}

// Interface for Education
interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  gpa?: number;
  honors?: string[];
  relevantCoursework?: string[];
  location?: string;
}

// Interface for Skills
interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: 'technical' | 'soft' | 'language' | 'tool' | 'framework' | 'database' | 'cloud' | 'other';
  yearsOfExperience?: number;
}

// Interface for Projects
interface Project {
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  startDate?: Date;
  endDate?: Date;
  highlights: string[];
  imageUrl?: string;
}

// Interface for Certifications
interface Certification {
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  url?: string;
  description?: string;
}

// Interface for Languages
interface Language {
  name: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
  speaking?: number; // 1-10 scale
  writing?: number; // 1-10 scale
  reading?: number; // 1-10 scale
}

// Interface for Awards & Honors
interface Award {
  title: string;
  issuer: string;
  date: Date;
  description?: string;
  url?: string;
}

// Interface for Publications
interface Publication {
  title: string;
  authors: string[];
  publicationDate: Date;
  journal?: string;
  url?: string;
  doi?: string;
  abstract?: string;
}

// Interface for Volunteer Experience
interface VolunteerExperience {
  organization: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
  hoursPerWeek?: number;
  totalHours?: number;
}

// Interface for Interests & Hobbies
interface Interest {
  name: string;
  description?: string;
  category?: string;
}

// Interface for References
interface Reference {
  name: string;
  title: string;
  company: string;
  email?: string;
  phone?: string;
  relationship: string;
  description?: string;
}

// Interface for Resume Templates
interface ResumeTemplate {
  id: string;
  name: string;
  category: 'modern' | 'classic' | 'creative' | 'minimal' | 'professional';
  previewUrl: string;
  isActive: boolean;
  createdAt: Date;
}

// Main User Interface
export interface IUser extends Document {
  // Authentication
  email: string;
  name: string;
  image?: string;
  emailVerified?: Date;
  
  // OAuth Providers
  accounts: {
    provider: string;
    providerAccountId: string;
    refresh_token?: string;
    access_token?: string;
    expires_at?: number;
    token_type?: string;
    scope?: string;
    id_token?: string;
    session_state?: string;
  }[];
  
  // Personal Information
  personalInfo: {
    firstName: string;
    lastName: string;
    middleName?: string;
    title?: string;
    summary: string;
    contactInfo: ContactInfo;
    dateOfBirth?: Date;
    nationality?: string;
    visaStatus?: string;
    availability?: string;
    salary?: {
      min?: number;
      max?: number;
      currency?: string;
    };
  };
  
  // Professional Information
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  awards: Award[];
  publications: Publication[];
  volunteerExperience: VolunteerExperience[];
  interests: Interest[];
  references: Reference[];
  
  // Resume Management
  resumes: {
    id: string;
    name: string;
    template: ResumeTemplate;
    sections: {
      personalInfo: boolean;
      workExperience: boolean;
      education: boolean;
      skills: boolean;
      projects: boolean;
      certifications: boolean;
      languages: boolean;
      awards: boolean;
      publications: boolean;
      volunteerExperience: boolean;
      interests: boolean;
      references: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
  }[];
  
  // Settings & Preferences
  preferences: {
    defaultTemplate: string;
    privacySettings: {
      profileVisibility: 'public' | 'private' | 'connections';
      contactInfoVisibility: 'public' | 'private' | 'connections';
      resumeVisibility: 'public' | 'private' | 'connections';
    };
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
  
  // Analytics & Usage
  analytics: {
    resumesCreated: number;
    resumesDownloaded: number;
    lastActive: Date;
    totalTimeSpent: number; // in minutes
    favoriteTemplates: string[];
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Schema Definitions
const ContactInfoSchema = new Schema<ContactInfo>({
  email: { type: String, required: true },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
  },
  linkedin: String,
  github: String,
  portfolio: String,
  website: String,
});

const WorkExperienceSchema = new Schema<WorkExperience>({
  company: { type: String, required: true },
  position: { type: String, required: true },
  location: String,
  startDate: { type: Date, required: true },
  endDate: Date,
  current: { type: Boolean, default: false },
  description: { type: String, required: true },
  achievements: [String],
  technologies: [String],
  highlights: [String],
});

const EducationSchema = new Schema<Education>({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: Date,
  current: { type: Boolean, default: false },
  gpa: Number,
  honors: [String],
  relevantCoursework: [String],
  location: String,
});

const SkillSchema = new Schema<Skill>({
  name: { type: String, required: true },
  level: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true 
  },
  category: { 
    type: String, 
    enum: ['technical', 'soft', 'language', 'tool', 'framework', 'database', 'cloud', 'other'],
    required: true 
  },
  yearsOfExperience: Number,
});

const ProjectSchema = new Schema<Project>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [String],
  githubUrl: String,
  liveUrl: String,
  startDate: Date,
  endDate: Date,
  highlights: [String],
  imageUrl: String,
});

const CertificationSchema = new Schema<Certification>({
  name: { type: String, required: true },
  issuer: { type: String, required: true },
  issueDate: { type: Date, required: true },
  expiryDate: Date,
  credentialId: String,
  url: String,
  description: String,
});

const LanguageSchema = new Schema<Language>({
  name: { type: String, required: true },
  proficiency: { 
    type: String, 
    enum: ['basic', 'conversational', 'fluent', 'native'],
    required: true 
  },
  speaking: { type: Number, min: 1, max: 10 },
  writing: { type: Number, min: 1, max: 10 },
  reading: { type: Number, min: 1, max: 10 },
});

const AwardSchema = new Schema<Award>({
  title: { type: String, required: true },
  issuer: { type: String, required: true },
  date: { type: Date, required: true },
  description: String,
  url: String,
});

const PublicationSchema = new Schema<Publication>({
  title: { type: String, required: true },
  authors: [String],
  publicationDate: { type: Date, required: true },
  journal: String,
  url: String,
  doi: String,
  abstract: String,
});

const VolunteerExperienceSchema = new Schema<VolunteerExperience>({
  organization: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: Date,
  current: { type: Boolean, default: false },
  description: { type: String, required: true },
  hoursPerWeek: Number,
  totalHours: Number,
});

const InterestSchema = new Schema<Interest>({
  name: { type: String, required: true },
  description: String,
  category: String,
});

const ReferenceSchema = new Schema<Reference>({
  name: { type: String, required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  email: String,
  phone: String,
  relationship: { type: String, required: true },
  description: String,
});

const ResumeTemplateSchema = new Schema<ResumeTemplate>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['modern', 'classic', 'creative', 'minimal', 'professional'],
    required: true 
  },
  previewUrl: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const ResumeSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  template: ResumeTemplateSchema,
  sections: {
    personalInfo: { type: Boolean, default: true },
    workExperience: { type: Boolean, default: true },
    education: { type: Boolean, default: true },
    skills: { type: Boolean, default: true },
    projects: { type: Boolean, default: true },
    certifications: { type: Boolean, default: true },
    languages: { type: Boolean, default: true },
    awards: { type: Boolean, default: true },
    publications: { type: Boolean, default: true },
    volunteerExperience: { type: Boolean, default: true },
    interests: { type: Boolean, default: true },
    references: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

const PreferencesSchema = new Schema({
  defaultTemplate: { type: String, default: 'modern' },
  privacySettings: {
    profileVisibility: { 
      type: String, 
      enum: ['public', 'private', 'connections'],
      default: 'private' 
    },
    contactInfoVisibility: { 
      type: String, 
      enum: ['public', 'private', 'connections'],
      default: 'private' 
    },
    resumeVisibility: { 
      type: String, 
      enum: ['public', 'private', 'connections'],
      default: 'private' 
    },
  },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
  },
  theme: { 
    type: String, 
    enum: ['light', 'dark', 'auto'],
    default: 'light' 
  },
  language: { type: String, default: 'en' },
});

const AnalyticsSchema = new Schema({
  resumesCreated: { type: Number, default: 0 },
  resumesDownloaded: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  totalTimeSpent: { type: Number, default: 0 },
  favoriteTemplates: [String],
});

// Main User Schema
const UserSchema = new Schema<IUser>({
  // Authentication
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: String,
  emailVerified: Date,
  
  // OAuth Accounts
  accounts: [{
    provider: String,
    providerAccountId: String,
    refresh_token: String,
    access_token: String,
    expires_at: Number,
    token_type: String,
    scope: String,
    id_token: String,
    session_state: String,
  }],
  
  // Personal Information
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: String,
    title: String,
    summary: { type: String, required: true },
    contactInfo: { type: ContactInfoSchema, required: true },
    dateOfBirth: Date,
    nationality: String,
    visaStatus: String,
    availability: String,
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' },
    },
  },
  
  // Professional Information
  workExperience: [WorkExperienceSchema],
  education: [EducationSchema],
  skills: [SkillSchema],
  projects: [ProjectSchema],
  certifications: [CertificationSchema],
  languages: [LanguageSchema],
  awards: [AwardSchema],
  publications: [PublicationSchema],
  volunteerExperience: [VolunteerExperienceSchema],
  interests: [InterestSchema],
  references: [ReferenceSchema],
  
  // Resume Management
  resumes: [ResumeSchema],
  
  // Settings & Preferences
  preferences: { type: PreferencesSchema, default: () => ({}) },
  
  // Analytics & Usage
  analytics: { type: AnalyticsSchema, default: () => ({}) },
  
}, {
  timestamps: true,
});

// Indexes for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ 'personalInfo.firstName': 1, 'personalInfo.lastName': 1 });
UserSchema.index({ 'skills.name': 1 });
UserSchema.index({ 'workExperience.company': 1 });
UserSchema.index({ 'education.institution': 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Method to get active resume
UserSchema.methods.getActiveResume = function() {
  return this.resumes.find(resume => resume.isActive);
};

// Method to create new resume
UserSchema.methods.createResume = function(name: string, template: ResumeTemplate) {
  const newResume = {
    id: `resume_${Date.now()}`,
    name,
    template,
    sections: {
      personalInfo: true,
      workExperience: true,
      education: true,
      skills: true,
      projects: true,
      certifications: true,
      languages: true,
      awards: true,
      publications: true,
      volunteerExperience: true,
      interests: true,
      references: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  };
  
  // Set all other resumes to inactive
  this.resumes.forEach(resume => resume.isActive = false);
  
  this.resumes.push(newResume);
  this.analytics.resumesCreated += 1;
  
  return newResume;
};

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 
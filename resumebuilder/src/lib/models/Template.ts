import mongoose, { Document, Schema } from 'mongoose';

export interface ITemplate extends Document {
  name: string;
  description: string;
  category: 'modern' | 'classic' | 'creative' | 'minimal' | 'professional';
  author: string;
  version: string;
  latexCode: string;
  classFile?: string;
  previewImage?: string;
  isActive: boolean;
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
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['modern', 'classic', 'creative', 'minimal', 'professional'],
    required: true,
    default: 'professional'
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  version: {
    type: String,
    required: true,
    default: '1.0.0'
  },
  latexCode: {
    type: String,
    required: true
  },
  classFile: {
    type: String,
    required: false
  },
  previewImage: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    sections: [{
      type: String,
      enum: [
        'personal_info',
        'summary',
        'experience',
        'education',
        'skills',
        'projects',
        'certifications',
        'languages',
        'awards',
        'publications',
        'volunteer',
        'interests',
        'references'
      ]
    }],
    colors: [String],
    fonts: [String],
    features: [String]
  },
  usage: {
    totalUses: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
TemplateSchema.index({ category: 1, isActive: 1 });
TemplateSchema.index({ tags: 1 });
TemplateSchema.index({ isPremium: 1 });
TemplateSchema.index({ 'usage.totalUses': -1 });

// Virtual for full template name
TemplateSchema.virtual('fullName').get(function() {
  return `${this.name} v${this.version}`;
});

// Method to increment usage
TemplateSchema.methods.incrementUsage = function() {
  this.usage.totalUses += 1;
  this.usage.lastUsed = new Date();
  return this.save();
};

// Static method to get templates by category
TemplateSchema.statics.findByCategory = function(category: string) {
  return this.find({ category, isActive: true }).sort({ 'usage.totalUses': -1 });
};

// Static method to get popular templates
TemplateSchema.statics.findPopular = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ 'usage.totalUses': -1 })
    .limit(limit);
};

export const Template = mongoose.models.Template || mongoose.model<ITemplate>('Template', TemplateSchema); 
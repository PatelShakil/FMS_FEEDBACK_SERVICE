// src/models/FormTemplate.js
const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  fieldId: { type: String, required: true },
  fieldName: { type: String, required: true },
  fieldLabel: { type: String, required: true },
  fieldType: { 
    type: String, 
    required: true,
    enum: [
      'text', 'textarea', 'email', 'phone', 'number', 
      'date', 'time', 'datetime', 
      'dropdown', 'checkbox', 'radio', 
      'file', 'image', 'video', 'audio', 
      'rating', 'location'
    ]
  },
  required: { type: Boolean, default: false },
  order: { type: Number, required: true },
  placeholder: String,
  helpText: String,
  options: [{
    value: String,
    label: String
  }],
  validation: {
    minLength: Number,
    maxLength: Number,
    min: Number,
    max: Number,
    pattern: String,
    maxSize: String,
    allowedFormats: [String],
    maxDuration: Number
  }
}, { _id: false });

const templateSchema = new mongoose.Schema({
  templateId: { 
    type: String, 
    unique: true, 
    required: true, 
    index: true 
  },
  
  templateName: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 255
  },
  
  category: { 
    type: String, 
    required: true,
    enum: [
      'Infrastructure', 
      'Health', 
      'Education', 
      'Utilities', 
      'Transportation', 
      'Environment',
      'Public Safety',
      'Administration',
      'Other'
    ],
    index: true
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  previewImage: String, // URL in MinIO
  
  fields: {
    type: [fieldSchema],
    validate: {
      validator: function(fields) {
        return fields && fields.length > 0;
      },
      message: 'Template must have at least one field'
    }
  },
  
  settings: {
    allowAnonymous: { type: Boolean, default: true },
    allowMultipleSubmissions: { type: Boolean, default: false },
    requireLocation: { type: Boolean, default: false },
    maxFileSize: { type: Number, default: 5242880 },
    allowedFileTypes: { 
      type: [String], 
      default: ['jpg', 'jpeg', 'png', 'pdf'] 
    }
  },
  
  tags: [String],
  
  usageCount: { 
    type: Number, 
    default: 0,
    index: true
  },
  
  isActive: { 
    type: Boolean, 
    default: true,
    index: true
  },
  
  createdBy: { 
    type: Number, 
    required: true 
  },
  
  updatedBy: Number,
  
  deletedAt: Date
  
}, {
  timestamps: true,
  collection: 'form_templates'
});

// Indexes
templateSchema.index({ category: 1, isActive: 1 });
templateSchema.index({ templateName: 'text', description: 'text' });
templateSchema.index({ createdAt: -1 });
templateSchema.index({ usageCount: -1 });

module.exports = mongoose.model('FormTemplate', templateSchema);

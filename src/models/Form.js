// src/models/Form.js
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
  defaultValue: String,
  
  // For dropdown, checkbox, radio
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
    maxSize: String,           // For files: "5MB"
    allowedFormats: [String],  // ["jpg", "png", "pdf"]
    maxDuration: Number        // For audio/video in seconds
  }
}, { _id: false });

const formSchema = new mongoose.Schema({
  formId: { 
    type: String, 
    unique: true, 
    required: true, 
    index: true 
  },
  
  serviceId: { 
    type: Number, 
    required: true, 
    index: true 
  },
  
  orgId: { 
    type: Number, 
    required: true, 
    index: true 
  },
  
  formName: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 255
  },
  
  formDescription: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  fields: {
    type: [fieldSchema],
    validate: {
      validator: function(fields) {
        return fields && fields.length > 0;
      },
      message: 'Form must have at least one field'
    }
  },
  
  settings: {
    allowAnonymous: { type: Boolean, default: true },
    allowMultipleSubmissions: { type: Boolean, default: false },
    requireLocation: { type: Boolean, default: false },
    enableNotifications: { type: Boolean, default: true },
    maxFileSize: { type: Number, default: 5242880 }, // 5MB in bytes
    allowedFileTypes: { 
      type: [String], 
      default: ['jpg', 'jpeg', 'png', 'pdf', 'mp4', 'mp3'] 
    },
    submitButtonText: { type: String, default: 'Submit' },
    successMessage: { 
      type: String, 
      default: 'Thank you for your feedback!' 
    },
    redirectUrl: String,
    captchaEnabled: { type: Boolean, default: false }
  },
  
  status: { 
    type: String, 
    default: 'DRAFT',
    enum: ['DRAFT', 'FINALIZED', 'ACTIVE', 'INACTIVE', 'ARCHIVED'],
    index: true
  },
  
  version: { 
    type: Number, 
    default: 1 
  },
  
  isTemplate: { 
    type: Boolean, 
    default: false,
    index: true
  },
  
  templateId: { 
    type: String, 
    index: true ,
    required:false
  },
  
  metadata: {
    totalQRCodesGenerated: { type: Number, default: 0 },
    totalResponsesReceived: { type: Number, default: 0 },
    lastResponseAt: Date
  },
  
  createdBy: { 
    type: Number, 
    required: true 
  },
  
  updatedBy: Number,
  
  finalizedBy: Number,
  finalizedAt: Date,
  
  activatedBy: Number,
  activatedAt: Date,
  
  deletedAt: Date,
  deletedBy: Number
  
}, {
  timestamps: true,
  collection: 'forms'
});

// Indexes
formSchema.index({ orgId: 1, status: 1 });
formSchema.index({ serviceId: 1, status: 1 });
formSchema.index({ createdBy: 1 });
formSchema.index({ formName: 'text', formDescription: 'text' });
formSchema.index({ createdAt: -1 });
formSchema.index({ deletedAt: 1 });

// Virtual for checking if form is editable
formSchema.virtual('isEditable').get(function() {
  return this.status === 'DRAFT' && this.metadata.totalResponsesReceived === 0;
});

// Virtual for checking if form is deletable
formSchema.virtual('isDeletable').get(function() {
  return this.metadata.totalResponsesReceived === 0;
});

// Ensure virtuals are included in JSON
formSchema.set('toJSON', { virtuals: true });
formSchema.set('toObject', { virtuals: true });

// Pre-save middleware
formSchema.pre('save', function(next) {
  if (this.isNew) {
    this.createdAt = new Date();
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Form', formSchema);

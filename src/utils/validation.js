// src/utils/validation.js
const Joi = require('joi');

// Field schema for form fields
const fieldSchema = Joi.object({
  fieldId: Joi.string().required(),
  fieldName: Joi.string().required(),
  fieldLabel: Joi.string().required(),
  fieldType: Joi.string().valid(
    'text', 'textarea', 'email', 'phone', 'number',
    'date', 'time', 'datetime',
    'dropdown', 'checkbox', 'radio',
    'file', 'image', 'video', 'audio',
    'rating', 'location'
  ).required(),
  required: Joi.boolean().default(false),
  order: Joi.number().integer().min(1).required(),
  placeholder: Joi.string().allow(''),
  helpText: Joi.string().allow(''),
  defaultValue: Joi.string().allow(''),
  options: Joi.array().items(
    Joi.object({
      value: Joi.string().required(),
      label: Joi.string().required()
    })
  ),
  validation: Joi.object({
    minLength: Joi.number().integer().min(0),
    maxLength: Joi.number().integer().min(0),
    min: Joi.number(),
    max: Joi.number(),
    pattern: Joi.string(),
    maxSize: Joi.string(),
    allowedFormats: Joi.array().items(Joi.string()),
    maxDuration: Joi.number().integer().min(0)
  })
});

// Create form validation
const createFormSchema = Joi.object({
  serviceId: Joi.number().integer().positive().required(),
  orgId: Joi.number().integer().positive().required(),
  formName: Joi.string().min(3).max(255).required(),
  formDescription: Joi.string().max(1000).allow(''),
  fields: Joi.array().items(fieldSchema).min(1).required(),
  settings: Joi.object({
    allowAnonymous: Joi.boolean().default(true),
    allowMultipleSubmissions: Joi.boolean().default(false),
    requireLocation: Joi.boolean().default(false),
    enableNotifications: Joi.boolean().default(true),
    maxFileSize: Joi.number().integer().positive().default(5242880),
    allowedFileTypes: Joi.array().items(Joi.string()),
    submitButtonText: Joi.string().max(50),
    successMessage: Joi.string().max(500),
    redirectUrl: Joi.string().uri().allow(null).default(''),
    captchaEnabled: Joi.boolean().default(false)
  }),
  templateId: Joi.string()
});

// Update form validation
const updateFormSchema = Joi.object({
  formName: Joi.string().min(3).max(255),
  formDescription: Joi.string().max(1000).allow(''),
  fields: Joi.array().items(fieldSchema).min(1),
  settings: Joi.object({
    allowAnonymous: Joi.boolean(),
    allowMultipleSubmissions: Joi.boolean(),
    requireLocation: Joi.boolean(),
    enableNotifications: Joi.boolean(),
    maxFileSize: Joi.number().integer().positive(),
    allowedFileTypes: Joi.array().items(Joi.string()),
    submitButtonText: Joi.string().max(50),
    successMessage: Joi.string().max(500),
    redirectUrl: Joi.string().uri().allow(''),
    captchaEnabled: Joi.boolean()
  })
}).min(1);

// Create template validation
const createTemplateSchema = Joi.object({
  templateName: Joi.string().min(3).max(255).required(),
  category: Joi.string().valid(
    'Infrastructure', 'Health', 'Education', 'Utilities',
    'Transportation', 'Environment', 'Public Safety', 'Administration', 'Other'
  ).required(),
  description: Joi.string().max(1000).allow(''),
  fields: Joi.array().items(fieldSchema).min(1).required(),
  settings: Joi.object({
    allowAnonymous: Joi.boolean().default(true),
    allowMultipleSubmissions: Joi.boolean().default(false),
    requireLocation: Joi.boolean().default(false),
    maxFileSize: Joi.number().integer().positive().default(5242880),
    allowedFileTypes: Joi.array().items(Joi.string())
  }),
  tags: Joi.array().items(Joi.string())
});

// Query validation
const listFormsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('DRAFT', 'FINALIZED', 'ACTIVE', 'INACTIVE', 'ARCHIVED'),
  serviceId: Joi.number().integer().positive(),
  orgId: Joi.number().integer().positive(),
  search: Joi.string().max(255).allow(''),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'formName').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createFormSchema,
  updateFormSchema,
  createTemplateSchema,
  listFormsQuerySchema
};

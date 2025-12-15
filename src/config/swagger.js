// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./env');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Feedback Service API',
    version: '1.0.0',
    description: 'Dynamic Feedback Form Management Service for BoloIndia Platform',
    contact: {
      name: 'BoloIndia Team',
      email: 'support@boloindia.in',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: 'Development server',
    },
    {
      url: 'http://localhost:8088',
      description: 'Local server',
    },
    {
      url: 'https://api.boloindia.in/feedback',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token from auth-service',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'string',
            example: 'Error message',
          },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                },
                message: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Success',
          },
          data: {
            type: 'object',
          },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Success',
          },
          data: {
            type: 'array',
            items: {
              type: 'object',
            },
          },
          pagination: {
            type: 'object',
            properties: {
              page: {
                type: 'integer',
                example: 1,
              },
              pageSize: {
                type: 'integer',
                example: 20,
              },
              totalItems: {
                type: 'integer',
                example: 100,
              },
              totalPages: {
                type: 'integer',
                example: 5,
              },
              hasNextPage: {
                type: 'boolean',
                example: true,
              },
              hasPreviousPage: {
                type: 'boolean',
                example: false,
              },
            },
          },
        },
      },
      Field: {
        type: 'object',
        required: ['fieldId', 'fieldName', 'fieldLabel', 'fieldType', 'order'],
        properties: {
          fieldId: {
            type: 'string',
            example: 'field_1',
          },
          fieldName: {
            type: 'string',
            example: 'description',
          },
          fieldLabel: {
            type: 'string',
            example: 'Describe the issue',
          },
          fieldType: {
            type: 'string',
            enum: [
              'text', 'textarea', 'email', 'phone', 'number',
              'date', 'time', 'datetime',
              'dropdown', 'checkbox', 'radio',
              'file', 'image', 'video', 'audio',
              'rating', 'location'
            ],
            example: 'textarea',
          },
          required: {
            type: 'boolean',
            example: true,
          },
          order: {
            type: 'integer',
            example: 1,
          },
          placeholder: {
            type: 'string',
            example: 'Enter description here...',
          },
          helpText: {
            type: 'string',
            example: 'Please provide detailed information',
          },
          defaultValue: {
            type: 'string',
          },
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                value: {
                  type: 'string',
                },
                label: {
                  type: 'string',
                },
              },
            },
          },
          validation: {
            type: 'object',
            properties: {
              minLength: {
                type: 'integer',
              },
              maxLength: {
                type: 'integer',
              },
              min: {
                type: 'number',
              },
              max: {
                type: 'number',
              },
              pattern: {
                type: 'string',
              },
              maxSize: {
                type: 'string',
                example: '5MB',
              },
              allowedFormats: {
                type: 'array',
                items: {
                  type: 'string',
                },
                example: ['jpg', 'png', 'pdf'],
              },
              maxDuration: {
                type: 'integer',
                example: 300,
              },
            },
          },
        },
      },
      FormSettings: {
        type: 'object',
        properties: {
          allowAnonymous: {
            type: 'boolean',
            example: true,
          },
          allowMultipleSubmissions: {
            type: 'boolean',
            example: false,
          },
          requireLocation: {
            type: 'boolean',
            example: false,
          },
          enableNotifications: {
            type: 'boolean',
            example: true,
          },
          maxFileSize: {
            type: 'integer',
            example: 5242880,
          },
          allowedFileTypes: {
            type: 'array',
            items: {
              type: 'string',
            },
            example: ['jpg', 'jpeg', 'png', 'pdf'],
          },
          submitButtonText: {
            type: 'string',
            example: 'Submit',
          },
          successMessage: {
            type: 'string',
            example: 'Thank you for your feedback!',
          },
          redirectUrl: {
            type: 'string',
            format: 'uri',
          },
          captchaEnabled: {
            type: 'boolean',
            example: false,
          },
        },
      },
      Form: {
        type: 'object',
        properties: {
          formId: {
            type: 'string',
            example: 'FORM_A1B2C3D4',
          },
          serviceId: {
            type: 'integer',
            example: 3,
          },
          orgId: {
            type: 'integer',
            example: 3,
          },
          formName: {
            type: 'string',
            example: 'Road Complaint Form',
          },
          formDescription: {
            type: 'string',
            example: 'Report road issues in your area',
          },
          fields: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Field',
            },
          },
          settings: {
            $ref: '#/components/schemas/FormSettings',
          },
          status: {
            type: 'string',
            enum: ['DRAFT', 'FINALIZED', 'ACTIVE', 'INACTIVE', 'ARCHIVED'],
            example: 'DRAFT',
          },
          version: {
            type: 'integer',
            example: 1,
          },
          isTemplate: {
            type: 'boolean',
            example: false,
          },
          templateId: {
            type: 'string',
          },
          metadata: {
            type: 'object',
            properties: {
              totalQRCodesGenerated: {
                type: 'integer',
                example: 0,
              },
              totalResponsesReceived: {
                type: 'integer',
                example: 0,
              },
              lastResponseAt: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
          createdBy: {
            type: 'integer',
            example: 5,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      CreateFormRequest: {
        type: 'object',
        required: ['serviceId', 'orgId', 'formName', 'fields'],
        properties: {
          serviceId: {
            type: 'integer',
            example: 3,
          },
          orgId: {
            type: 'integer',
            example: 3,
          },
          formName: {
            type: 'string',
            example: 'Road Complaint Form',
          },
          formDescription: {
            type: 'string',
            example: 'Report road issues',
          },
          fields: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Field',
            },
          },
          settings: {
            $ref: '#/components/schemas/FormSettings',
          },
          templateId: {
            type: 'string',
          },
        },
      },
      Template: {
        type: 'object',
        properties: {
          templateId: {
            type: 'string',
            example: 'TEMPLATE_X1Y2Z3',
          },
          templateName: {
            type: 'string',
            example: 'Infrastructure Complaint Template',
          },
          category: {
            type: 'string',
            enum: [
              'Infrastructure', 'Health', 'Education', 'Utilities',
              'Transportation', 'Environment', 'Public Safety',
              'Administration', 'Other'
            ],
            example: 'Infrastructure',
          },
          description: {
            type: 'string',
            example: 'Template for reporting infrastructure issues',
          },
          previewImage: {
            type: 'string',
            format: 'uri',
          },
          fields: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Field',
            },
          },
          settings: {
            $ref: '#/components/schemas/FormSettings',
          },
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
            example: ['road', 'pothole', 'streetlight'],
          },
          usageCount: {
            type: 'integer',
            example: 25,
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
          createdBy: {
            type: 'integer',
            example: 1,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: 'Forms',
      description: 'Form management endpoints',
    },
    {
      name: 'Templates',
      description: 'Template management endpoints',
    },
    {
      name: 'Health',
      description: 'Service health and monitoring',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'], // Path to route files with JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

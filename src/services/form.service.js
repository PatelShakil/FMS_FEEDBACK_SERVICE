// src/services/form.service.js
const { v4: uuidv4 } = require('uuid');
const Form = require('../models/Form');
const FormTemplate = require('../models/FormTemplate');
const kafkaService = require('./kafka.service');
const logger = require('../utils/logger');

class FormService {
  /**
   * Create new form
   */
  async createForm(formData, userId) {
    try {
      const formId = `FORM_${uuidv4().substring(0, 8).toUpperCase()}`;

      const form = new Form({
        formId,
        ...formData,
        createdBy: userId,
        status: 'DRAFT'
      });

      await form.save();
      logger.info(`Form created: ${formId} by user ${userId}`);

      // Publish Kafka event
      await kafkaService.publishFormCreated(form);

      return form;
    } catch (error) {
      logger.error('Error creating form:', error);
      throw error;
    }
  }

  /**
   * Get form by ID
   */
  async getFormById(formId) {
    try {
      const form = await Form.findOne({ formId, deletedAt: null });
      
      if (!form) {
        const error = new Error('Form not found');
        error.statusCode = 404;
        throw error;
      }

      return form;
    } catch (error) {
      logger.error(`Error getting form ${formId}:`, error);
      throw error;
    }
  }

  /**
   * Get form by ID (Public - no auth check)
   */
  async getPublicForm(formId) {
    try {
      const form = await Form.findOne({ 
        formId, 
        status: 'ACTIVE',
        deletedAt: null 
      });
      
      if (!form) {
        const error = new Error('Form not found or not available');
        error.statusCode = 404;
        throw error;
      }

      // Return only necessary fields for public access
      return {
        formId: form.formId,
        formName: form.formName,
        formDescription: form.formDescription,
        fields: form.fields,
        settings: form.settings,
        serviceId: form.serviceId,
        orgId: form.orgId
      };
    } catch (error) {
      logger.error(`Error getting public form ${formId}:`, error);
      throw error;
    }
  }

  /**
   * List forms with filters and pagination
   */
  async listForms(filters, pagination) {
    try {
      const query = { deletedAt: null };

      // Apply filters
      if (filters.status) query.status = filters.status;
      if (filters.serviceId) query.serviceId = filters.serviceId;
      if (filters.orgId) query.orgId = filters.orgId;
      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      // Pagination
      const page = pagination.page || 1;
      const pageSize = pagination.pageSize || 20;
      const skip = (page - 1) * pageSize;

      // Sorting
      const sortBy = pagination.sortBy || 'createdAt';
      const sortOrder = pagination.sortOrder === 'asc' ? 1 : -1;

      const [forms, totalItems] = await Promise.all([
        Form.find(query)
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(pageSize)
          .lean(),
        Form.countDocuments(query)
      ]);

      return {
        forms,
        pagination: {
          page,
          pageSize,
          totalItems
        }
      };
    } catch (error) {
      logger.error('Error listing forms:', error);
      throw error;
    }
  }

  /**
   * Update form
   */
  async updateForm(formId, updateData, userId) {
    try {
      const form = await this.getFormById(formId);

      // Check if form is editable
      if (form.status !== 'DRAFT') {
        const error = new Error('Cannot edit form. Only DRAFT forms can be edited.');
        error.statusCode = 400;
        throw error;
      }

      if (form.metadata.totalResponsesReceived > 0) {
        const error = new Error('Cannot edit form. Form has received responses.');
        error.statusCode = 400;
        throw error;
      }

      // Update fields
      Object.assign(form, updateData);
      form.updatedBy = userId;

      await form.save();
      logger.info(`Form updated: ${formId} by user ${userId}`);

      // Publish Kafka event
      await kafkaService.publishFormUpdated(form);

      return form;
    } catch (error) {
      logger.error(`Error updating form ${formId}:`, error);
      throw error;
    }
  }

  /**
   * Finalize form (lock for editing)
   */
  async finalizeForm(formId, userId) {
    try {
      const form = await this.getFormById(formId);

      if (form.status !== 'DRAFT') {
        const error = new Error('Form is already finalized');
        error.statusCode = 400;
        throw error;
      }

      form.status = 'FINALIZED';
      form.finalizedBy = userId;
      form.finalizedAt = new Date();

      await form.save();
      logger.info(`Form finalized: ${formId} by user ${userId}`);

      // Publish Kafka event
      await kafkaService.publishFormFinalized(form);

      return form;
    } catch (error) {
      logger.error(`Error finalizing form ${formId}:`, error);
      throw error;
    }
  }

  /**
   * Activate form
   */
  async activateForm(formId, userId) {
    try {
      const form = await this.getFormById(formId);

      if (form.status === 'DRAFT') {
        const error = new Error('Cannot activate DRAFT form. Please finalize first.');
        error.statusCode = 400;
        throw error;
      }

      form.status = 'ACTIVE';
      form.activatedBy = userId;
      form.activatedAt = new Date();

      await form.save();
      logger.info(`Form activated: ${formId} by user ${userId}`);

      // Publish Kafka event
      await kafkaService.publishFormActivated(form);

      return form;
    } catch (error) {
      logger.error(`Error activating form ${formId}:`, error);
      throw error;
    }
  }

  /**
   * Deactivate form
   */
  async deactivateForm(formId, userId) {
    try {
      const form = await this.getFormById(formId);

      if (form.status !== 'ACTIVE') {
        const error = new Error('Form is not active');
        error.statusCode = 400;
        throw error;
      }

      form.status = 'INACTIVE';
      form.updatedBy = userId;

      await form.save();
      logger.info(`Form deactivated: ${formId} by user ${userId}`);

      // Publish Kafka event
      await kafkaService.publishFormDeactivated(form);

      return form;
    } catch (error) {
      logger.error(`Error deactivating form ${formId}:`, error);
      throw error;
    }
  }

  /**
   * Delete form (soft delete)
   */
  async deleteForm(formId, userId) {
    try {
      const form = await this.getFormById(formId);

      if (form.metadata.totalResponsesReceived > 0) {
        const error = new Error('Cannot delete form with responses. Please archive instead.');
        error.statusCode = 400;
        throw error;
      }

      form.deletedAt = new Date();
      form.deletedBy = userId;

      await form.save();
      logger.info(`Form deleted: ${formId} by user ${userId}`);

      // Publish Kafka event
      await kafkaService.publishFormDeleted(form);

      return { message: 'Form deleted successfully' };
    } catch (error) {
      logger.error(`Error deleting form ${formId}:`, error);
      throw error;
    }
  }

  /**
   * Clone template to create form
   */
  async cloneTemplate(templateId, formData, userId) {
    try {
      const template = await FormTemplate.findOne({ templateId, isActive: true });

      if (!template) {
        const error = new Error('Template not found');
        error.statusCode = 404;
        throw error;
      }

      const formId = `FORM_${uuidv4().substring(0, 8).toUpperCase()}`;

      const form = new Form({
        formId,
        formName: formData.formName || template.templateName,
        formDescription: formData.formDescription || template.description,
        serviceId: formData.serviceId,
        orgId: formData.orgId,
        fields: template.fields,
        settings: { ...template.settings, ...formData.settings },
        templateId: template.templateId,
        createdBy: userId,
        status: 'DRAFT'
      });

      await form.save();

      // Increment template usage count
      template.usageCount += 1;
      await template.save();

      logger.info(`Template ${templateId} cloned to form ${formId} by user ${userId}`);

      // Publish Kafka events
      await kafkaService.publishFormCreated(form);
      await kafkaService.publishTemplateCloned(template, form);

      return form;
    } catch (error) {
      logger.error(`Error cloning template ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Increment response count
   */
  async incrementResponseCount(formId) {
    try {
      await Form.findOneAndUpdate(
        { formId },
        {
          $inc: { 'metadata.totalResponsesReceived': 1 },
          $set: { 'metadata.lastResponseAt': new Date() }
        }
      );
      logger.debug(`Incremented response count for form ${formId}`);
    } catch (error) {
      logger.error(`Error incrementing response count for ${formId}:`, error);
    }
  }
}

module.exports = new FormService();

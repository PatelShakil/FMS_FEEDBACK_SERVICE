// src/services/template.service.js
const { v4: uuidv4 } = require('uuid');
const FormTemplate = require('../models/FormTemplate');
const kafkaService = require('./kafka.service');
const logger = require('../utils/logger');

class TemplateService {
  /**
   * Create new template (Platform Admin only)
   */
  async createTemplate(templateData, userId) {
    try {
      const templateId = `TEMPLATE_${uuidv4().substring(0, 8).toUpperCase()}`;

      const template = new FormTemplate({
        templateId,
        ...templateData,
        createdBy: userId
      });

      await template.save();
      logger.info(`Template created: ${templateId} by user ${userId}`);

      // Publish Kafka event
      await kafkaService.publishTemplateCreated(template);

      return template;
    } catch (error) {
      logger.error('Error creating template:', error);
      throw error;
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(templateId) {
    try {
      const template = await FormTemplate.findOne({ 
        templateId, 
        deletedAt: null 
      });
      
      if (!template) {
        const error = new Error('Template not found');
        error.statusCode = 404;
        throw error;
      }

      return template;
    } catch (error) {
      logger.error(`Error getting template ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * List all templates
   */
  async listTemplates(filters, pagination) {
    try {
      const query = { deletedAt: null };

      // Apply filters
      if (filters.category) query.category = filters.category;
      if (filters.isActive !== undefined) query.isActive = filters.isActive;
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

      const [templates, totalItems] = await Promise.all([
        FormTemplate.find(query)
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(pageSize)
          .lean(),
        FormTemplate.countDocuments(query)
      ]);

      return {
        templates,
        pagination: {
          page,
          pageSize,
          totalItems
        }
      };
    } catch (error) {
      logger.error('Error listing templates:', error);
      throw error;
    }
  }

  /**
   * Update template
   */
  async updateTemplate(templateId, updateData, userId) {
    try {
      const template = await this.getTemplateById(templateId);

      Object.assign(template, updateData);
      template.updatedBy = userId;

      await template.save();
      logger.info(`Template updated: ${templateId} by user ${userId}`);

      return template;
    } catch (error) {
      logger.error(`Error updating template ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Delete template (soft delete)
   */
  async deleteTemplate(templateId, userId) {
    try {
      const template = await this.getTemplateById(templateId);

      template.deletedAt = new Date();
      template.updatedBy = userId;

      await template.save();
      logger.info(`Template deleted: ${templateId} by user ${userId}`);

      return { message: 'Template deleted successfully' };
    } catch (error) {
      logger.error(`Error deleting template ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category) {
    try {
      const templates = await FormTemplate.find({
        category,
        isActive: true,
        deletedAt: null
      }).sort({ usageCount: -1 });

      return templates;
    } catch (error) {
      logger.error(`Error getting templates by category ${category}:`, error);
      throw error;
    }
  }

  /**
   * Get popular templates
   */
  async getPopularTemplates(limit = 10) {
    try {
      const templates = await FormTemplate.find({
        isActive: true,
        deletedAt: null
      })
        .sort({ usageCount: -1 })
        .limit(limit);

      return templates;
    } catch (error) {
      logger.error('Error getting popular templates:', error);
      throw error;
    }
  }
}

module.exports = new TemplateService();

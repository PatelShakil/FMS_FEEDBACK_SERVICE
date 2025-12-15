// src/controllers/template.controller.js
const templateService = require('../services/template.service');
const responseUtil = require('../utils/response');
const logger = require('../utils/logger');

class TemplateController {
  /**
   * Create new template (Platform Admin only)
   */
  async createTemplate(req, res, next) {
    try {
      logger.info(`Creating template: ${req.body.templateName} by user ${req.user.userId}`);
      
      const template = await templateService.createTemplate(req.body, req.user.userId);
      
      return responseUtil.created(res, template, 'Template created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(req, res, next) {
    try {
      const { templateId } = req.params;
      
      const template = await templateService.getTemplateById(templateId);
      
      return responseUtil.success(res, template);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all templates
   */
  async listTemplates(req, res, next) {
    try {
      const filters = {
        category: req.query.category,
        isActive: req.query.isActive === 'true',
        search: req.query.search
      };

      const pagination = {
        page: parseInt(req.query.page, 10) || 1,
        pageSize: parseInt(req.query.pageSize, 10) || 20,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc'
      };

      const result = await templateService.listTemplates(filters, pagination);
      
      return responseUtil.paginated(res, result.templates, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update template
   */
  async updateTemplate(req, res, next) {
    try {
      const { templateId } = req.params;
      
      logger.info(`Updating template: ${templateId} by user ${req.user.userId}`);
      
      const template = await templateService.updateTemplate(templateId, req.body, req.user.userId);
      
      return responseUtil.success(res, template, 'Template updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(req, res, next) {
    try {
      const { templateId } = req.params;
      
      logger.info(`Deleting template: ${templateId} by user ${req.user.userId}`);
      
      const result = await templateService.deleteTemplate(templateId, req.user.userId);
      
      return responseUtil.success(res, result, 'Template deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(req, res, next) {
    try {
      const { category } = req.params;
      
      const templates = await templateService.getTemplatesByCategory(category);
      
      return responseUtil.success(res, templates);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get popular templates
   */
  async getPopularTemplates(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      
      const templates = await templateService.getPopularTemplates(limit);
      
      return responseUtil.success(res, templates);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TemplateController();

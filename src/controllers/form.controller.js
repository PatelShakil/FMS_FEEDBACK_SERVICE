// src/controllers/form.controller.js
const formService = require('../services/form.service');
const responseUtil = require('../utils/response');
const logger = require('../utils/logger');

class FormController {
  /**
   * Create new form
   */
  async createForm(req, res, next) {
    try {
      logger.info(`Creating form: ${req.body.formName} by user ${req.user.userId}`);
      
      const form = await formService.createForm(req.body, req.user.userId);
      
      return responseUtil.created(res, form, 'Form created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get form by ID
   */
  async getFormById(req, res, next) {
    try {
      const { formId } = req.params;
      
      const form = await formService.getFormById(formId);
      
      return responseUtil.success(res, form);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get public form (no authentication)
   */
  async getPublicForm(req, res, next) {
    try {
      const { formId } = req.params;
      
      const form = await formService.getPublicForm(formId);
      
      return responseUtil.success(res, form);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List forms
   */
  async listForms(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        serviceId: req.query.serviceId,
        orgId: req.query.orgId,
        search: req.query.search
      };

      const pagination = {
        page: parseInt(req.query.page, 10) || 1,
        pageSize: parseInt(req.query.pageSize, 10) || 20,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc'
      };

      const result = await formService.listForms(filters, pagination);
      
      return responseUtil.paginated(res, result.forms, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update form
   */
  async updateForm(req, res, next) {
    try {
      const { formId } = req.params;
      
      logger.info(`Updating form: ${formId} by user ${req.user.userId}`);
      
      const form = await formService.updateForm(formId, req.body, req.user.userId);
      
      return responseUtil.success(res, form, 'Form updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Finalize form
   */
  async finalizeForm(req, res, next) {
    try {
      const { formId } = req.params;
      
      logger.info(`Finalizing form: ${formId} by user ${req.user.userId}`);
      
      const form = await formService.finalizeForm(formId, req.user.userId);
      
      return responseUtil.success(res, form, 'Form finalized successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Activate form
   */
  async activateForm(req, res, next) {
    try {
      const { formId } = req.params;
      
      logger.info(`Activating form: ${formId} by user ${req.user.userId}`);
      
      const form = await formService.activateForm(formId, req.user.userId);
      
      return responseUtil.success(res, form, 'Form activated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deactivate form
   */
  async deactivateForm(req, res, next) {
    try {
      const { formId } = req.params;
      
      logger.info(`Deactivating form: ${formId} by user ${req.user.userId}`);
      
      const form = await formService.deactivateForm(formId, req.user.userId);
      
      return responseUtil.success(res, form, 'Form deactivated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete form
   */
  async deleteForm(req, res, next) {
    try {
      const { formId } = req.params;
      
      logger.info(`Deleting form: ${formId} by user ${req.user.userId}`);
      
      const result = await formService.deleteForm(formId, req.user.userId);
      
      return responseUtil.success(res, result, 'Form deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clone template to form
   */
  async cloneTemplate(req, res, next) {
    try {
      const { templateId } = req.params;
      
      logger.info(`Cloning template ${templateId} by user ${req.user.userId}`);
      
      const form = await formService.cloneTemplate(templateId, req.body, req.user.userId);
      
      return responseUtil.created(res, form, 'Form created from template successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FormController();

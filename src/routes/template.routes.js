// src/routes/template.routes.js
const express = require('express');
const router = express.Router();
const templateController = require('../controllers/template.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { requirePlatformAdmin } = require('../middlewares/role.middleware');
const { validate, validateQuery } = require('../middlewares/validate.middleware');
const { 
  createTemplateSchema, 
  listFormsQuerySchema 
} = require('../utils/validation');

/**
 * @swagger
 * /api/templates/popular:
 *   get:
 *     summary: Get popular templates (most used)
 *     tags: [Templates]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of templates to return
 *     responses:
 *       200:
 *         description: Popular templates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Template'
 */
router.get(
  '/popular',
  templateController.getPopularTemplates
);

/**
 * @swagger
 * /api/templates/category/{category}:
 *   get:
 *     summary: Get templates by category
 *     tags: [Templates]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Infrastructure, Health, Education, Utilities, Transportation, Environment, Public Safety, Administration, Other]
 *         description: Template category
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Template'
 */
router.get(
  '/category/:category',
  templateController.getTemplatesByCategory
);

// All routes below require authentication
router.use(authenticateJWT);

/**
 * @swagger
 * /api/templates:
 *   get:
 *     summary: List all templates with filters and pagination
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Infrastructure, Health, Education, Utilities, Transportation, Environment, Public Safety, Administration, Other]
 *         description: Filter by category
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in template name and description
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, templateName, usageCount]
 *           default: createdAt
 *         description: Sort by field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  // validateQuery(listFormsQuerySchema),
  templateController.listTemplates
);

/**
 * @swagger
 * /api/templates/{templateId}:
 *   get:
 *     summary: Get template by ID
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Template'
 *       404:
 *         description: Template not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/:templateId',
  templateController.getTemplateById
);

/**
 * @swagger
 * /api/templates:
 *   post:
 *     summary: Create a new template (Platform Admin only)
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [templateName, category, fields]
 *             properties:
 *               templateName:
 *                 type: string
 *                 example: Infrastructure Complaint Template
 *               category:
 *                 type: string
 *                 enum: [Infrastructure, Health, Education, Utilities, Transportation, Environment, Public Safety, Administration, Other]
 *                 example: Infrastructure
 *               description:
 *                 type: string
 *                 example: Template for reporting infrastructure issues
 *               fields:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Field'
 *               settings:
 *                 $ref: '#/components/schemas/FormSettings'
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [road, pothole, streetlight]
 *     responses:
 *       201:
 *         description: Template created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Template'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions (Platform Admin required)
 */
router.post(
  '/',
  requirePlatformAdmin,
  validate(createTemplateSchema),
  templateController.createTemplate
);

/**
 * @swagger
 * /api/templates/{templateId}:
 *   put:
 *     summary: Update template (Platform Admin only)
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateName:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [Infrastructure, Health, Education, Utilities, Transportation, Environment, Public Safety, Administration, Other]
 *               description:
 *                 type: string
 *               fields:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Field'
 *               settings:
 *                 $ref: '#/components/schemas/FormSettings'
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Template updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Template'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Template not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions (Platform Admin required)
 */
router.put(
  '/:templateId',
  requirePlatformAdmin,
  validate(createTemplateSchema),
  templateController.updateTemplate
);

/**
 * @swagger
 * /api/templates/{templateId}:
 *   delete:
 *     summary: Delete template (soft delete, Platform Admin only)
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Template not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions (Platform Admin required)
 */
router.delete(
  '/:templateId',
  requirePlatformAdmin,
  templateController.deleteTemplate
);

module.exports = router;

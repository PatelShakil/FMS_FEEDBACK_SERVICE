// src/routes/form.routes.js
const express = require('express');
const router = express.Router();
const formController = require('../controllers/form.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { requireOrgAdmin } = require('../middlewares/role.middleware');
const { validate, validateQuery } = require('../middlewares/validate.middleware');
const { 
  createFormSchema, 
  updateFormSchema, 
  listFormsQuerySchema 
} = require('../utils/validation');

/**
 * @swagger
 * /api/forms/{formId}/public:
 *   get:
 *     summary: Get form for public access (no authentication)
 *     tags: [Forms]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         schema:
 *           type: string
 *         description: Form ID
 *     responses:
 *       200:
 *         description: Form retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Form not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:formId/public',
  formController.getPublicForm
);

// All routes below require authentication
router.use(authenticateJWT);
router.use(requireOrgAdmin);

/**
 * @swagger
 * /api/forms:
 *   post:
 *     summary: Create a new form
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFormRequest'
 *     responses:
 *       201:
 *         description: Form created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Form'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post(
  '/',
  validate(createFormSchema),
  formController.createForm
);

/**
 * @swagger
 * /api/forms:
 *   get:
 *     summary: List all forms with filters and pagination
 *     tags: [Forms]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, FINALIZED, ACTIVE, INACTIVE, ARCHIVED]
 *         description: Filter by status
 *       - in: query
 *         name: serviceId
 *         schema:
 *           type: integer
 *         description: Filter by service ID
 *       - in: query
 *         name: orgId
 *         schema:
 *           type: integer
 *         description: Filter by organization ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in form name and description
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, formName]
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
 *         description: Forms retrieved successfully
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
  formController.listForms
);

/**
 * @swagger
 * /api/forms/{formId}:
 *   get:
 *     summary: Get form by ID
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         schema:
 *           type: string
 *         description: Form ID
 *     responses:
 *       200:
 *         description: Form retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Form'
 *       404:
 *         description: Form not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/:formId',
  formController.getFormById
);

/**
 * @swagger
 * /api/forms/{formId}:
 *   put:
 *     summary: Update form (only DRAFT forms without responses)
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         schema:
 *           type: string
 *         description: Form ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFormRequest'
 *     responses:
 *       200:
 *         description: Form updated successfully
 *       400:
 *         description: Cannot edit form
 *       404:
 *         description: Form not found
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/:formId',
  validate(updateFormSchema),
  formController.updateForm
);

/**
 * @swagger
 * /api/forms/{formId}/finalize:
 *   post:
 *     summary: Finalize form (lock for editing)
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         schema:
 *           type: string
 *         description: Form ID
 *     responses:
 *       200:
 *         description: Form finalized successfully
 *       400:
 *         description: Form already finalized
 *       404:
 *         description: Form not found
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/:formId/finalize',
  formController.finalizeForm
);

/**
 * @swagger
 * /api/forms/{formId}/activate:
 *   put:
 *     summary: Activate form (make it available for responses)
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         schema:
 *           type: string
 *         description: Form ID
 *     responses:
 *       200:
 *         description: Form activated successfully
 *       400:
 *         description: Cannot activate DRAFT form
 *       404:
 *         description: Form not found
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/:formId/activate',
  formController.activateForm
);

/**
 * @swagger
 * /api/forms/{formId}/deactivate:
 *   put:
 *     summary: Deactivate form (stop accepting responses)
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         schema:
 *           type: string
 *         description: Form ID
 *     responses:
 *       200:
 *         description: Form deactivated successfully
 *       400:
 *         description: Form is not active
 *       404:
 *         description: Form not found
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/:formId/deactivate',
  formController.deactivateForm
);

/**
 * @swagger
 * /api/forms/{formId}:
 *   delete:
 *     summary: Delete form (soft delete, only if no responses)
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         schema:
 *           type: string
 *         description: Form ID
 *     responses:
 *       200:
 *         description: Form deleted successfully
 *       400:
 *         description: Cannot delete form with responses
 *       404:
 *         description: Form not found
 *       401:
 *         description: Unauthorized
 */
router.delete(
  '/:formId',
  formController.deleteForm
);

/**
 * @swagger
 * /api/forms/clone/{templateId}:
 *   post:
 *     summary: Clone template to create a new form
 *     tags: [Forms]
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
 *             required: [serviceId, orgId]
 *             properties:
 *               serviceId:
 *                 type: integer
 *               orgId:
 *                 type: integer
 *               formName:
 *                 type: string
 *               formDescription:
 *                 type: string
 *               settings:
 *                 $ref: '#/components/schemas/FormSettings'
 *     responses:
 *       201:
 *         description: Form created from template successfully
 *       404:
 *         description: Template not found
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/clone/:templateId',
  validate(createFormSchema),
  formController.cloneTemplate
);

module.exports = router;

// src/middlewares/validate.middleware.js
const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * Validate request using Joi schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      logger.warn('Validation failed:', errors);
      
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }
    
    req.body = value;
    next();
  };
};

/**
 * Validate query parameters
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      logger.warn('Query validation failed:', errors);
      
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: errors
      });
    }
    
    req.query = value;
    next();
  };
};

module.exports = {
  validate,
  validateQuery
};

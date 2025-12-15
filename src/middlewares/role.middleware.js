// src/middlewares/role.middleware.js
const logger = require('../utils/logger');

/**
 * Check if user has required role
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }
    
    const userRoles = req.user.roles || [];
    const hasRole = allowedRoles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      logger.warn(`Access denied for user ${req.user.email}. Required roles: ${allowedRoles.join(', ')}`);
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `Required role: ${allowedRoles.join(' or ')}`,
        userRoles
      });
    }
    
    logger.debug(`User ${req.user.email} has required role: ${allowedRoles.join(' or ')}`);
    next();
  };
};

/**
 * Check if user is Platform Admin
 */
const requirePlatformAdmin = (req, res, next) => {
  return requireRole('PLATFORM_ADMIN')(req, res, next);
};

/**
 * Check if user is Org Owner or Admin
 */
const requireOrgAdmin = (req, res, next) => {
  return requireRole('PLATFORM_ADMIN', 'ORG_OWNER', 'ORG_ADMIN')(req, res, next);
};

/**
 * Check if user belongs to the requested organization
 */
const requireOrgAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required' 
    });
  }
  
  // Platform admins have access to all orgs
  if (req.user.roles.includes('PLATFORM_ADMIN')) {
    return next();
  }
  
  // Get orgId from params, body, or query
  const requestedOrgId = parseInt(req.params.orgId || req.body.orgId || req.query.orgId, 10);
  
  if (!requestedOrgId) {
    return res.status(400).json({ 
      error: 'Organization ID required' 
    });
  }
  
  if (req.user.orgId !== requestedOrgId) {
    logger.warn(`User ${req.user.email} tried to access org ${requestedOrgId} but belongs to org ${req.user.orgId}`);
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'You can only access resources for your organization' 
    });
  }
  
  next();
};

module.exports = {
  requireRole,
  requirePlatformAdmin,
  requireOrgAdmin,
  requireOrgAccess
};

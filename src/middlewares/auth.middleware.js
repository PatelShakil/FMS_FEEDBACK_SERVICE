// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const fs = require('fs');
const config = require('../config/env');
const logger = require('../utils/logger');

// Load public key
let publicKey;
try {
  publicKey = fs.readFileSync(config.jwt.publicKeyPath, 'utf8');
  logger.info('✅ JWT public key loaded');
} catch (error) {
  logger.error('Failed to load JWT public key:', error);
  throw new Error('JWT public key not found. Ensure publicKey.pem exists in /keys directory');
}

/**
 * Authenticate JWT Token (Required)
 */
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Missing or invalid Authorization header');
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Missing or invalid Authorization header' 
    });
  }
  
  const token = authHeader.substring(7);
  
  jwt.verify(token, publicKey, { algorithms: [config.jwt.algorithm] }, (err, decoded) => {
    if (err) {
      logger.warn('JWT verification failed:', err.message);
      return res.status(403).json({ 
        error: 'Invalid or expired token',
        message: err.message 
      });
    }
    
    // Attach user info to request
    req.user = {
      userId: parseInt(decoded.sub, 10),
      email: decoded.email,
      name: decoded.name,
      orgId: decoded.orgId,
      roles: decoded.roles || decoded.groups || []
    };
    
    logger.debug('User authenticated:', {
      userId: req.user.userId,
      email: req.user.email,
      orgId: req.user.orgId
    });
    
    next();
  });
};

/**
 * Optional Authentication (for public endpoints)
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null; // Anonymous user
    return next();
  }
  
  const token = authHeader.substring(7);
  
  jwt.verify(token, publicKey, { algorithms: [config.jwt.algorithm] }, (err, decoded) => {
    if (err) {
      req.user = null; // Invalid token, treat as anonymous
      logger.debug('Invalid token for optional auth, treating as anonymous');
    } else {
      req.user = {
        userId: parseInt(decoded.sub, 10),
        email: decoded.email,
        name: decoded.name,
        orgId: decoded.orgId,
        roles: decoded.roles || decoded.groups || []
      };
      logger.debug('User optionally authenticated:', req.user.email);
    }
    next();
  });
};

module.exports = {
  authenticateJWT,
  optionalAuth
};

// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
require('express-async-errors');

const config = require('./config/env');
const logger = require('./utils/logger');
const swaggerSpec = require('./config/swagger');

// Middlewares
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');

// Routes
const formRoutes = require('./routes/form.routes');
const templateRoutes = require('./routes/template.routes');
const healthRoutes = require('./routes/health.routes');

// Create Express app
const app = express();

// ============================================
// Security & Performance Middlewares
// ============================================

// Helmet - Security headers (configure for Swagger)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "validator.swagger.io"],
    },
  },
}));

// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: true
}));

// Compression
app.use(compression());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Too many requests',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// ============================================
// Swagger Documentation
// ============================================

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Feedback Service API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

// ============================================
// Routes
// ============================================

// Health check
app.use('/health', healthRoutes);

// API Routes
app.use('/api/forms', formRoutes);
app.use('/api/templates', templateRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: config.serviceName,
    version: require('../package.json').version,
    status: 'running',
    timestamp: new Date().toISOString(),
    documentation: `http://localhost:${config.port}/api-docs`,
    endpoints: {
      health: '/health',
      forms: '/api/forms',
      templates: '/api/templates',
      docs: '/api-docs',
      openapi: '/api-docs.json'
    }
  });
});

// ============================================
// Error Handlers
// ============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;

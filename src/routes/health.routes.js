// src/routes/health.routes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { getConnectionStatus } = require('../config/database');
const config = require('../config/env');

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Service health check
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 service:
 *                   type: string
 *                   example: feedback-service
 *                 status:
 *                   type: string
 *                   example: UP
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   example: 3600.5
 *                   description: Uptime in seconds
 *                 environment:
 *                   type: string
 *                   example: development
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 dependencies:
 *                   type: object
 *                   properties:
 *                     mongodb:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: UP
 *                         readyState:
 *                           type: string
 *                           example: connected
 *                     kafka:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: ENABLED
 *                     minio:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: UP
 *                 memory:
 *                   type: object
 *                   properties:
 *                     used:
 *                       type: integer
 *                       example: 150
 *                     total:
 *                       type: integer
 *                       example: 512
 *                     unit:
 *                       type: string
 *                       example: MB
 *       503:
 *         description: Service is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 service:
 *                   type: string
 *                   example: feedback-service
 *                 status:
 *                   type: string
 *                   example: DOWN
 *                 error:
 *                   type: string
 *                   example: Database connection failed
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', async (req, res) => {
  try {
    const dbStatus = getConnectionStatus();
    
    const health = {
      service: config.serviceName,
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
      version: require('../../package.json').version,
      dependencies: {
        mongodb: {
          status: dbStatus.isConnected ? 'UP' : 'DOWN',
          readyState: dbStatus.readyStateText
        },
        kafka: {
          status: config.kafka.enabled ? 'ENABLED' : 'DISABLED'
        },
        minio: {
          status: 'UP'
        }
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      }
    };

    const statusCode = dbStatus.isConnected ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      service: config.serviceName,
      status: 'DOWN',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe (for Kubernetes)
 *     description: Returns 200 if service is ready to accept traffic
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is ready
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: READY
 *       503:
 *         description: Service is not ready
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: NOT_READY
 */
router.get('/ready', async (req, res) => {
  const dbStatus = getConnectionStatus();
  
  if (dbStatus.isConnected) {
    res.status(200).json({ status: 'READY' });
  } else {
    res.status(503).json({ status: 'NOT_READY' });
  }
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe (for Kubernetes)
 *     description: Returns 200 if service process is alive
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ALIVE
 */
router.get('/live', (req, res) => {
  res.status(200).json({ status: 'ALIVE' });
});

module.exports = router;

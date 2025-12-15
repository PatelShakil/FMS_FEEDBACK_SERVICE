// src/server.js
const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');

// Database
const { connectDatabase } = require('./config/database');

// Kafka
const { initProducer, initConsumer, startConsumer } = require('./config/kafka');

// MinIO
const { initMinioClient, initBuckets } = require('./config/minio');

/**
 * Initialize all services
 */
async function initializeServices() {
  try {
    logger.info('========================================');
    logger.info(`Starting ${config.serviceName}...`);
    logger.info('========================================');
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`Port: ${config.port}`);
    logger.info('========================================');

    // Connect to MongoDB
    await connectDatabase();

    // Initialize MinIO
    initMinioClient();
    await initBuckets();

    // Initialize Kafka
    if (config.kafka.enabled) {
      await initProducer();
      await initConsumer();
      
      // ✅ USE THE KAFKA SERVICE HANDLER INSTEAD
      const kafkaService = require('./services/kafka.service');
      await kafkaService.startConsumer();
    }

    logger.info('✅ All services initialized successfully');
    logger.info('========================================');
  } catch (error) {
    logger.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
}


/**
 * Start HTTP server
 */
async function startServer() {
  try {
    await initializeServices();

    const server = app.listen(config.port, () => {
      logger.info(`🚀 ${config.serviceName} is running!`);
      logger.info(`📍 http://localhost:${config.port}`);
      logger.info(`🏥 Health check: http://localhost:${config.port}/health`);
      logger.info('========================================');
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        // Close database connection
        const { disconnectDatabase } = require('./config/database');
        await disconnectDatabase();
        
        // Close Kafka connections
        const { disconnectKafka } = require('./config/kafka');
        await disconnectKafka();
        
        logger.info('✅ Graceful shutdown completed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('⚠️ Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

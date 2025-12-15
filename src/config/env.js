// src/config/env.js
require('dotenv').config();

const config = {
  // Service
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 8088,
  serviceName: process.env.SERVICE_NAME || 'feedback-service',

  // MongoDB
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://boloindia:boloindiapass@localhost:27017/feedback_db?authSource=admin',
    dbName: process.env.MONGODB_DB_NAME || 'feedback_db',
    poolSize: parseInt(process.env.MONGODB_POOL_SIZE, 10) || 10,
  },

  // JWT
  jwt: {
    publicKeyPath: process.env.JWT_PUBLIC_KEY_PATH || './keys/publicKey.pem',
    algorithm: process.env.JWT_ALGORITHM || 'RS256',
  },

  // Kafka
  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    clientId: process.env.KAFKA_CLIENT_ID || 'feedback-service',
    groupId: process.env.KAFKA_GROUP_ID || 'feedback-service-group',
    enabled: process.env.KAFKA_ENABLE === 'true',
  },

  // MinIO
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT, 10) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'boloindia',
    secretKey: process.env.MINIO_SECRET_KEY || 'boloindiapass123',
    buckets: {
      forms: process.env.MINIO_BUCKET_FORMS || 'feedback-forms',
      templates: process.env.MINIO_BUCKET_TEMPLATES || 'form-templates',
    },
  },

  // Logging
  log: {
    level: process.env.LOG_LEVEL || 'debug',
    filePath: process.env.LOG_FILE_PATH || './logs',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  // Pagination
  pagination: {
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE, 10) || 20,
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE, 10) || 100,
  },
};

module.exports = config;

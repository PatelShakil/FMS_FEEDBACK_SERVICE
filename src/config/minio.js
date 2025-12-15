// src/config/minio.js
const Minio = require('minio');
const config = require('./env');
const logger = require('../utils/logger');

let minioClient = null;

// Initialize MinIO Client
const initMinioClient = () => {
  try {
    logger.info('Initializing MinIO client...');

    minioClient = new Minio.Client({
      endPoint: config.minio.endpoint,
      port: config.minio.port,
      useSSL: config.minio.useSSL,
      accessKey: config.minio.accessKey,
      secretKey: config.minio.secretKey,
    });

    logger.info('✅ MinIO client initialized');
    logger.info(`MinIO endpoint: ${config.minio.endpoint}:${config.minio.port}`);

    return minioClient;
  } catch (error) {
    logger.error('Failed to initialize MinIO client:', error);
    throw error;
  }
};

// Ensure bucket exists
const ensureBucket = async (bucketName) => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      logger.info(`✅ Created MinIO bucket: ${bucketName}`);
    } else {
      logger.debug(`MinIO bucket already exists: ${bucketName}`);
    }
  } catch (error) {
    logger.error(`Failed to ensure bucket ${bucketName}:`, error);
    throw error;
  }
};

// Initialize all buckets
const initBuckets = async () => {
  try {
    await ensureBucket(config.minio.buckets.forms);
    await ensureBucket(config.minio.buckets.templates);
    logger.info('✅ All MinIO buckets initialized');
  } catch (error) {
    logger.error('Failed to initialize MinIO buckets:', error);
    throw error;
  }
};

// Upload file to MinIO
const uploadFile = async (bucketName, objectName, fileBuffer, metadata = {}) => {
  try {
    await minioClient.putObject(bucketName, objectName, fileBuffer, fileBuffer.length, metadata);
    
    const url = `${config.minio.useSSL ? 'https' : 'http'}://${config.minio.endpoint}:${config.minio.port}/${bucketName}/${objectName}`;
    
    logger.debug(`Uploaded file to MinIO: ${url}`);
    return url;
  } catch (error) {
    logger.error('Failed to upload file to MinIO:', error);
    throw error;
  }
};

// Get file from MinIO
const getFile = async (bucketName, objectName) => {
  try {
    const dataStream = await minioClient.getObject(bucketName, objectName);
    return dataStream;
  } catch (error) {
    logger.error('Failed to get file from MinIO:', error);
    throw error;
  }
};

// Delete file from MinIO
const deleteFile = async (bucketName, objectName) => {
  try {
    await minioClient.removeObject(bucketName, objectName);
    logger.debug(`Deleted file from MinIO: ${bucketName}/${objectName}`);
  } catch (error) {
    logger.error('Failed to delete file from MinIO:', error);
    throw error;
  }
};

// Get presigned URL (for temporary download links)
const getPresignedUrl = async (bucketName, objectName, expirySeconds = 3600) => {
  try {
    const url = await minioClient.presignedGetObject(bucketName, objectName, expirySeconds);
    return url;
  } catch (error) {
    logger.error('Failed to generate presigned URL:', error);
    throw error;
  }
};

module.exports = {
  initMinioClient,
  initBuckets,
  uploadFile,
  getFile,
  deleteFile,
  getPresignedUrl,
  getClient: () => minioClient,
};

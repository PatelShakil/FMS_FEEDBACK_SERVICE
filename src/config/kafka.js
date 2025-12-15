// src/config/kafka.js
const { Kafka, logLevel } = require('kafkajs');
const config = require('./env');
const logger = require('../utils/logger');

let kafkaProducer = null;
let kafkaConsumer = null;

// Kafka Topics
const TOPICS = {
  FORM_CREATED: 'feedback.form.created',
  FORM_UPDATED: 'feedback.form.updated',
  FORM_FINALIZED: 'feedback.form.finalized',
  FORM_ACTIVATED: 'feedback.form.activated',
  FORM_DEACTIVATED: 'feedback.form.deactivated',
  FORM_DELETED: 'feedback.form.deleted',
  TEMPLATE_CREATED: 'feedback.template.created',
  TEMPLATE_CLONED: 'feedback.template.cloned',

  RESPONSE_SUBMITTED: 'response.submitted',
  
  // Consumer topics (from other services)
  ORG_APPROVED: 'org.approved',
  SERVICE_CREATED: 'service.created',
  QR_GENERATED: 'qr.generated',
};

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers,
  logLevel: logLevel.INFO,
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
});

// Initialize Kafka Producer
const initProducer = async () => {
  if (!config.kafka.enabled) {
    logger.warn('Kafka is disabled in configuration');
    return null;
  }

  try {
    logger.info('Initializing Kafka producer...');
    kafkaProducer = kafka.producer();
    
    await kafkaProducer.connect();
    logger.info('✅ Kafka producer connected');
    
    return kafkaProducer;
  } catch (error) {
    logger.error('Failed to connect Kafka producer:', error);
    throw error;
  }
};

// Initialize Kafka Consumer
const initConsumer = async () => {
  if (!config.kafka.enabled) {
    logger.warn('Kafka is disabled in configuration');
    return null;
  }

  try {
    logger.info('Initializing Kafka consumer...');
    kafkaConsumer = kafka.consumer({ groupId: config.kafka.groupId });
    
    await kafkaConsumer.connect();
    logger.info('✅ Kafka consumer connected');
    
    // Subscribe to topics
    await kafkaConsumer.subscribe({
      topics: [TOPICS.ORG_APPROVED, TOPICS.SERVICE_CREATED, TOPICS.QR_GENERATED, TOPICS.RESPONSE_SUBMITTED],
      fromBeginning: false,
    });

    logger.info('Subscribed to Kafka topics:', [TOPICS.ORG_APPROVED, TOPICS.SERVICE_CREATED, TOPICS.QR_GENERATED, TOPICS.RESPONSE_SUBMITTED]);
    
    return kafkaConsumer;
  } catch (error) {
    logger.error('Failed to connect Kafka consumer:', error);
    throw error;
  }
};

// Publish Event
const publishEvent = async (topic, key, value) => {
  if (!config.kafka.enabled || !kafkaProducer) {
    logger.warn('Kafka is disabled, skipping event publication');
    return;
  }

  try {
    const message = {
      key: key ? String(key) : null,
      value: JSON.stringify(value),
      timestamp: Date.now().toString(),
    };

    await kafkaProducer.send({
      topic,
      messages: [message],
    });

    logger.debug(`Published event to ${topic}:`, { key, value });
  } catch (error) {
    logger.error(`Failed to publish event to ${topic}:`, error);
    throw error;
  }
};

// Start Consumer
const startConsumer = async (messageHandler) => {
  if (!config.kafka.enabled || !kafkaConsumer) {
    logger.warn('Kafka is disabled, skipping consumer start');
    return;
  }

  try {
    await kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const key = message.key ? message.key.toString() : null;
        const value = JSON.parse(message.value.toString());

        // logger.debug(`Received message from ${topic}:`, { key, value });

        try {
          await messageHandler(topic, key, value);
        } catch (error) {
          logger.error(`Error processing message from ${topic}:`, error);
        }
      },
    });

    logger.info('✅ Kafka consumer started');
  } catch (error) {
    logger.error('Failed to start Kafka consumer:', error);
    throw error;
  }
};

// Disconnect Kafka
const disconnectKafka = async () => {
  try {
    if (kafkaProducer) {
      await kafkaProducer.disconnect();
      logger.info('Kafka producer disconnected');
    }
    if (kafkaConsumer) {
      await kafkaConsumer.disconnect();
      logger.info('Kafka consumer disconnected');
    }
  } catch (error) {
    logger.error('Error disconnecting Kafka:', error);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectKafka();
  process.exit(0);
});

module.exports = {
  TOPICS,
  initProducer,
  initConsumer,
  publishEvent,
  startConsumer,
  disconnectKafka,
};

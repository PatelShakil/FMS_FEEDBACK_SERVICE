// src/services/kafka.service.js
const { publishEvent, TOPICS, startConsumer } = require('../config/kafka');
const logger = require('../utils/logger');

class KafkaService {
  /**
   * Publish form created event
   */
  async publishFormCreated(form) {
    try {
      await publishEvent(TOPICS.FORM_CREATED, form.formId, {
        formId: form.formId,
        formName: form.formName,
        serviceId: form.serviceId,
        orgId: form.orgId,
        createdBy: form.createdBy,
        createdAt: form.createdAt
      });
      logger.info(`Published form.created event: ${form.formId}`);
    } catch (error) {
      logger.error('Failed to publish form.created event:', error);
    }
  }

  async publishFormUpdated(form) {
    try {
      await publishEvent(TOPICS.FORM_UPDATED, form.formId, {
        formId: form.formId,
        formName: form.formName,
        updatedBy: form.updatedBy,
        updatedAt: form.updatedAt
      });
      logger.info(`Published form.updated event: ${form.formId}`);
    } catch (error) {
      logger.error('Failed to publish form.updated event:', error);
    }
  }

  async publishFormFinalized(form) {
    try {
      await publishEvent(TOPICS.FORM_FINALIZED, form.formId, {
        formId: form.formId,
        formName: form.formName,
        serviceId: form.serviceId,
        orgId: form.orgId,
        finalizedBy: form.finalizedBy,
        finalizedAt: form.finalizedAt
      });
      logger.info(`Published form.finalized event: ${form.formId}`);
    } catch (error) {
      logger.error('Failed to publish form.finalized event:', error);
    }
  }

  async publishFormActivated(form) {
    try {
      await publishEvent(TOPICS.FORM_ACTIVATED, form.formId, {
        formId: form.formId,
        formName: form.formName,
        serviceId: form.serviceId,
        orgId: form.orgId,
        activatedBy: form.activatedBy,
        activatedAt: form.activatedAt
      });
      logger.info(`Published form.activated event: ${form.formId}`);
    } catch (error) {
      logger.error('Failed to publish form.activated event:', error);
    }
  }

  async publishFormDeactivated(form) {
    try {
      await publishEvent(TOPICS.FORM_DEACTIVATED, form.formId, {
        formId: form.formId,
        formName: form.formName,
        orgId: form.orgId,
        deactivatedAt: new Date()
      });
      logger.info(`Published form.deactivated event: ${form.formId}`);
    } catch (error) {
      logger.error('Failed to publish form.deactivated event:', error);
    }
  }

  async publishFormDeleted(form) {
    try {
      await publishEvent(TOPICS.FORM_DELETED, form.formId, {
        formId: form.formId,
        formName: form.formName,
        orgId: form.orgId,
        deletedBy: form.deletedBy,
        deletedAt: form.deletedAt
      });
      logger.info(`Published form.deleted event: ${form.formId}`);
    } catch (error) {
      logger.error('Failed to publish form.deleted event:', error);
    }
  }

  async publishTemplateCreated(template) {
    try {
      await publishEvent(TOPICS.TEMPLATE_CREATED, template.templateId, {
        templateId: template.templateId,
        templateName: template.templateName,
        category: template.category,
        createdBy: template.createdBy,
        createdAt: template.createdAt
      });
      logger.info(`Published template.created event: ${template.templateId}`);
    } catch (error) {
      logger.error('Failed to publish template.created event:', error);
    }
  }

  async publishTemplateCloned(template, form) {
    try {
      await publishEvent(TOPICS.TEMPLATE_CLONED, form.formId, {
        templateId: template.templateId,
        templateName: template.templateName,
        formId: form.formId,
        formName: form.formName,
        orgId: form.orgId,
        clonedBy: form.createdBy,
        clonedAt: form.createdAt
      });
      logger.info(`Published template.cloned event: ${template.templateId} -> ${form.formId}`);
    } catch (error) {
      logger.error('Failed to publish template.cloned event:', error);
    }
  }

  /**
   * Start Kafka consumer to listen to events from other services
   */
  async startConsumer() {
    try {
      await startConsumer(this.handleMessage.bind(this));
      logger.info('✅ Kafka consumer started and listening for messages');
    } catch (error) {
      logger.error('Failed to start Kafka consumer:', error);
    }
  }

  /**
   * Handle incoming Kafka messages
   */
  async handleMessage(topic, key, value) {
    try {
      logger.info(`📨 [KAFKA] Received from topic: ${topic}`, { key });
      
      // Log the actual topic value to debug
      console.log('DEBUG - Topic received:', topic);
      console.log('DEBUG - TOPICS.RESPONSE_SUBMITTED:', TOPICS.RESPONSE_SUBMITTED);
      console.log('DEBUG - Topics match?', topic === TOPICS.RESPONSE_SUBMITTED);

      // Use strict equality check
      if (topic === TOPICS.RESPONSE_SUBMITTED) {
        logger.info('✅ Matched RESPONSE_SUBMITTED topic');
        await this.handleResponseSubmitted(value);
        return;
      }

      if (topic === TOPICS.ORG_APPROVED) {
        await this.handleOrgApproved(value);
        return;
      }

      if (topic === TOPICS.SERVICE_CREATED) {
        await this.handleServiceCreated(value);
        return;
      }

      if (topic === TOPICS.QR_GENERATED) {
        await this.handleQRGenerated(value);
        return;
      }

      // If no match found
      logger.warn(`⚠️ No handler found for topic: ${topic}`);
      
    } catch (error) {
      logger.error(`❌ Error handling message from ${topic}:`, error);
    }
  }

  async handleOrgApproved(value) {
    logger.info('🏢 Processing org.approved event:', value);
    // Add your logic here
  }

  async handleServiceCreated(value) {
    logger.info('🛠️ Processing service.created event:', value);
    // Add your logic here
  }

  async handleQRGenerated(value) {
    logger.info('📱 Processing qr.generated event:', value);
    // Add your logic here
  }

  async handleResponseSubmitted(value) {
    logger.info('✅ Processing response.submitted event:' + value);
    
    try {
      const { formId, responseId, orgId, serviceId } = value;
      
      logger.info(`✅ Response ${responseId} received for form ${formId}`);

      const formService = require('./form.service');
      await formService.incrementResponseCount(formId);
      
      // TODO: Add your business logic here
      // Example: Update response count, send notifications, etc.
      
    } catch (error) {
      logger.error('❌ Error processing response.submitted:', error);
      throw error;
    }
  }
}

module.exports = new KafkaService();

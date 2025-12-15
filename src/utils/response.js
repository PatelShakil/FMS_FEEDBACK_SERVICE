// src/utils/response.js

/**
 * Standard success response
 */
const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Paginated response
 */
const paginated = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems: pagination.totalItems,
      totalPages: Math.ceil(pagination.totalItems / pagination.pageSize),
      hasNextPage: pagination.page < Math.ceil(pagination.totalItems / pagination.pageSize),
      hasPreviousPage: pagination.page > 1
    }
  });
};

/**
 * Standard error response
 */
const error = (res, message, statusCode = 500, details = null) => {
  const response = {
    success: false,
    error: message
  };
  
  if (details) {
    response.details = details;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Created response (201)
 */
const created = (res, data, message = 'Resource created successfully') => {
  return success(res, data, message, 201);
};

/**
 * No content response (204)
 */
const noContent = (res) => {
  return res.status(204).send();
};

module.exports = {
  success,
  paginated,
  error,
  created,
  noContent
};

/**
 * Standardized API response helpers.
 * Usage: return apiResponse.success(res, data, 'Message', 200)
 */
const apiResponse = {
  /**
   * Success response.
   * @param {object} res - Express response
   * @param {any} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status (default 200)
   */
  success: (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  },

  /**
   * Created response (201).
   */
  created: (res, data = null, message = 'Created successfully') => {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  },

  /**
   * Error response.
   * @param {object} res - Express response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status (default 500)
   * @param {any} errors - Additional error details
   */
  error: (res, message = 'Internal server error', statusCode = 500, errors = null) => {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors }),
    });
  },

  /**
   * Validation error response (400).
   */
  validationError: (res, message = 'Validation failed', errors = null) => {
    return res.status(400).json({
      success: false,
      message,
      ...(errors && { errors }),
    });
  },

  /**
   * Not found response (404).
   */
  notFound: (res, message = 'Resource not found') => {
    return res.status(404).json({
      success: false,
      message,
    });
  },

  /**
   * Unauthorized response (401).
   */
  unauthorized: (res, message = 'Unauthorized') => {
    return res.status(401).json({
      success: false,
      message,
    });
  },

  /**
   * Forbidden response (403).
   */
  forbidden: (res, message = 'Forbidden') => {
    return res.status(403).json({
      success: false,
      message,
    });
  },
};

export default apiResponse;

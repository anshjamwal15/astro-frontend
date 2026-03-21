/**
 * Network Logger Configuration
 * 
 * Customize network logging behavior here
 */

export const NETWORK_LOGGER_CONFIG = {
  // Enable/disable logging (set to false in production)
  enabled: __DEV__, // Only enabled in development mode
  
  // Log request/response headers
  logHeaders: true,
  
  // Log request body/payload
  logRequestBody: true,
  
  // Log response body/payload
  logResponseBody: true,
  
  // Maximum characters to log for request/response bodies
  // Prevents excessive logging for large payloads
  maxBodyLength: 10000,
  
  // URLs to exclude from logging (regex patterns)
  excludeUrls: [
    /symbolicate/,
    /^http:\/\/.*:8081\/logs/,
    /^http:\/\/.*:8081\/hot/,
    /^http:\/\/.*:8081\/message/,
    /^http:\/\/.*:8081\/__/,
    // Example: /analytics/,
    // Example: /tracking/,
  ] as RegExp[],
  
  // Only log specific URLs (if empty, logs all)
  includeUrls: [] as RegExp[],
  
  // Log only specific HTTP methods
  logMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as string[],
};

/**
 * Check if a URL should be logged based on configuration
 */
export const shouldLogUrl = (url: string): boolean => {
  // Check exclude patterns
  if (NETWORK_LOGGER_CONFIG.excludeUrls.length > 0) {
    if (NETWORK_LOGGER_CONFIG.excludeUrls.some(pattern => pattern.test(url))) {
      return false;
    }
  }
  
  // Check include patterns
  if (NETWORK_LOGGER_CONFIG.includeUrls.length > 0) {
    return NETWORK_LOGGER_CONFIG.includeUrls.some(pattern => pattern.test(url));
  }
  
  return true;
};

/**
 * Check if a method should be logged
 */
export const shouldLogMethod = (method: string): boolean => {
  return NETWORK_LOGGER_CONFIG.logMethods.includes(method.toUpperCase());
};

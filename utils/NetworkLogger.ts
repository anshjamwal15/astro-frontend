/**
 * Network Logger - Intercepts and logs all API calls with color-coded formatting
 * 
 * Features:
 * - Logs request method, URL, headers, and payload
 * - Logs response status, headers, and payload
 * - Color-coded console output for easy debugging
 * - Automatic initialization on app start
 */

import { Colors, colorize } from './ConsoleColors';
import { NETWORK_LOGGER_CONFIG, shouldLogUrl, shouldLogMethod } from '../config/networkLogger.config';

interface LogConfig {
  enabled: boolean;
  logHeaders: boolean;
  logRequestBody: boolean;
  logResponseBody: boolean;
  maxBodyLength: number;
}

class NetworkLogger {
  private static instance: NetworkLogger;
  private originalFetch: typeof fetch;
  private config: LogConfig = {
    enabled: true,
    logHeaders: true,
    logRequestBody: true,
    logResponseBody: true,
    maxBodyLength: 10000, // Max characters to log for request/response body
  };

  private constructor() {
    this.originalFetch = global.fetch;
  }

  static getInstance(): NetworkLogger {
    if (!NetworkLogger.instance) {
      NetworkLogger.instance = new NetworkLogger();
    }
    return NetworkLogger.instance;
  }

  /**
   * Initialize the network logger by intercepting fetch
   */
  initialize(config?: Partial<LogConfig>): void {
    if (config) {
      this.config = { ...this.config, ...config };
    } else {
      // Use config from file if no custom config provided
      this.config = {
        enabled: NETWORK_LOGGER_CONFIG.enabled,
        logHeaders: NETWORK_LOGGER_CONFIG.logHeaders,
        logRequestBody: NETWORK_LOGGER_CONFIG.logRequestBody,
        logResponseBody: NETWORK_LOGGER_CONFIG.logResponseBody,
        maxBodyLength: NETWORK_LOGGER_CONFIG.maxBodyLength,
      };
    }

    if (!this.config.enabled) {
      return;
    }

    // Intercept fetch
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const startTime = Date.now();
      const requestId = this.generateRequestId();
      
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      const method = init?.method || 'GET';

      // Check if this request should be logged
      const shouldLog = shouldLogUrl(url) && shouldLogMethod(method);

      try {
        // Log request
        if (shouldLog) {
          await this.logRequest(requestId, [input, init]);
        }

        // Make the actual request
        const response = await this.originalFetch(input, init);

        // Clone response to read body without consuming it
        const clonedResponse = response.clone();

        // Log response
        if (shouldLog) {
          await this.logResponse(requestId, clonedResponse, Date.now() - startTime);
        }

        return response;
      } catch (error) {
        // Log error
        if (shouldLog) {
          this.logError(requestId, error, Date.now() - startTime);
        }
        throw error;
      }
    };

    console.log(colorize('🌐 Network Logger initialized', Colors.bright + Colors.green));
  }

  /**
   * Disable network logging
   */
  disable(): void {
    this.config.enabled = false;
    global.fetch = this.originalFetch;
    console.log(colorize('🌐 Network Logger disabled', Colors.yellow));
  }

  /**
   * Enable network logging
   */
  enable(): void {
    this.config.enabled = true;
    this.initialize();
  }

  private generateRequestId(): string {
    return `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async logRequest(requestId: string, args: [RequestInfo | URL, RequestInit?]): Promise<void> {
    const [input, init] = args;
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const method = init?.method || 'GET';

    console.log('\n' + colorize('='.repeat(80), Colors.cyan));
    console.log(colorize(`🚀 API REQUEST [${requestId}]`, Colors.bright + Colors.cyan));
    console.log(colorize('='.repeat(80), Colors.cyan));
    console.log(colorize(`📍 URL: `, Colors.blue) + colorize(url, Colors.bright + Colors.white));
    console.log(colorize(`🔧 Method: `, Colors.blue) + colorize(method, Colors.bright + Colors.yellow));
    console.log(colorize(`⏰ Time: `, Colors.blue) + colorize(new Date().toISOString(), Colors.white));

    if (this.config.logHeaders && init?.headers) {
      console.log(colorize('\n📋 Request Headers:', Colors.magenta));
      const headers = this.normalizeHeaders(init.headers);
      Object.entries(headers).forEach(([key, value]) => {
        // Mask sensitive headers
        const displayValue = this.isSensitiveHeader(key) ? '***MASKED***' : value;
        console.log(colorize(`  ${key}: `, Colors.dim) + colorize(displayValue, Colors.white));
      });
    }

    if (this.config.logRequestBody && init?.body) {
      console.log(colorize('\n📦 Request Payload:', Colors.green));
      try {
        const body = typeof init.body === 'string' ? init.body : JSON.stringify(init.body);
        const truncatedBody = this.truncateString(body, this.config.maxBodyLength);
        const parsedBody = JSON.parse(truncatedBody);
        console.log(colorize(JSON.stringify(parsedBody, null, 2), Colors.bright + Colors.green));
      } catch {
        console.log(colorize(String(init.body), Colors.green));
      }
    }

    console.log(colorize('='.repeat(80), Colors.cyan) + '\n');
  }

  private async logResponse(requestId: string, response: Response, duration: number): Promise<void> {
    const statusColor = this.getStatusColorCode(response.status);
    const statusEmoji = this.getStatusEmoji(response.status);

    console.log('\n' + colorize('='.repeat(80), Colors.blue));
    console.log(colorize(`${statusEmoji} API RESPONSE [${requestId}]`, Colors.bright + Colors.blue));
    console.log(colorize('='.repeat(80), Colors.blue));
    console.log(colorize(`📍 URL: `, Colors.blue) + colorize(response.url, Colors.bright + Colors.white));
    console.log(
      colorize(`📊 Status: `, Colors.blue) + 
      colorize(`${response.status} ${response.statusText}`, statusColor)
    );
    console.log(colorize(`⏱️  Duration: `, Colors.blue) + colorize(`${duration}ms`, Colors.yellow));

    if (this.config.logHeaders) {
      console.log(colorize('\n📋 Response Headers:', Colors.magenta));
      response.headers.forEach((value, key) => {
        console.log(colorize(`  ${key}: `, Colors.dim) + colorize(value, Colors.white));
      });
    }

    if (this.config.logResponseBody) {
      console.log(colorize('\n📦 Response Payload:', Colors.cyan));
      try {
        const text = await response.text();
        const truncatedText = this.truncateString(text, this.config.maxBodyLength);
        
        if (truncatedText) {
          try {
            const json = JSON.parse(truncatedText);
            console.log(colorize(JSON.stringify(json, null, 2), Colors.bright + Colors.cyan));
          } catch {
            console.log(colorize(truncatedText, Colors.cyan));
          }
        } else {
          console.log(colorize('(empty response)', Colors.dim));
        }
      } catch (error) {
        console.log(colorize('(unable to read response body)', Colors.dim));
      }
    }

    console.log(colorize('='.repeat(80), Colors.blue) + '\n');
  }

  private logError(requestId: string, error: any, duration: number): void {
    console.log('\n' + colorize('='.repeat(80), Colors.red));
    console.log(colorize(`❌ API ERROR [${requestId}]`, Colors.bright + Colors.red));
    console.log(colorize('='.repeat(80), Colors.red));
    console.log(colorize(`⏱️  Duration: `, Colors.blue) + colorize(`${duration}ms`, Colors.yellow));
    console.log(colorize('\n🚨 Error Details:', Colors.red));
    console.log(colorize(String(error), Colors.bright + Colors.red));
    console.log(colorize('='.repeat(80), Colors.red) + '\n');
  }

  private normalizeHeaders(headers: HeadersInit): Record<string, string> {
    if (headers instanceof Headers) {
      const result: Record<string, string> = {};
      headers.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    }

    if (Array.isArray(headers)) {
      return Object.fromEntries(headers);
    }

    return headers as Record<string, string>;
  }

  private isSensitiveHeader(key: string): boolean {
    const sensitiveHeaders = ['authorization', 'x-api-key', 'x-client-secret', 'cookie', 'set-cookie'];
    return sensitiveHeaders.includes(key.toLowerCase());
  }

  private getStatusEmoji(status: number): string {
    if (status >= 200 && status < 300) return '✅';
    if (status >= 300 && status < 400) return '↪️';
    if (status >= 400 && status < 500) return '⚠️';
    return '❌';
  }

  private getStatusColorCode(status: number): string {
    if (status >= 200 && status < 300) return Colors.bright + Colors.green;
    if (status >= 300 && status < 400) return Colors.bright + Colors.yellow;
    if (status >= 400 && status < 500) return Colors.bright + Colors.red;
    return Colors.bright + Colors.red;
  }

  private getStatusColor(status: number): string {
    if (status >= 200 && status < 300) return '🟢';
    if (status >= 300 && status < 400) return '🟡';
    if (status >= 400 && status < 500) return '🟠';
    return '🔴';
  }

  private truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '\n... (truncated)';
  }
}

// Export singleton instance
export const networkLogger = NetworkLogger.getInstance();

// Auto-initialize with default config
export const initNetworkLogger = (config?: Partial<LogConfig>) => {
  networkLogger.initialize(config);
};

// Export for manual control
export const disableNetworkLogger = () => networkLogger.disable();
export const enableNetworkLogger = () => networkLogger.enable();

/**
 * Type definitions for Network Logger
 */

export interface NetworkLogEntry {
  requestId: string;
  url: string;
  method: string;
  timestamp: string;
  duration?: number;
  status?: number;
  statusText?: string;
  requestHeaders?: Record<string, string>;
  requestBody?: any;
  responseHeaders?: Record<string, string>;
  responseBody?: any;
  error?: any;
}

export interface LogConfig {
  enabled: boolean;
  logHeaders: boolean;
  logRequestBody: boolean;
  logResponseBody: boolean;
  maxBodyLength: number;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export type HttpStatusRange = 
  | '2xx' // Success
  | '3xx' // Redirect
  | '4xx' // Client Error
  | '5xx'; // Server Error

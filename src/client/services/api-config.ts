/**
 * API Configuration
 * Central configuration for API endpoints and settings
 */

export const API_CONFIG = {
  baseUrl: process.env.NODE_ENV === 'production'
    ? 'https://api.herold.app'
    : 'http://localhost:3001',
  endpoints: {
    health: '/health',
    projects: '/api/projects',
    members: (projectId: string) => `/api/projects/${projectId}/members`,
    svg: (projectId: string) => `/api/projects/${projectId}/tree`,
  },
  timeout: 10000, // 10 seconds
} as const;

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
  status?: number;
}

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly timestamp: string;

  constructor(error: ApiError, status: number = 500) {
    super(error.message);
    this.name = 'ApiClientError';
    this.status = status;
    this.timestamp = error.timestamp;
  }
}

/**
 * Base API client with common request handling
 */
export class BaseApiClient {
  protected baseUrl: string;
  protected timeout: number;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
    this.timeout = API_CONFIG.timeout;
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData: ApiError;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            error: 'Network Error',
            message: `HTTP ${response.status}: ${response.statusText}`,
            timestamp: new Date().toISOString(),
          };
        }
        throw new ApiClientError(errorData, response.status);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiClientError) {
        throw error;
      }

      if (error.name === 'AbortError') {
        throw new ApiClientError({
          error: 'Timeout Error',
          message: `Request timed out after ${this.timeout}ms`,
          timestamp: new Date().toISOString(),
        }, 408);
      }

      throw new ApiClientError({
        error: 'Network Error',
        message: error.message || 'Failed to connect to server',
        timestamp: new Date().toISOString(),
      }, 0);
    }
  }

  protected async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
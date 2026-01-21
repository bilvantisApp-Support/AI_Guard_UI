import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { auth } from '@/config/firebase';
import { ApiError } from '@/types/api';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
      withCredentials: false, // Set to true if your API requires cookies
      headers: {
        'Content-Type': 'application/json',
        'X-AI-Guard-Provider': 'web-ui',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Ensure required AI Guard header is always present
        config.headers.set('X-AI-Guard-Provider', 'web-ui');
        
        // Debug logging - remove in production
        console.log('API Request:', {
          url: config.url,
          method: config.method,
          headers: config.headers,
        });
        
        const currentUser = auth.currentUser;
        if (currentUser) {
          const token = await currentUser.getIdToken();
          config.headers.set('Authorization', `Bearer ${token}`);
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        // Debug logging - remove in production
        console.error('API Error:', {
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data,
        });
        
        if (error.response?.status === 401) {
          const currentUser = auth.currentUser;
          if (currentUser) {
            try {
              await currentUser.getIdToken(true);
              const originalRequest = error.config;
              if (originalRequest) {
                return this.instance.request(originalRequest);
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
            }
          }
        }

        const apiError = error.response?.data?.error || {
          type: 'UNKNOWN_ERROR',
          message: error.message || 'An unexpected error occurred',
          statusCode: error.response?.status || 500,
          timestamp: new Date().toISOString(),
          suggestions: ['Please try again later'],
        };

        return Promise.reject({
          ...error,
          apiError,
        });
      }
    );
  }

  public getAxiosInstance(): AxiosInstance {
    return this.instance;
  }

  public async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  public async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  // Debug method to test API connectivity and headers
  public async testConnection(): Promise<any> {
    try {
      const response = await this.instance.get('/_api/health');
      return response.data;
    } catch (error) {
      console.error('API test failed:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
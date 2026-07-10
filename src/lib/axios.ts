import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorResponse } from '../types/auth.types';

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

// Extend the axios config type so we can tag a request as "already retried"
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // MANDATORY: backend uses HttpOnly cookies for auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto refresh: on a 401, try /auth/refresh once (uses the refresh_token
// cookie), then replay the original request. If refresh also fails,
// bounce to /login.
api.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === 'object' &&
      'statusCode' in response.data &&
      'data' in response.data
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/logout');

    const isProfileRoute = originalRequest?.url?.includes('/users/me');

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        await api.post('/auth/refresh', {});
        return api(originalRequest);
      } catch (refreshError) {
        // Don't force a hard reload here — that's what caused the loop.
        // /users/me failing is EXPECTED when logged out (e.g. on the
        // Login/Register pages). Just reject and let React Query /
        // ProtectedRoute handle it: ProtectedRoute already redirects
        // to /login via React Router when isAuthenticated is false,
        // with no page reload and no re-trigger of this interceptor.
        if (
          typeof window !== 'undefined' &&
          !isProfileRoute &&
          window.location.pathname !== '/login'
        ) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Helper to pull a readable message out of the backend's error shape,
// since `message` can be a string OR an array of validation strings.
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join(', ') : data.message;
    }
  }
  return fallback;
}

// Convenience: does this error carry a specific HTTP status?
export function isApiErrorStatus(error: unknown, status: number): boolean {
  return axios.isAxiosError(error) && error.response?.status === status;
}

// services/api.ts
import axios from 'axios';
import { API_BASE } from '@/utils/auth';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  // JWT envoyé en header Authorization, pas de cookie cross-site.
  withCredentials: false,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Laisser le navigateur définir le boundary multipart
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const requestPasswordReset = (email: string) => {
  return axiosInstance.post('password-reset/request', {
    email,
    frontend_url: window.location.origin,
  });
};

export const verifyPasswordResetToken = (token: string) => {
  return axiosInstance.post('password-reset/verify-token', { token });
};

export const confirmPasswordReset = (token: string, password: string) => {
  return axiosInstance.post('password-reset/confirm', {
    token,
    password,
  });
};

export default axiosInstance;

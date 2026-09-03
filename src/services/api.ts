// services/api.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://backoffice.atelier-de-marie.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const PUBLIC_AUTH_PATHS = [
  'login_check',
  'signup',
  'password-reset/request',
  'password-reset/verify-token',
  'password-reset/confirm',
  'forgot-password',
  'reset-password',
  'verify/',
];

function isPublicAuthRequest(url?: string): boolean {
  if (!url) return false;
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
}

axiosInstance.interceptors.request.use(
  (config) => {
    // Ne pas envoyer un vieux JWT sur les routes publiques (login, reset mdp…)
    if (isPublicAuthRequest(config.url)) {
      delete config.headers.Authorization;
    } else {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
    email: email.trim().toLowerCase(),
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

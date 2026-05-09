// services/api.js
import axios from 'axios';

const axiosInstance= axios.create({
    baseURL: `https://backoffice.atelier-de-marie.com/api/`,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

axiosInstance.interceptors.request.use(
    (config) => {
        // Récupère le token JWT stocké dans localStorage
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const requestPasswordReset = (email: string) => {
    return axiosInstance.post('password-reset/request', {
        email,
        frontend_url: window.location.origin
    });
};

export const verifyPasswordResetToken = (token: string) => {
    return axiosInstance.post('password-reset/verify-token', { token });
};

export const confirmPasswordReset = (token: string, password: string) => {
    return axiosInstance.post('password-reset/confirm', {
        token,
        password
    });
};

export default axiosInstance;

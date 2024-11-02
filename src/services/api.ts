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

export default axiosInstance;

// services/api.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://127.0.0.1:8000/api/',  // URL de base pour votre API
    headers: {
        'Authorization': 'Bearer your-token',  // Ajoutez l'autorisation si nécessaire
    },
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

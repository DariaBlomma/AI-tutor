import axios from 'axios';

// Бэкенд: server.port 8080, context-path /api (см. application.yaml).
// Прокси не используем — baseURL берём из окружения.
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const access = localStorage.getItem('token:access');
    if (access) {
        config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
});

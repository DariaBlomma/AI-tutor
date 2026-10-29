import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

// Бэкенд: server.port 8080, context-path /api (см. application.yaml).
// Прокси не используем — baseURL берём из окружения.
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

const ACCESS_KEY = 'token:access';
const REFRESH_KEY = 'token:refresh';
const EXPIRES_KEY = 'token:expires';

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const access = localStorage.getItem(ACCESS_KEY);
    if (access) {
        config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
});

// Отдельный клиент для /auth/refresh: без интерцепторов, чтобы 401 на refresh
// не запускал повторную попытку обновления (риск бесконечного цикла).
const authApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

interface AuthResponseLike {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    role?: string;
}

// Сохраняет новые токены в localStorage (совпадает с AuthService.setToken).
function persistTokens(data: AuthResponseLike): void {
    localStorage.setItem(ACCESS_KEY, data.accessToken);
    localStorage.setItem(REFRESH_KEY, data.refreshToken);
    localStorage.setItem(EXPIRES_KEY, data.expiresAt);
    if (data.role) {
        localStorage.setItem('token:role', data.role);
    }
}

function clearTokens(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(EXPIRES_KEY);
    localStorage.removeItem('token:role');
}

// Общий промис refreshing-запроса: параллельные 401 ждут одно обновление, а не дерут refresh N раз.
let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
    if (!refreshPromise) {
        const refreshToken = localStorage.getItem(REFRESH_KEY);
        if (!refreshToken) return false;

        refreshPromise = authApi
            .post<AuthResponseLike>('/auth/refresh', { refreshToken })
            .then((response) => {
                if (response.data?.accessToken) {
                    persistTokens(response.data);
                    return true;
                }
                return false;
            })
            .catch(() => {
                // Refresh недействителен/просрочен — чистим сессию, роутер редирекнет на логин.
                clearTokens();
                return false;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
}

// Флаг на запросе: помечаем уже повторённые запросы, чтобы не зациклить 401 → refresh → 401.
type RetriableConfig = AxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const original = error.config as RetriableConfig | undefined;
        const status = error.response?.status;
        const url = original?.url ?? '';

        // Трогаем только 401 на обычных запросах; auth-эндпоинты (login/signup/refresh/...)
        // возвращают свои ошибки как есть — их обработчики живут в хуках.
        const isAuthEndpoint = url.startsWith('/auth/');
        if (status === 401 && original && !original._retry && !isAuthEndpoint) {
            original._retry = true;

            const refreshed = await refreshTokens();
            if (refreshed) {
                // Request-интерцептор подставит новый access из localStorage сам.
                return api(original as InternalAxiosRequestConfig);
            }
        }

        return Promise.reject(error);
    },
);

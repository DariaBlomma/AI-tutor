import { api } from '@/core/api/AxiosInstance';
import type {AuthError, AuthResponse, JwtTokenMin, LoginModel, SignUpModel, ForgotPasswordModel} from "@/auth/types";

const ACCESS_KEY = 'token:access';
const REFRESH_KEY = 'token:refresh';
const EXPIRES_KEY = 'token:expires';
const ERROR_KEY = 'auth:error';

export class AuthService {
    public static token: JwtTokenMin | undefined;

    static init() {
        const access = localStorage.getItem(ACCESS_KEY);
        const refresh = localStorage.getItem(REFRESH_KEY);
        const expires = localStorage.getItem(EXPIRES_KEY);

        if (access && refresh && expires) {
            this.token = { access, refresh, expires };
        }
    }

    static setToken(authResponse: AuthResponse) {
        this.token = {
            expires: authResponse.expiresAt,
            access: authResponse.accessToken,
            refresh: authResponse.refreshToken
        };

        localStorage.setItem(ACCESS_KEY, this.token.access);
        localStorage.setItem(REFRESH_KEY, this.token.refresh);
        localStorage.setItem(EXPIRES_KEY, this.token.expires);
    }

    static removeToken() {
        this.token = undefined;
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(EXPIRES_KEY);
    }

    static setError(error: AuthError) {
        localStorage.setItem(ERROR_KEY, JSON.stringify(error));
    }

    static getError(): AuthError | undefined {
        const error = localStorage.getItem(ERROR_KEY);
        if (error) {
            return JSON.parse(error);
        }
    }

    static removeError() {
        localStorage.removeItem(ERROR_KEY);
    }

    static get isAuthenticated(): boolean {
        if (!this.token?.access || !this.token.expires) return false;
        return Date.parse(this.token.expires) > Date.now();
    }

    static async signUp(data: SignUpModel) {
        const response = await api.post<AuthResponse>('/auth/signup', data);

        this.setToken(response.data);
        return response.data;
    }

    static async login(data: LoginModel) {
        const response = await api.post<AuthResponse>('/auth/login', data);

        if (response.data) {
            this.setToken(response.data);
            return true;
        }

        return false;
    }

    // POST /api/auth/forgot-password -> 204 No Content.
    // Бэк всегда отвечает нейтрально: существование аккаунта не раскрывается.
    static async forgotPassword(data: ForgotPasswordModel): Promise<void> {
        await api.post<void>('/auth/forgot-password', data);
    }

    static async signOut() {
        try {
            await api.delete('/auth/token');
        } catch {
            // ignore
        }
        this.removeToken();
    }

    static async refreshToken(): Promise<boolean> {
        if (!this.token?.refresh) return false;

        try {
            const response = await api.post<AuthResponse>('/auth/refresh', {
                refresh: this.token.refresh,
            });

            if (response.data) {
                this.setToken(response.data);
                return true;
            }
        } catch {
            // ignore
        }

        return false;
    }

    static async tryRefreshToken(): Promise<JwtTokenMin> {
        if (this.token && this.isAuthenticated) {
            return this.token;
        }

        if (this.token?.refresh) {
            const success = await this.refreshToken();
            if (success && this.token) {
                return this.token;
            }
        }

        throw new Error('Fail to refresh token');
    }
}

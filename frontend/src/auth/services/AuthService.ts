import { api } from '@/core/api/AxiosInstance';
import type {AuthError, AuthResponse, JwtTokenMin, LoginModel, SignUpModel, ForgotPasswordModel, ResetPasswordModel, UserRole} from "@/auth/types";

const ACCESS_KEY = 'token:access';
const REFRESH_KEY = 'token:refresh';
const EXPIRES_KEY = 'token:expires';
const ROLE_KEY = 'token:role';
const ERROR_KEY = 'auth:error';

// Превентивное обновление access-токена: если до истечения остаётся меньше этого времени.
const REFRESH_AHEAD_MS = 2 * 60 * 1000;

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

    // Синхронизирует токен с localStorage: интерцептор api (AxiosInstance) обновляет
    // токены напрямую при 401 — после этого AuthService должен видеть актуальные значения.
    private static syncFromStorage(): void {
        const access = localStorage.getItem(ACCESS_KEY);
        const refresh = localStorage.getItem(REFRESH_KEY);
        const expires = localStorage.getItem(EXPIRES_KEY);

        if (access && refresh && expires) {
            this.token = { access, refresh, expires };
        } else {
            this.token = undefined;
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

        // Роль из AuthResponse сохраняем для редиректа по роли (учитель/ученик).
        if (authResponse.role) {
            localStorage.setItem(ROLE_KEY, authResponse.role);
        }
    }

    static removeToken() {
        this.token = undefined;
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(EXPIRES_KEY);
        localStorage.removeItem(ROLE_KEY);
    }

    // Id текущего пользователя — из claim "userId" access-токена (бэк выдаёт токены с этим claim).
    static getUserId(): number | undefined {
        const payload = this.decodeJwtPayload(this.token?.access);
        const value = payload?.userId;
        const id = typeof value === 'number' ? value : Number(value);
        return Number.isFinite(id) ? id : undefined;
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

    // Время жизни access-токена из claim "exp" (в секундах); undefined, если разобрать не удалось.
    private static getAccessExpiresAtMs(): number | undefined {
        const payload = this.decodeJwtPayload(this.token?.access);
        const exp = Number(payload?.exp);
        return Number.isFinite(exp) ? exp * 1000 : undefined;
    }

    // Актуальность сессии: сверяемся и с localStorage (его обновляет интерцептор при 401),
    // и с claim "exp" из JWT — expiresAt от бэка может расходиться с реальным TTL токена.
    private static hasValidSession(): boolean {
        this.syncFromStorage();
        if (!this.token?.access) return false;

        const fromExpiresField = this.token.expires ? Date.parse(this.token.expires) > Date.now() : false;
        const jwtExp = this.getAccessExpiresAtMs();
        const fromJwt = jwtExp !== undefined && jwtExp > Date.now();

        return fromExpiresField || fromJwt;
    }

    // Роль пользователя: из AuthResponse (localStorage) либо из access-токена (JWT claim "role").
    static getUserRole(): UserRole | undefined {
        const stored = localStorage.getItem(ROLE_KEY);
        if (stored === 'TEACHER' || stored === 'STUDENT') {
            return stored;
        }

        const payload = this.decodeJwtPayload(this.token?.access);
        if (!payload) return undefined;

        const role = (payload.role ?? payload.authorities) as string | string[] | undefined;
        const value = Array.isArray(role) ? role[0] : role;
        if (!value) return undefined;

        const normalized = value.replace(/^ROLE_/, '').toUpperCase();
        return normalized === 'TEACHER' || normalized === 'STUDENT'
            ? normalized
            : undefined;
    }

    private static decodeJwtPayload(token?: string): Record<string, unknown> | undefined {
        try {
            const payload = token?.split('.')[1];
            if (!payload) return undefined;

            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            const json = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join(''),
            );
            return JSON.parse(json) as Record<string, unknown>;
        } catch {
            return undefined;
        }
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

    // POST /api/auth/reset-password -> 200 OK (см. ResetPasswordRequest).
    // Бросает InvalidTokenException-ошибку бэка при недействительном/просроченном токене.
    static async resetPassword(data: ResetPasswordModel): Promise<void> {
        await api.post<void>('/auth/reset-password', data);
    }

    // Проверяет сессию при входе на сайт: если access-токен просрочен, пытается обновить его.
    // Возвращает true, если сессия активна; false — если нет (токены очищены).
    static async checkSession(): Promise<boolean> {
        if (!this.hasValidSession()) {
            // Access-токен истёк — пробуем обновить по refresh-токену из localStorage.
            const refreshed = await this.refreshToken();
            if (!refreshed) {
                this.removeToken();
            }
            return refreshed;
        }

        // Сессия жива, но access скоро истекает (например, пользователь вернулся к открытой
        // вкладке спустя время) — обновляем превентивно, чтобы следующий запрос не дал 401.
        const jwtExp = this.getAccessExpiresAtMs();
        if (jwtExp !== undefined && jwtExp - Date.now() < REFRESH_AHEAD_MS) {
            await this.refreshToken();
        }

        return this.isAuthenticated || this.hasValidSession();
    }

    static async signOut() {
        try {
            // POST /api/auth/logout с refresh-токеном в теле (см. AuthController.logout).
            await api.post('/auth/logout', { refreshToken: this.token?.refresh });
        } catch {
            // ignore
        }
        this.removeToken();
    }

    static async refreshToken(): Promise<boolean> {
        this.syncFromStorage();
        if (!this.token?.refresh) return false;

        try {
            const response = await api.post<AuthResponse>('/auth/refresh', {
                refreshToken: this.token.refresh,
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

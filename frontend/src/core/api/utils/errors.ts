import type { AxiosError } from 'axios';

interface BackendErrorBody {
    message?: string;
}

export function extractErrorMessage(error: AxiosError | Error | null): string | null {
    if (!error) return null;

    if (axiosIsError(error)) {
        const body = error.response?.data as BackendErrorBody | undefined;
        if (body?.message) return body.message;
        if (error.response) return `Ошибка сервера (${error.response.status})`;
        return 'Сервер недоступен, попробуйте позже';
    }

    return error.message || 'Неизвестная ошибка';
}

function axiosIsError(error: Error | AxiosError): error is AxiosError {
    return 'isAxiosError' in error && error.isAxiosError === true;
}

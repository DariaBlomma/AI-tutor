import { useEffect, useState } from 'react';
import { extractErrorMessage } from '@/core/api/utils/errors';
import type { PageDto, TaskSummary } from '@/tasks/types';

export const TASKS_PAGE_SIZE = 10;

export interface UseTasksBankResult {
    /** Элементы текущей страницы (серверная пагинация: бэк режет сам). */
    pageItems: TaskSummary[];
    totalCount: number;
    totalPages: number;
    /** Текущая страница, 0-based. */
    page: number;
    setPage: (page: number) => void;
    isLoading: boolean;
    isError: boolean;
    error: string | null;
    /** Принудительная перезагрузка текущей страницы (например, после удаления задания). */
    reload: () => void;
}

/**
 * Список банка заданий + серверная постраничная навигация.
 * fetcher(page, size) внедряется извне — хук не зависит от транспорта и легко тестируется.
 * Смена fetcher (фильтры) возвращает на первую страницу; смена страницы — перезапрашивает данные.
 */
export function useTasksBank(fetcher: (page: number, size: number) => Promise<PageDto<TaskSummary>>): UseTasksBankResult {
    const [pageData, setPageData] = useState<PageDto<TaskSummary> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    // Счётчик перезагрузок: инкремент заставляет effect ниже запросить текущую страницу заново.
    const [reloadToken, setReloadToken] = useState(0);
    const reload = () => setReloadToken((t) => t + 1);

    // Смена фильтров перезагружает список — возвращаемся на первую страницу.
    useEffect(() => {
        setPage(0);
    }, [fetcher]);

    useEffect(() => {
        let active = true;

        setIsLoading(true);
        fetcher(page, TASKS_PAGE_SIZE)
            .then((data) => {
                if (!active) return;
                setPageData(data);
                setIsError(false);
                setError(null);
            })
            .catch((e) => {
                if (!active) return;
                setIsError(true);
                setError(extractErrorMessage(e as Error));
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });

        return () => {
            active = false;
        };
    }, [fetcher, page, reloadToken]);

    const pageItems = pageData?.content ?? [];
    const totalPages = Math.max(1, pageData?.totalPages ?? 1);
    const safePage = Math.min(page, totalPages - 1);

    return {
        pageItems,
        totalCount: pageData?.totalElements ?? 0,
        totalPages,
        page: safePage,
        setPage,
        isLoading,
        isError,
        error,
        reload,
    };
}

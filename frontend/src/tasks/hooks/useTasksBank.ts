import { useCallback, useEffect, useRef, useState } from 'react';
import { extractErrorMessage } from '@/core/api/utils/errors';
import type { PageDto, TaskSummary } from '@/tasks/types';

export const TASKS_PAGE_SIZE = 10;

// Минимальная длительность состояния загрузки (мс). Защита от «мигания»: если ответ
// приходит быстрее, спиннер и затемнение списка всё равно успевают отрисоваться полный
// цикл transition, а не исчезнуть через один кадр.
const MIN_LOADING_MS = 250;

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
    const [page, setPageState] = useState(0);
    // Счётчик перезагрузок: инкремент заставляет effect ниже запросить текущую страницу заново.
    // useCallback — ссылка стабильна: потребители держат reload в deps эффектов, и нестабильная
    // функция вызывала бы у них бесконечный цикл «reload → rerender → эффект → reload».
    const [reloadToken, setReloadToken] = useState(0);
    const reload = useCallback(() => setReloadToken((t) => t + 1), []);

    // Смена страницы (в т.ч. возврат на первую при смене фильтров). Отдельный stable-колбэк,
    // чтобы setPage в результате хука не менялся каждый рендер (иначе эффекты-зависимые
    // от него у потребителей перезапускались бы бесконечно).
    const setPage = useCallback((nextPage: number) => setPageState(nextPage), []);

    // Смена фильтров перезагружает список — возвращаемся на первую страницу.
    // Условие «только если не на первой» обязательно: setPageState(0) при page===0, хотя и
    // не меняет состояние, но помечает компонент как «update scheduled» и мешает bail-out'у
    // React — вместе с эффектом reload у потребителя это давало бесконечный каскад рендеров
    // (страница залипала на вечной загрузке).
    const prevFetcher = useRef(fetcher);
    useEffect(() => {
        const changed = prevFetcher.current !== fetcher;
        prevFetcher.current = fetcher;
        if (changed && page !== 0) setPageState(0);
    }, [fetcher, page]);

    useEffect(() => {
        let active = true;
        const timers: number[] = [];

        setIsLoading(true);
        const startedAt = Date.now();
        // Минимальная длительность загрузки: без неё мгновенный ответ (кэш/локалка) даёт
        // кадр «появился спиннер → пропал», и список визуально мигает. Сглаживаем переход,
        // не показывая лоадер дольше самого запроса при медленной сети.
        const finish = (fn: () => void) => {
            const id = window.setTimeout(fn, Math.max(0, MIN_LOADING_MS - (Date.now() - startedAt)));
            timers.push(id);
        };
        fetcher(page, TASKS_PAGE_SIZE)
            .then((data) => {
                if (!active) return;
                finish(() => {
                    if (!active) return;
                    setPageData(data);
                    setIsError(false);
                    setError(null);
                });
            })
            .catch((e) => {
                if (!active) return;
                finish(() => {
                    if (!active) return;
                    setIsError(true);
                    setError(extractErrorMessage(e as Error));
                });
            })
            .finally(() => {
                if (active) {
                    finish(() => {
                        if (active) setIsLoading(false);
                    });
                }
            });

        return () => {
            active = false;
            // Отменяем отложенные «finish»-таймеры: иначе после размонтирования/перезапуска
            // effect'а (StrictMode, быстрая смена фильтров) в старом замыкании остался бы
            // pending setIsLoading(false) и состояние загрузки залипло.
            timers.forEach((id) => window.clearTimeout(id));
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

import type { WorkStatus } from '@/student/types/work';

/** Пресеты дат для фильтрации. */
export type DatePreset = 'all' | 'today' | 'week' | 'month' | 'custom';

/** Диапазон дат. */
export interface DateRange {
    from: string | null;
    to: string | null;
}

/**
 * UI-статусы задач — для отображения бейджей в интерфейсе.
 * Не связаны напрямую с бэкенд-статусами, а отражают смысл для пользователя.
 */
export enum UITaskStatus {
    NEW = 'new',
    URGENT = 'urgent',
    IN_PROGRESS = 'in-progress',
    COMPLETED = 'completed',
    OVERDUE = 'overdue',
}

/** Тип чипа фильтра на странице homework. */
export type FilterChipType = 'all' | UITaskStatus;

/** Количество дней для порога "скоро дедлайн". */
export const URGENT_DEADLINE_DAYS = 14;

/** Количество дней для порога "создано недавно" (для "Новое"). */
export const CREATED_RECENTLY_DAYS = 14;

/** Лейблы для UI-статусов (бейджи). */
export const UITASK_STATUS_LABELS: Record<UITaskStatus, string> = {
    [UITaskStatus.NEW]: 'Новое',
    [UITaskStatus.URGENT]: 'Скоро дедлайн',
    [UITaskStatus.IN_PROGRESS]: 'В процессе',
    [UITaskStatus.COMPLETED]: 'Выполнено',
    [UITaskStatus.OVERDUE]: 'Просрочено',
};

/** Лейблы для чипов фильтра. */
export const FILTER_CHIP_LABELS: Record<FilterChipType, string> = {
    all: 'Все',
    [UITaskStatus.NEW]: 'Новое',
    [UITaskStatus.URGENT]: 'Скоро дедлайн',
    [UITaskStatus.IN_PROGRESS]: 'В процессе',
    [UITaskStatus.COMPLETED]: 'Выполнено',
    [UITaskStatus.OVERDUE]: 'Просрочено',
};

/** Параметры фильтрации для API. */
export interface BackendFilterParams {
    status?: WorkStatus;
    deadlineFrom?: () => string;
    deadlineTo?: () => string;
    deadlineExcludeFrom?: () => string;
    createdAtFrom?: () => string;
    completedAtFrom?: () => string;
    completedAtTo?: () => string;
}

/**
 * Маппинг UI-статуса на бэкенд-параметры фильтрации.
 * Каждый статус «знает» как отправить запрос на бэк.
 */
export const UI_STATUS_TO_BACKEND: Record<Exclude<FilterChipType, 'all'>, BackendFilterParams> = {
    [UITaskStatus.NEW]: {
        status: 'ASSIGNED',
        deadlineExcludeFrom: () => daysAheadToISO(URGENT_DEADLINE_DAYS),
        createdAtFrom: () => daysAgoToISO(CREATED_RECENTLY_DAYS),
    },
    [UITaskStatus.URGENT]: {
        status: 'ASSIGNED',
        deadlineFrom: () => daysAgoToISO(0),
        deadlineTo: () => daysAheadToISO(URGENT_DEADLINE_DAYS),
    },
    [UITaskStatus.IN_PROGRESS]: {
        status: 'IN_PROGRESS',
    },
    [UITaskStatus.COMPLETED]: {
        status: 'COMPLETED',
    },
    [UITaskStatus.OVERDUE]: {
        status: 'EXPIRED',
    },
};
/**
 * Маппинг бэкенд-статуса на UI-статус.
 * - ASSIGNED + deadline ≤ 14 дней → URGENT
 * - ASSIGNED + deadline > 14 дней + createdAt within 14 дней → NEW
 * - ASSIGNED + deadline > 14 дней + createdAt > 14 дней → URGENT (старые задачи)
 * - IN_PROGRESS → IN_PROGRESS
 * - COMPLETED → COMPLETED
 * - EXPIRED → OVERDUE
 */
export function mapBackendStatusToUI(
    status: WorkStatus,
    deadline: string | null | undefined,
    createdAt: string | null | undefined,
): UITaskStatus {
    if (status === 'IN_PROGRESS') return UITaskStatus.IN_PROGRESS;
    if (status === 'COMPLETED') return UITaskStatus.COMPLETED;
    if (status === 'EXPIRED') return UITaskStatus.OVERDUE;

    if (status === 'ASSIGNED') {
        // КРИТИЧНЫЙ ФИКС: задание без дедлайна всегда "Новое", пока не начато
        if (!deadline) return UITaskStatus.NEW;

        const days = daysUntilDeadline(deadline);
        if (days >= 0 && days <= URGENT_DEADLINE_DAYS) return UITaskStatus.URGENT;
        if (days > URGENT_DEADLINE_DAYS && isCreatedRecently(createdAt)) return UITaskStatus.NEW;
        return UITaskStatus.URGENT;
    }

    return UITaskStatus.NEW;
}

/**
 * Возвращает количество полных дней до дедлайна.
 * Отрицательное — дедлайн прошёл. Infinity — дедлайна нет.
 */
export function daysUntilDeadline(deadline: string | null | undefined): number {
    if (!deadline) return Infinity;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dl = new Date(deadline);
    dl.setHours(0, 0, 0, 0);
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    return Math.floor((dl.getTime() - now.getTime()) / MS_PER_DAY);
}

/** Возвращает ISO-строку для даты N дней назад (в 00:00:00). */
export function daysAgoToISO(daysAgo: number): string {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const date = new Date(now);
    date.setDate(now.getDate() - daysAgo);
    return date.toISOString();
}

/** Возвращает ISO-строку для даты через N дней (в 00:00:00). */
export function daysAheadToISO(daysAhead: number): string {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const date = new Date(now);
    date.setDate(now.getDate() + daysAhead);
    return date.toISOString();
}

/** Проверка: задача создана не более N дней назад. */
export function isCreatedRecently(createdAt: string | null | undefined): boolean {
    if (!createdAt) return false;

    // Унифицируем с daysUntilDeadline: используем начало сегодняшнего дня (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const created = new Date(createdAt);
    created.setHours(0, 0, 0, 0);

    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const daysDiff = Math.floor((today.getTime() - created.getTime()) / MS_PER_DAY);

    return daysDiff <= CREATED_RECENTLY_DAYS;
}

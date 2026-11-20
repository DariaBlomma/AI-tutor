export type DatePreset = 'all' | 'today' | 'week' | 'month' | 'custom';

export interface DateRange {
    from: string | null;
    to: string | null;
}

/**
 * Возвращает диапазон дат для выбранного пресета.
 * Все даты в ISO-строках для отправки на бэкенд.
 */
export function getDateRange(preset: DatePreset): DateRange {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (preset) {
        case 'today':
            return {
                from: startOfDay.toISOString(),
                to: now.toISOString(),
            };
        case 'week': {
            const weekStart = new Date(startOfDay);
            weekStart.setDate(startOfDay.getDate() - startOfDay.getDay());
            return {
                from: weekStart.toISOString(),
                to: now.toISOString(),
            };
        }
        case 'month': {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            return {
                from: monthStart.toISOString(),
                to: now.toISOString(),
            };
        }
        default:
            return { from: null, to: null };
    }
}

/** Отображение пресета для UI. */
export const PRESET_LABELS: Record<DatePreset, string> = {
    all: 'Все',
    today: 'Сегодня',
    week: 'Эта неделя',
    month: 'Этот месяц',
    custom: 'Произвольный',
};

/** Возвращает ISO-строку для даты N дней назад (в 00:00:00). */
export function formatToInstant(daysAgo: number): string {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const date = new Date(now);
    date.setDate(now.getDate() - daysAgo);
    return date.toISOString();
}

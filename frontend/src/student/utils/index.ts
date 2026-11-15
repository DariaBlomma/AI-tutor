// UI-хелперы для модуля Student (форматирование, подсчёты, маппинги).

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

// Склонение слова «задание»: 1 задание, 2-4 задания, 5-0 заданий
export function pluralizeTasks(count: number): string {
    const abs = Math.abs(count) % 100;
    const lastDigit = abs % 10;
    if (abs > 10 && abs < 20) return 'заданий';
    if (lastDigit > 1 && lastDigit < 5) return 'задания';
    if (lastDigit === 1) return 'задание';
    return 'заданий';
}

export function formatDeadline(isoString: string | null | undefined): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '';
    return `до ${format(date, 'd MMMM', { locale: ru })}`;
}

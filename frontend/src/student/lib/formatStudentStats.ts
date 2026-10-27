// Форматирование статистики ученика для профиля (макет TutorAI).

import type { StudentStats } from '@/student/types/models';

export interface StatCell {
    value: string;
    label: string;
}

// Секунды -> "M:SS", напр. 510 -> "8:30"; null/пусто -> "—".
export function formatMinutesSeconds(totalSeconds: number | null | undefined): string {
    if (totalSeconds == null || totalSeconds < 0) return '—';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.round(totalSeconds % 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

// Три ячейки верхнего треугольника профиля ученика: выполнено / среднее время / ошибок.
export function buildStudentStatCells(stats: StudentStats | null | undefined): StatCell[] {
    return [
        { value: String(stats?.completedCount ?? 0), label: 'Выполнено' },
        { value: formatMinutesSeconds(stats?.avgTimeSeconds), label: 'Среднее время' },
        { value: String(stats?.errorsCount ?? 0), label: 'Ошибок' },
    ];
}

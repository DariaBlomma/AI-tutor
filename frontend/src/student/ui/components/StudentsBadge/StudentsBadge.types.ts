/** Задача для бэйджа: числовой id задания и текущий счётчик назначений. */
export interface StudentsBadgeProps {
    /** Числовой id задания. */
    taskId: number;
    /** Текущее количество назначений (для SSR/initial render, пока хук грузит). */
    count: number;
}

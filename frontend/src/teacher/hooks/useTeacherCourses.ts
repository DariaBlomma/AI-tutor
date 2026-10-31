import { useCallback, useEffect, useState } from 'react';
import { extractErrorMessage } from '@/core/api/utils/errors';
import { CoursesService } from '@/teacher/services/CoursesService';
import type { CourseSummary } from '@/teacher/types';

export interface UseTeacherCoursesResult {
    courses: CourseSummary[];
    isLoading: boolean;
    error: string | null;
    /**
     * Создать курс (POST /api/courses — нужно только название) и добавить его в список.
     * Возвращает текст ошибки или null при успехе.
     */
    createCourse: (name: string) => Promise<string | null>;
}

/**
 * Список курсов учителя (GET /api/courses) — источник для фильтра-мультиселекта
 * на странице банка заданий и создания курса прямо из попапа «Добавить в курс».
 * Эндпоинт закрыт для ученика (403) — загрузку включает только учитель (enabled).
 */
export function useTeacherCourses(enabled: boolean): UseTeacherCoursesResult {
    const [courses, setCourses] = useState<CourseSummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) return;
        let active = true;

        setIsLoading(true);
        CoursesService.getCourses()
            .then((data) => {
                if (!active) return;
                setCourses(data);
                setError(null);
            })
            .catch((e) => {
                if (!active) return;
                setError(extractErrorMessage(e as Error));
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });

        return () => {
            active = false;
        };
    }, [enabled]);

    const createCourse = useCallback(async (name: string): Promise<string | null> => {
        const trimmed = name.trim();
        if (!trimmed) return 'Название курса обязательно.';
        try {
            // POST возвращает CourseResponse — id нового курса берём из ответа и вставляем
            // в начало списка (бэк сортирует курсы по created_at DESC).
            const created = await CoursesService.createCourse(trimmed);
            setCourses((prev) => [
                { id: created.id, name: created.name, taskCount: 0, createdAt: created.createdAt, updatedAt: created.updatedAt },
                ...prev.filter((c) => c.id !== created.id),
            ]);
            return null;
        } catch (e) {
            return extractErrorMessage(e as Error);
        }
    }, []);

    return { courses, isLoading, error, createCourse };
}

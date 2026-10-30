import { useCallback, useEffect, useState } from 'react';
import { extractErrorMessage } from '@/core/api/utils/errors';
import { CoursesService } from '@/teacher/services/CoursesService';
import type { CourseByTask } from '@/teacher/types';

export interface UseTaskCoursesResult {
    courses: CourseByTask[];
    isLoading: boolean;
    error: string | null;
    /**
     * Добавить/убрать задание из курса и обновить флаги hasTask локально.
     * Возвращает текст ошибки или null при успехе — попап показывает её сам.
     */
    toggleTaskInCourse: (courseId: number, taskId: number, inCourse: boolean) => Promise<string | null>;
}

/**
 * Список курсов учителя с флагом «задание уже в курсе» для попапа выбора курса.
 * Загружается лениво — только когда попап открыт (enabled), чтобы не дёргать API на каждом входе на страницу.
 */
export function useTaskCourses(taskId: number | null, enabled: boolean): UseTaskCoursesResult {
    const [courses, setCourses] = useState<CourseByTask[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled || taskId == null) return;
        let active = true;

        setIsLoading(true);
        CoursesService.getCoursesWithTaskFlag(taskId)
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
    }, [taskId, enabled]);

    const toggleTaskInCourse = useCallback(
        async (courseId: number, taskId: number, inCourse: boolean): Promise<string | null> => {
            try {
                if (inCourse) await CoursesService.removeTaskFromCourse(courseId, taskId);
                else await CoursesService.addTaskToCourse(courseId, { taskId, position: null });
                // Флаг меняем локально — полный перезапрос списка после каждого клика не нужен.
                setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, hasTask: !inCourse } : c)));
                return null;
            } catch (e) {
                return extractErrorMessage(e as Error);
            }
        },
        [],
    );

    return { courses, isLoading, error, toggleTaskInCourse };
}

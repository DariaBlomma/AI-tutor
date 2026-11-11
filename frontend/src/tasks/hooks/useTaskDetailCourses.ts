import { useCallback, useEffect, useState } from 'react';
import { TasksBankService } from '@/tasks/services/TasksBankService';

export interface UseTaskDetailCoursesResult {
    selectedCourseIds: string[];
    actionError: string | null;
    handleCourseChange: (values: string[]) => Promise<void>;
}

/**
 * Управление выбором курсов для задания на странице просмотра.
 * Инициализация из task.courseIds, сохранение через API.
 */
export function useTaskDetailCourses(
    taskId: number | undefined,
    initialCourseIds: number[] | undefined,
): UseTaskDetailCoursesResult {
    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
    const [actionError, setActionError] = useState<string | null>(null);

    useEffect(() => {
        if (initialCourseIds) {
            setSelectedCourseIds(initialCourseIds.map((id) => String(id)));
        } else {
            setSelectedCourseIds([]);
        }
    }, [initialCourseIds]);

    const handleCourseChange = useCallback(
        async (values: string[]) => {
            setSelectedCourseIds(values);
            setActionError(null);
            if (!taskId) return;

            const courseIdNums = values.map(Number);
            try {
                await TasksBankService.updateTaskCourseIds(taskId, courseIdNums);
            } catch (e) {
                setActionError(e instanceof Error ? e.message : 'Не удалось обновить курсы.');
            }
        },
        [taskId],
    );

    return { selectedCourseIds, actionError, handleCourseChange };
}

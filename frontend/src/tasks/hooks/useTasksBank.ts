import { useEffect, useState } from 'react';
import type { TaskSummary } from '@/tasks/types';

interface UseTasksBankResult {
    tasks: TaskSummary[];
    isLoading: boolean;
    isError: boolean;
}

// Список банка заданий (GET /api/tasks).
// fetcher внедряется извне — хук не зависит от транспорта и легко тестируется.
export function useTasksBank(fetcher: () => Promise<TaskSummary[]>): UseTasksBankResult {
    const [tasks, setTasks] = useState<TaskSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        let active = true;

        fetcher()
            .then((data) => {
                if (!active) return;
                setTasks(data);
            })
            .catch(() => {
                if (active) setIsError(true);
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });

        return () => {
            active = false;
        };
    }, [fetcher]);

    return { tasks, isLoading, isError };
}

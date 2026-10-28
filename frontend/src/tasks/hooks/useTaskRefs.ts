import { useCallback, useEffect, useState } from 'react';
import { extractErrorMessage } from '@/core/api/utils/errors';
import { TaskTypesService } from '@/tasks/services/TaskTypesService';
import { TopicsService } from '@/tasks/services/TopicsService';
import type { TaskType, Topic } from '@/tasks/types';

/** Справочники для страницы создания: темы + учебные типы с мутациями. */
export interface TaskRefsMutations {
    createTopic: (name: string) => Promise<Topic | null>;
    renameTopic: (id: number, name: string) => Promise<boolean>;
    removeTopic: (id: number) => Promise<boolean>;
    createTaskType: (name: string, description?: string) => Promise<TaskType | null>;
    /** name + description (для task-types описание обязательно передавать — бэк перезаписывает поле). */
    renameTaskType: (id: number, name: string, description?: string | null) => Promise<boolean>;
    removeTaskType: (id: number) => Promise<boolean>;
}

export interface UseTaskRefsResult extends TaskRefsMutations {
    topics: Topic[];
    taskTypes: TaskType[];
    isLoading: boolean;
    /** Текст ошибки последней неудачной операции (или null). */
    error: string | null;
}

// Загрузка справочников тем/типов + CRUD-мутации с обновлением локального состояния.
// enabled=false (например, для ученика) — запросы не отправляются: бэк закрывает /topics/** от STUDENT.
export function useTaskRefs(enabled: boolean = true): UseTaskRefsResult {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
    const [isLoading, setIsLoading] = useState(enabled);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        const [nextTopics, nextTypes] = await Promise.all([
            TopicsService.getAll(),
            TaskTypesService.getAll(),
        ]);
        setTopics(nextTopics);
        setTaskTypes(nextTypes);
    }, []);

    useEffectOnceLoad(enabled ? reload : undefined, setIsLoading, setError);

    const runMutation = useCallback(
        async <T,>(action: () => Promise<T>, apply: (result: T) => void): Promise<T | null> => {
            try {
                setError(null);
                const result = await action();
                apply(result);
                return result;
            } catch (e) {
                setError(extractErrorMessage(e as Error));
                return null;
            }
        },
        [],
    );

    const createTopic = useCallback(
        (name: string) => runMutation(() => TopicsService.create(name), (t) => t && setTopics((prev) => [...prev, t])),
        [runMutation],
    );
    const renameTopic = useCallback(
        (id: number, name: string) =>
            runMutation(
                () => TopicsService.update(id, name),
                (t) => t && setTopics((prev) => prev.map((item) => (item.id === id ? t : item))),
            ).then((r) => r !== null),
        [runMutation],
    );
    const removeTopic = useCallback(
        (id: number) =>
            runMutation(
                () => TopicsService.remove(id),
                () => setTopics((prev) => prev.filter((item) => item.id !== id)),
            ).then((r) => r !== null),
        [runMutation],
    );

    const createTaskType = useCallback(
        (name: string, description?: string) =>
            runMutation(
                () => TaskTypesService.create(name, description),
                (t) => t && setTaskTypes((prev) => [...prev, t]),
            ),
        [runMutation],
    );
    const renameTaskType = useCallback(
        (id: number, name: string, description?: string | null) =>
            runMutation(
                () => TaskTypesService.update(id, name, description ?? undefined),
                (t) => t && setTaskTypes((prev) => prev.map((item) => (item.id === id ? t : item))),
            ).then((r) => r !== null),
        [runMutation],
    );
    const removeTaskType = useCallback(
        (id: number) =>
            runMutation(
                () => TaskTypesService.remove(id),
                () => setTaskTypes((prev) => prev.filter((item) => item.id !== id)),
            ).then((r) => r !== null),
        [runMutation],
    );

    return {
        topics,
        taskTypes,
        isLoading,
        error,
        createTopic,
        renameTopic,
        removeTopic,
        createTaskType,
        renameTaskType,
        removeTaskType,
    };
}

// Первичная загрузка обоих справочников (ошибка сети не блокирует страницу — покажет error).

function useEffectOnceLoad(
    reload: (() => Promise<void>) | undefined,
    setIsLoading: (value: boolean) => void,
    setError: (value: string | null) => void,
) {
    useEffect(() => {
        if (!reload) return;
        let active = true;
        reload()
            .catch((e) => {
                if (active) setError(extractErrorMessage(e as Error));
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });
        return () => {
            active = false;
        };
    }, [reload, setIsLoading, setError]);
}

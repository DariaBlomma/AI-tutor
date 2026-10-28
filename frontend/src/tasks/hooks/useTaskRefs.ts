import { useCallback, useEffect, useState } from 'react';
import { extractErrorMessage } from '@/core/api/utils/errors';
import { GrammarTypesService } from '@/tasks/services/GrammarTypesService';
import { TopicsService } from '@/tasks/services/TopicsService';
import type { GrammarType, Topic } from '@/tasks/types';

/** Справочники для страницы создания: темы + грамматические типы с мутациями. */
export interface TaskRefsMutations {
    createTopic: (name: string) => Promise<Topic | null>;
    renameTopic: (id: number, name: string) => Promise<boolean>;
    removeTopic: (id: number) => Promise<boolean>;
    createGrammarType: (name: string, description?: string) => Promise<GrammarType | null>;
    /** name + description (для справочника грамматических типы описание обязательно передавать — бэк перезаписывает поле). */
    renameGrammarType: (id: number, name: string, description?: string | null) => Promise<boolean>;
    removeGrammarType: (id: number) => Promise<boolean>;
}

export interface UseTaskRefsResult extends TaskRefsMutations {
    topics: Topic[];
    grammarTypes: GrammarType[];
    isLoading: boolean;
    /** Текст ошибки последней неудачной операции (или null). */
    error: string | null;
}

// Загрузка справочников тем/типов + CRUD-мутации с обновлением локального состояния.
// enabled=false (например, для ученика) — запросы не отправляются: бэк закрывает /topics/** от STUDENT.
export function useTaskRefs(enabled: boolean = true): UseTaskRefsResult {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [grammarTypes, setGrammarTypes] = useState<GrammarType[]>([]);
    const [isLoading, setIsLoading] = useState(enabled);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        const [nextTopics, nextTypes] = await Promise.all([
            TopicsService.getAll(),
            GrammarTypesService.getAll(),
        ]);
        setTopics(nextTopics);
        setGrammarTypes(nextTypes);
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

    const createGrammarType = useCallback(
        (name: string, description?: string) =>
            runMutation(
                () => GrammarTypesService.create(name, description),
                (t) => t && setGrammarTypes((prev) => [...prev, t]),
            ),
        [runMutation],
    );
    const renameGrammarType = useCallback(
        (id: number, name: string, description?: string | null) =>
            runMutation(
                () => GrammarTypesService.update(id, name, description ?? undefined),
                (t) => t && setGrammarTypes((prev) => prev.map((item) => (item.id === id ? t : item))),
            ).then((r) => r !== null),
        [runMutation],
    );
    const removeGrammarType = useCallback(
        (id: number) =>
            runMutation(
                () => GrammarTypesService.remove(id),
                () => setGrammarTypes((prev) => prev.filter((item) => item.id !== id)),
            ).then((r) => r !== null),
        [runMutation],
    );

    return {
        topics,
        grammarTypes,
        isLoading,
        error,
        createTopic,
        renameTopic,
        removeTopic,
        createGrammarType,
        renameGrammarType,
        removeGrammarType,
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

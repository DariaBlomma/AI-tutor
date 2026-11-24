import { createContext, useCallback, useContext, useRef } from 'react';

/**
 * Контекст для инвалидации кэша назначений заданий.
 * Используется для перезагрузки списков учеников с активными назначениями
 * после bulk-назначения заданий (TaskAssignPopup).
 */
interface TaskAssignmentsCacheContextValue {
    /** Зарегистрировать callback для перезагрузки назначений конкретного задания. */
    registerReload: (taskId: number, reload: () => void) => void;
    /** Отменить регистрацию callback для перезагрузки назначений конкретного задания. */
    unregisterReload: (taskId: number) => void;
    /** Перезагрузить назначения для всех зарегистрированных заданий. */
    reloadAll: () => void;
}

const TaskAssignmentsCacheContext = createContext<TaskAssignmentsCacheContextValue | null>(null);

export function TaskAssignmentsCacheProvider({ children }: { children: React.ReactNode }) {
    const reloadsRef = useRef(new Map<number, () => void>());

    const registerReload = useCallback((taskId: number, reload: () => void) => {
        reloadsRef.current.set(taskId, reload);
    }, []);

    const unregisterReload = useCallback((taskId: number) => {
        reloadsRef.current.delete(taskId);
    }, []);

    const reloadAll = useCallback(() => {
        reloadsRef.current.forEach((reload) => reload());
    }, []);

    return (
        <TaskAssignmentsCacheContext.Provider
            value={{ registerReload, unregisterReload, reloadAll }}
        >
            {children}
        </TaskAssignmentsCacheContext.Provider>
    );
}

export function useTaskAssignmentsCache() {
    const context = useContext(TaskAssignmentsCacheContext);
    if (!context) {
        throw new Error('useTaskAssignmentsCache must be used within TaskAssignmentsCacheProvider');
    }
    return context;
}

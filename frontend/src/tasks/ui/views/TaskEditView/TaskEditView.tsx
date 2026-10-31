import { useCallback, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader } from '@/shared/ui-kit/Loader/Loader';
import { TaskForm } from '@/tasks/ui/widgets/TaskForm/TaskForm';
import { useUpdateTask } from '@/tasks/hooks/useCreateTask';
import type { CreateTaskFormState } from '@/tasks/hooks/useCreateTask';
import { useTaskDetail } from '@/tasks/hooks/useTaskDetail';
import { useTaskUsage } from '@/tasks/hooks/useTaskUsage';
import { taskToFormState } from '@/tasks/lib/taskFormHydration';
import styles from './TaskEditView.module.scss';

interface TaskEditViewProps {
    publicId: string;
}

// Экран «Редактирование задания»: та же форма конструктора, что при создании (TaskForm),
// но предзаполнена карточкой GET /api/tasks/by-public-id/{publicId}; PUT /api/tasks/{id}.
// Механику задания менять нельзя — ItemTypeSelect в режиме editMode заблокирован.
export function TaskEditView({ publicId }: TaskEditViewProps) {
    const navigate = useNavigate();
    const { task, isLoading, isError, error } = useTaskDetail(publicId);

    const goBack = useCallback(() => {
        void navigate({ to: '/tasks-bank/$publicId', params: { publicId } });
    }, [navigate, publicId]);

    // Факт использования задания (назначено/решено) — блокирует содержательные поля формы.
    // Ошибку загрузки не считаем блокировкой: сервер всё равно проверит контент на PUT (400).
    const { usage } = useTaskUsage(publicId);
    const contentLocked = Boolean(usage && (usage.hasActiveAssignments || usage.hasSubmissions));

    const { submit, isSubmitting, error: saveError } = useUpdateTask(goBack);

    // Состояние формы инициализируется один раз при появлении карточки (key пересоздаёт
    // TaskForm при смене publicId); начальные значения — из taskToFormState.
    const initial = useMemo(() => (task ? taskToFormState(task) : null), [task]);

    const handleSubmit = useMemo(
        () => (form: CreateTaskFormState) => {
            if (!task) return;
            void submit(task.id, form);
        },
        [submit, task],
    );

    if (isLoading) {
        return (
            <div className={styles.page}>
                <Loader />
            </div>
        );
    }

    // Ошибка загрузки и «не найдено» — разные состояния: красный только при реальной ошибке.
    if (isError || !task || !initial) {
        return (
            <div className={styles.page}>
                <div className={isError ? styles.serverError : styles.notice}>{error ?? 'Задание не найдено.'}</div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <a className={styles.backLink} onClick={() => void goBack()}>
                ← К просмотру задания
            </a>

            <div className={styles.header}>
                <h1>Редактирование задания</h1>
                <p>{task.publicId}</p>
            </div>

            <TaskForm
                key={task.id}
                initial={initial}
                editMode
                contentLocked={contentLocked}
                submitLabel="Сохранить изменения"
                submittingLabel="Сохранение…"
                isSubmitting={isSubmitting}
                serverError={saveError}
                onSubmit={handleSubmit}
                onCancel={goBack}
            />
        </div>
    );
}

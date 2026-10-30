import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { createEmptyItem, TaskForm } from '@/tasks/ui/widgets/TaskForm/TaskForm';
import { useCreateTask } from '@/tasks/hooks/useCreateTask';
import type { CreateTaskFormState } from '@/tasks/hooks/useCreateTask';
import styles from './TaskCreateView.module.scss';

// Пустая форма создания: один пункт стартовой механики (WORD_FORMATION), остальное — значения по умолчанию.
function emptyForm(): CreateTaskFormState {
    return {
        name: '',
        instruction: '',
        topicIds: [],
        grammarTypeIds: [],
        itemType: 'WORD_FORMATION',
        levels: [],
        examType: null,
        materialTitle: '',
        materialText: '',
        items: [createEmptyItem('WORD_FORMATION')],
    };
}

// Экран «Создание задания»: сначала выбирается механика (itemType) — она определяет,
// какие поля показывать; форма собирает TaskCreateRequest и отправляет POST /api/tasks.
// Тело формы вынесено в общий виджет TaskForm (тот же используется при редактировании).
export function TaskCreateView() {
    const navigate = useNavigate();

    // initial стабилен (создаётся один раз при mount): TaskForm инициализирует им своё состояние.
    const [initial] = useState(emptyForm);

    const goBackToBank = useCallback(() => {
        void navigate({ to: '/tasks-bank' });
    }, [navigate]);

    const { submit, isSubmitting, error } = useCreateTask(goBackToBank);

    const handleSubmit = useMemo(
        () => (form: CreateTaskFormState) => {
            void submit(form);
        },
        [submit],
    );

    return (
        <div className={styles.page}>
            <a className={styles.backLink} onClick={() => void goBackToBank()}>
                ← Назад в банк
            </a>

            <div className={styles.header}>
                <h1>Новое задание</h1>
                <p>Выберите тип задания — от него зависит набор полей формы.</p>
            </div>

            <TaskForm
                initial={initial}
                submitLabel="Сохранить задание"
                submittingLabel="Сохранение…"
                isSubmitting={isSubmitting}
                serverError={error}
                onSubmit={handleSubmit}
                onCancel={goBackToBank}
            />
        </div>
    );
}

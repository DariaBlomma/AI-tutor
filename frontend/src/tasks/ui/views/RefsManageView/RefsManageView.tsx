import { Link } from '@tanstack/react-router';
import { useTaskRefs } from '@/tasks/hooks/useTaskRefs';
import { RefCrudPanel } from '@/tasks/ui/widgets/RefCrudPanel/RefCrudPanel';
import type { TaskType, Topic } from '@/tasks/types';
import styles from './RefsManageView.module.scss';

export interface RefsManageViewProps {
    kind: 'topics' | 'task-types';
}

const COPY: Record<RefsManageViewProps['kind'], { title: string; panelTitle: string }> = {
    topics: { title: 'Лексические темы', panelTitle: 'Темы' },
    'task-types': { title: 'Типы заданий', panelTitle: 'Учебные типы заданий' },
};

// Страница управления справочником (темы / учебные типы): создание, редактирование, удаление.
// Открывается по кнопке «+» рядом с чипами на форме создания задания. Только для учителя.
export function RefsManageView({ kind }: RefsManageViewProps) {
    const refs = useTaskRefs();
    const copy = COPY[kind];

    const items: Array<Topic | TaskType> = kind === 'topics' ? refs.topics : refs.taskTypes;
    const onCreate = kind === 'topics' ? refs.createTopic : refs.createTaskType;
    const onRename = kind === 'topics' ? refs.renameTopic : refs.renameTaskType;
    const onRemove = kind === 'topics' ? refs.removeTopic : refs.removeTaskType;

    return (
        <div className={styles.page}>
            <Link to="/tasks-bank/create" className={styles.backLink}>
                ← К созданию задания
            </Link>

            <div className={styles.header}>
                <h1>{copy.title}</h1>
                <p>Добавляйте, переименовывайте и удаляйте элементы справочника.</p>
            </div>

            {refs.isLoading && <div className={styles.notice}>Загрузка…</div>}

            {!refs.isLoading && (
                <RefCrudPanel
                    title={copy.panelTitle}
                    items={items}
                    onCreate={onCreate}
                    onRename={onRename}
                    onRemove={onRemove}
                />
            )}

            {refs.error && <div className={`${styles.notice} ${styles.error}`}>{refs.error}</div>}
        </div>
    );
}

import { Link } from '@tanstack/react-router';
import { useTaskRefs } from '@/tasks/hooks/useTaskRefs';
import { RefCrudPanel } from '@/tasks/ui/widgets/RefCrudPanel/RefCrudPanel';
import type { GrammarType, Topic } from '@/tasks/types';
import styles from './RefsManageView.module.scss';

export interface RefsManageViewProps {
    kind: 'topics' | 'grammar-types';
}

const COPY: Record<RefsManageViewProps['kind'], { title: string; panelTitle: string }> = {
    topics: { title: 'Лексические темы', panelTitle: 'Темы' },
    'grammar-types': { title: 'Грамматические типы', panelTitle: 'Грамматические типы' },
};

// Страница управления справочником (темы / грамматические типы): создание, редактирование, удаление.
// Открывается по кнопке «+» рядом с чипами на странице банка заданий и форме создания. Только для учителя.
export function RefsManageView({ kind }: RefsManageViewProps) {
    const refs = useTaskRefs();
    const copy = COPY[kind];
    const isTopics = kind === 'topics';

    const items: Array<Topic | GrammarType> = isTopics ? refs.topics : refs.grammarTypes;

    // Для тем описание не используется — всегда null при обновлении.
    const onCreate = isTopics ? refs.createTopic : refs.createGrammarType;
    const onRename = isTopics
        ? (id: number, name: string) => refs.renameTopic(id, name)
        : (id: number, name: string, description: string | null) => refs.renameGrammarType(id, name, description);
    const onRemove = isTopics ? refs.removeTopic : refs.removeGrammarType;

    return (
        <div className={styles.page}>
            <Link to="/tasks-bank" className={styles.backLink}>
                ← К банку заданий
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
                    hasDescription={!isTopics}
                    onCreate={onCreate}
                    onRename={onRename}
                    onRemove={onRemove}
                />
            )}

            {refs.error && <div className={`${styles.notice} ${styles.error}`}>{refs.error}</div>}
        </div>
    );
}

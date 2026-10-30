import { MECHANIC_CHIP_LABELS } from '@/tasks/types';
import type { ItemType } from '@/tasks/types';
import type { TaskPreviewChipsProps } from './types';
import styles from './TaskPreviewChips.module.scss';

// Чипы задания (грамматические типы → темы → механики → Mixed) — один и тот же вид
// и порядок и в превью-карточке списка банка (TasksBankView), и на странице просмотра
// задания (TaskDetailView). Механику задания показываем чипами только один раз — вверху,
// в пунктах её не дублируем.
export function TaskPreviewChips({ grammarTypes, topics, itemTypes, isMixed }: TaskPreviewChipsProps) {
    // itemTypes мог прийти с бэка с повторами — нормализуем к уникальному списку.
    const uniqueItemTypes = [...new Set(itemTypes)] as ItemType[];

    return (
        <div className={styles.tags}>
            {grammarTypes.map((type) => (
                <span key={`tt-${type.id}`} className={styles.tag}>
                    {type.name}
                </span>
            ))}
            {topics.map((topic) => (
                <span key={`tp-${topic.id}`} className={styles.tag}>
                    {topic.name}
                </span>
            ))}
            {uniqueItemTypes.map((mechanic) => (
                <span key={`mt-${mechanic}`} className={styles.tag}>
                    {MECHANIC_CHIP_LABELS[mechanic]}
                </span>
            ))}
            {isMixed && <span className={`${styles.tag} ${styles.mixedTag}`}>Mixed</span>}
        </div>
    );
}

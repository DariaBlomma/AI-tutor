import type { TaskItemResponseDto } from '@/tasks/types';
import {
    parseWordFormationContent,
    parseGapFillContent,
    parseMatchingContent,
    parseExplanation,
} from '@/tasks/lib/parseTaskContent';
import { formatCorrectAnswer } from '@/tasks/lib/formatCorrectAnswer';
import styles from './TaskDetailItem.module.scss';

interface TaskDetailItemProps {
    item: TaskItemResponseDto;
    showAnswers: boolean;
}

export function TaskDetailItem({ item, showAnswers }: TaskDetailItemProps) {
    const word = parseWordFormationContent(item.content);
    const gap = parseGapFillContent(item.content);
    const pair = parseMatchingContent(item.content);
    const explanation = parseExplanation(item.content);

    return (
        <li className={styles.item}>
            <div className={styles.itemHeader}>Пункт {item.position + 1}</div>

            {item.prompt && <p className={styles.itemPrompt}>{item.prompt}</p>}

            {item.itemType === 'WORD_FORMATION' && word?.base && (
                <p className={styles.itemMeta}>
                    База: <strong>{word.base}</strong>
                </p>
            )}
            {item.itemType === 'GAP_FILL' && gap?.options?.length ? (
                <p className={styles.itemMeta}>Опции: {gap.options.join(', ')}</p>
            ) : null}
            {item.itemType === 'MATCHING' && pair?.left_label && (
                <p className={styles.itemMeta}>
                    {pair.left_label} → {pair.right_label ?? ''}
                </p>
            )}

            {showAnswers && (
                <p className={styles.itemAnswer}>
                    Ответ: <strong>{formatCorrectAnswer(item)}</strong>
                </p>
            )}
            {explanation && <p className={styles.itemExplanation}>Пояснение: {explanation}</p>}
        </li>
    );
}

import type { WorkItemAnswerDto } from '@/reports/types';
import { IconCheck, IconCross } from '@/shared/icons';
import styles from './ReportPositionItem.module.scss';

interface ReportPositionItemProps {
    item: WorkItemAnswerDto;
}

export function ReportPositionItem({ item }: ReportPositionItemProps) {
    return (
        <div className={styles.positionItem}>
            <div className={styles.positionHeader}>
                <span className={styles.positionNum}>Пункт {item.position + 1}</span>
                <span className={`${styles.status} ${item.correct ? styles.correct : styles.wrong}`}>
                    {item.correct ? <IconCheck /> : <IconCross />}
                </span>
            </div>

            {item.prompt && (
                <div className={styles.prompt}>{item.prompt}</div>
            )}

            <div className={styles.answers}>
                <div className={`${styles.answerRow} ${item.correct ? styles.correctAnswer : styles.wrongAnswer}`}>
                    <span className={styles.answerLabel}>Ответ ученика:</span>
                    <span className={styles.answerValue}>{item.studentAnswer ?? '—'}</span>
                </div>
                {!item.correct && item.correctAnswer != null && (
                    <div className={`${styles.answerRow} ${styles.correctAnswer}`}>
                        <span className={styles.answerLabel}>Правильный:</span>
                        <span className={styles.answerValue}>{item.correctAnswer}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

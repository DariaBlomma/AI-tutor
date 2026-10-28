import { BaseInputText } from '@/shared/ui-kit/BaseInputText/BaseInputText';
import { ITEM_TYPES, TFNS_ANSWERS } from '@/tasks/data';
import type { ItemType } from '@/tasks/types';
import type { TaskItemCardProps } from './types';
import styles from './TaskItemCard.module.scss';

// Карточка одного пункта задания: механика из enum ItemType бэка,
// динамический набор полей под выбранную механику.
export function TaskItemCard({
    item,
    index,
    isFirst,
    isLast,
    error,
    onChange,
    onMoveUp,
    onMoveDown,
    onRemove,
}: TaskItemCardProps) {
    const patch = (changes: Partial<TaskItemDraft>) => onChange(item.id, changes);

    return (
        <div className={`${styles.card} ${error ? styles.cardError : ''}`}>
            <div className={styles.header}>
                <div className={styles.num}>Пункт {index + 1}</div>
                <div className={styles.controls}>
                    <button type="button" className={styles.iconBtn} title="Вверх" disabled={isFirst} onClick={() => onMoveUp(index)}>
                        ↑
                    </button>
                    <button type="button" className={styles.iconBtn} title="Вниз" disabled={isLast} onClick={() => onMoveDown(index)}>
                        ↓
                    </button>
                    <button type="button" className={`${styles.iconBtn} ${styles.danger}`} title="Удалить" onClick={() => onRemove(index)}>
                        ✕
                    </button>
                </div>
            </div>

            <select
                className={styles.typeSelect}
                value={item.itemType}
                onChange={(e) => patch({ itemType: e.target.value as ItemType })}
            >
                {ITEM_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>
                        {label}
                    </option>
                ))}
            </select>

            <div className={styles.body}>
                {(item.itemType === 'WORD_FORMATION' || item.itemType === 'GAP_FILL') && (
                    <div className={styles.field}>
                        <label className={styles.label}>
                            Предложение с пропуском <span className={styles.req}>*</span>
                        </label>
                        <textarea
                            className={styles.textarea}
                            value={item.prompt}
                            placeholder="Используйте ___ для пропуска и (СЛОВО) в скобках"
                            onChange={(e) => patch({ prompt: e.target.value })}
                        />
                    </div>
                )}

                {item.itemType === 'TFNS' && (
                    <div className={styles.field}>
                        <label className={styles.label}>
                            Утверждение <span className={styles.req}>*</span>
                        </label>
                        <textarea
                            className={styles.textarea}
                            value={item.prompt}
                            placeholder="Введите утверждение для проверки"
                            onChange={(e) => patch({ prompt: e.target.value })}
                        />
                    </div>
                )}

                {(item.itemType === 'WORD_FORMATION' || item.itemType === 'GAP_FILL' || item.itemType === 'TFNS') && (
                    <div className={styles.field}>
                        <label className={styles.label}>
                            {item.itemType === 'TFNS' ? 'Правильный ответ' : 'Ответ'} <span className={styles.req}>*</span>
                        </label>
                        {item.itemType === 'TFNS' ? (
                            <div className={styles.chips}>
                                {TFNS_ANSWERS.map((answer) => (
                                    <button
                                        key={answer}
                                        type="button"
                                        className={`${styles.chip} ${item.answer === answer ? styles.chipSelected : ''}`}
                                        onClick={() => patch({ answer })}
                                    >
                                        {answer}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <BaseInputText value={item.answer} maxLength={200} onChange={(e) => patch({ answer: e.target.value })} />
                        )}
                    </div>
                )}

                {item.itemType === 'WORD_FORMATION' && (
                    <div className={styles.field}>
                        <label className={styles.label}>
                            Слово-база <span className={styles.req}>*</span>
                        </label>
                        <BaseInputText value={item.base} onChange={(e) => patch({ base: e.target.value })} />
                    </div>
                )}

                {item.itemType === 'GAP_FILL' && (
                    <div className={styles.field}>
                        <label className={styles.label}>Варианты выбора</label>
                        <BaseInputText
                            value={item.options}
                            placeholder="Через запятую: study, studied, had studied"
                            onChange={(e) => patch({ options: e.target.value })}
                        />
                    </div>
                )}

                {item.itemType === 'MATCHING' && (
                    <>
                        <div className={styles.field}>
                            <label className={styles.label}>
                                Левая часть пары <span className={styles.req}>*</span>
                            </label>
                            <BaseInputText value={item.leftLabel} onChange={(e) => patch({ leftLabel: e.target.value })} />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>
                                Правая часть пары <span className={styles.req}>*</span>
                            </label>
                            <BaseInputText value={item.rightLabel} onChange={(e) => patch({ rightLabel: e.target.value })} />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Подсказка / prompt</label>
                            <BaseInputText value={item.hint} placeholder="Необязательно" onChange={(e) => patch({ hint: e.target.value })} />
                        </div>
                    </>
                )}

                <div className={styles.field}>
                    <label className={styles.label}>Пояснение</label>
                    <BaseInputText
                        value={item.explanation}
                        placeholder="Необязательно"
                        onChange={(e) => patch({ explanation: e.target.value })}
                    />
                </div>

                {error && <div className={styles.itemError}>⚠ {error}</div>}
            </div>
        </div>
    );
}

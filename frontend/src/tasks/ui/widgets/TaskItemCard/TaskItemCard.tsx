import { BaseInputText } from '@/shared/ui-kit/BaseInputText/BaseInputText';
import { BaseInputTextarea } from '@/shared/ui-kit/BaseInputTextarea/BaseInputTextarea';
import { ANSWER_MAX_LENGTH, GAP_MARK, TFNS_ANSWERS } from '@/tasks/data';
import type { TaskItemDraft } from '@/tasks/types';
import type { TaskItemCardProps } from './types';
import styles from './TaskItemCard.module.scss';

// Карточка одного пункта задания. Механика выбирается на уровне всего задания
// (ItemTypeSelect в TaskCreateView), поэтому здесь только поля под неё —
// без лишних для типа полей (у WORD_FORMATION/GAP_FILL нет материала, у MATCHING нет ответа).
export function TaskItemCard({ item, index, isFirst, isLast, error, onChange, onMoveUp, onMoveDown, onRemove, disabled = false }: TaskItemCardProps) {
    const patch = (changes: Partial<TaskItemDraft>) => onChange(item.id, changes);

    return (
        <div className={`${styles.card} ${error ? styles.cardError : ''} ${disabled ? styles.locked : ''}`}>
            <div className={styles.header}>
                <div className={styles.num}>Пункт {index + 1}</div>
                <div className={styles.controls}>
                    <button type="button" className={styles.iconBtn} title="Вверх" disabled={isFirst || disabled} onClick={() => onMoveUp(index)}>
                        ↑
                    </button>
                    <button type="button" className={styles.iconBtn} title="Вниз" disabled={isLast || disabled} onClick={() => onMoveDown(index)}>
                        ↓
                    </button>
                    <button type="button" className={`${styles.iconBtn} ${styles.danger}`} title="Удалить" disabled={disabled} onClick={() => onRemove(index)}>
                        ✕
                    </button>
                </div>
            </div>

            <div className={styles.body}>
                {(item.itemType === 'WORD_FORMATION' || item.itemType === 'GAP_FILL') && (
                    <>
                        <BaseInputTextarea
                            label="Предложение с пропуском"
                            isRequired
                            value={item.prompt}
                            placeholder={`Используйте ${GAP_MARK} для пропуска`}
                            onChange={(e) => patch({ prompt: e.target.value })}
                            disabled={disabled}
                            readOnly={disabled}
                        />
                        <BaseInputText
                            label="Ответ"
                            isRequired
                            value={item.answer}
                            maxLength={ANSWER_MAX_LENGTH}
                            placeholder="Правильный ответ"
                            onChange={(e) => patch({ answer: e.target.value })}
                            disabled={disabled}
                            readOnly={disabled}
                        />
                    </>
                )}

                {/* WORD_FORMATION: prompt — только предложение с ___; слово-база вводится отдельно,
                    раннер сам отрендерит (BASE) после пропуска (см. backend README). */}
                {item.itemType === 'WORD_FORMATION' && (
                    <BaseInputText
                        label="Слово-база"
                        isRequired
                        value={item.base}
                        placeholder="Например: BE"
                        onChange={(e) => patch({ base: e.target.value })}
                        disabled={disabled}
                        readOnly={disabled}
                    />
                )}

                {/* GAP_FILL по бэку — открытый пропуск: ученик сам вписывает ответ.
                    content.options — необязательный список-подсказка, не «выбор из вариантов». */}
                {item.itemType === 'GAP_FILL' && (
                    <BaseInputText
                        label="Подсказка-опции"
                        value={item.options}
                        placeholder="Через запятую: study, studied, had studied"
                        onChange={(e) => patch({ options: e.target.value })}
                        disabled={disabled}
                        readOnly={disabled}
                    />
                )}

                {item.itemType === 'TFNS' && (
                    <>
                        <BaseInputTextarea
                            label="Утверждение"
                            isRequired
                            value={item.prompt}
                            placeholder="Введите утверждение для проверки"
                            onChange={(e) => patch({ prompt: e.target.value })}
                            disabled={disabled}
                            readOnly={disabled}
                        />
                        <div className={styles.field}>
                            <div className={styles.chips}>
                                {TFNS_ANSWERS.map((answer) => (
                                    <button
                                        key={answer}
                                        type="button"
                                        className={`${styles.chip} ${item.answer === answer ? styles.chipSelected : ''}`}
                                        disabled={disabled}
                                        onClick={() => patch({ answer })}
                                    >
                                        {answer}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {item.itemType === 'MATCHING' && (
                    <>
                        <BaseInputText
                            label="Левая часть пары"
                            isRequired
                            value={item.leftLabel}
                            onChange={(e) => patch({ leftLabel: e.target.value })}
                        />
                        <BaseInputText
                            label="Правая часть пары"
                            isRequired
                            value={item.rightLabel}
                            onChange={(e) => patch({ rightLabel: e.target.value })}
                        />
                    </>
                )}

                <BaseInputText
                    label="Пояснение"
                    value={item.explanation}
                    placeholder="Необязательно"
                    onChange={(e) => patch({ explanation: e.target.value })}
                    disabled={disabled}
                    readOnly={disabled}
                />

                {error && <div className={styles.itemError}>⚠ {error}</div>}
            </div>
        </div>
    );
}

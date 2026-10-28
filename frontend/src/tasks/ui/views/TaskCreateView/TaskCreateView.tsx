import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { BaseInputText } from '@/shared/ui-kit/BaseInputText/BaseInputText';
import { ChipsMultiselect } from '@/tasks/ui/widgets/ChipsMultiselect/ChipsMultiselect';
import { MaterialSection } from '@/tasks/ui/widgets/MaterialSection/MaterialSection';
import { TaskItemCard } from '@/tasks/ui/widgets/TaskItemCard/TaskItemCard';
import { useCreateTask } from '@/tasks/hooks/useCreateTask';
import { useTaskRefs } from '@/tasks/hooks/useTaskRefs';
import { validateTaskForm } from '@/tasks/lib/validateTaskForm';
import { TASK_NAME_MAX_LENGTH } from '@/tasks/data';
import type { MaterialFormat, TaskItemDraft } from '@/tasks/types';
import styles from './TaskCreateView.module.scss';

let nextItemId = 1;

function createEmptyItem(): TaskItemDraft {
    return {
        id: nextItemId++,
        itemType: 'WORD_FORMATION',
        prompt: '',
        answer: '',
        base: '',
        options: '',
        hint: '',
        leftLabel: '',
        rightLabel: '',
        explanation: '',
    };
}

// Экран «Создание задания»: форма собирает TaskCreateRequest и отправляет POST /api/tasks.
export function TaskCreateView() {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [topicIds, setTopicIds] = useState<number[]>([]);
    const [grammarTypeIds, setGrammarTypeIds] = useState<number[]>([]);
    const [materialFormat, setMaterialFormat] = useState<MaterialFormat>('TEXT');
    const [materialTitle, setMaterialTitle] = useState('');
    const [materialText, setMaterialText] = useState('');
    const [items, setItems] = useState<TaskItemDraft[]>([createEmptyItem()]);
    const [showErrors, setShowErrors] = useState(false);

    const refs = useTaskRefs();

    const goBackToBank = useCallback(() => {
        void navigate({ to: '/tasks-bank' });
    }, [navigate]);

    const { submit, isSubmitting, error } = useCreateTask(goBackToBank);

    const form = useMemo(
        () => ({ name, topicIds, grammarTypeIds, materialFormat, materialTitle, materialText, items }),
        [name, topicIds, grammarTypeIds, materialFormat, materialTitle, materialText, items],
    );

    const errors = validateTaskForm(form);
    const needsMaterial = items.some((item) => item.itemType === 'TFNS' || item.itemType === 'MATCHING');
    const selectedTypesCount = grammarTypeIds.length;

    const handleItemChange = (id: number, patch: Partial<TaskItemDraft>) => {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    };

    const moveItem = (index: number, target: number) => {
        setItems((prev) => {
            if (target < 0 || target >= prev.length) return prev;
            const next = [...prev];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    };

    const handleSubmit = async () => {
        setShowErrors(true);
        await submit(form);
    };

    return (
        <div className={styles.page}>
            <a className={styles.backLink} onClick={() => void goBackToBank()}>
                ← Назад в банк
            </a>

            <div className={styles.header}>
                <h1>Новое задание</h1>
                <p>Заполните название, выберите темы и типы заданий, добавьте пункты.</p>
            </div>

            {/* ОСНОВНОЕ */}
            <div className={styles.section}>
                <div className={styles.sectionTitle}>Основное</div>

                <div className={styles.field}>
                    <label className={styles.label}>Название задания</label>
                    <BaseInputText
                        id="task-name"
                        value={name}
                        maxLength={TASK_NAME_MAX_LENGTH}
                        placeholder="Например: Phrasal verbs — Travel"
                        error={showErrors ? errors.name : undefined}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <div className={`${styles.counter} ${name.length > TASK_NAME_MAX_LENGTH ? styles.over : ''}`}>
                        {name.length} / {TASK_NAME_MAX_LENGTH}
                    </div>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Лексические темы</label>
                    <ChipsMultiselect
                        items={refs.topics}
                        selectedIds={topicIds}
                        onChange={setTopicIds}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>
                        Грамматические типы <span className={styles.req}>*</span>
                    </label>
                    <ChipsMultiselect
                        items={refs.grammarTypes}
                        selectedIds={grammarTypeIds}
                        onChange={setGrammarTypeIds}
                    />
                    {showErrors && selectedTypesCount === 0 && (
                        <div className={styles.fieldError}>Выберите хотя бы один грамматический тип</div>
                    )}
                    {selectedTypesCount > 1 && (
                        <div className={styles.warning}>
                            ⚠ Выбрано несколько грамматических типов — задание будет смешанным (Mixed). Смешивайте форматы только если это нужно.
                        </div>
                    )}
                </div>
            </div>

            {/* МАТЕРИАЛ */}
            <MaterialSection
                format={materialFormat}
                onFormatChange={setMaterialFormat}
                title={materialTitle}
                text={materialText}
                onTitleChange={setMaterialTitle}
                onTextChange={setMaterialText}
                required={needsMaterial}
                error={showErrors ? errors.material : undefined}
            />

            {/* ПУНКТЫ ЗАДАНИЯ */}
            <div className={styles.section}>
                <div className={styles.sectionTitle}>Пункты задания</div>

                {items.map((item, index) => (
                    <TaskItemCard
                        key={item.id}
                        item={item}
                        index={index}
                        isFirst={index === 0}
                        isLast={index === items.length - 1}
                        error={showErrors ? errors.items[item.id] : undefined}
                        onChange={handleItemChange}
                        onMoveUp={(i) => moveItem(i, i - 1)}
                        onMoveDown={(i) => moveItem(i, i + 1)}
                        onRemove={(i) => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                    />
                ))}

                {showErrors && !items.length && <div className={styles.fieldError}>Добавьте хотя бы один пункт задания</div>}

                <button type="button" className={styles.addBtn} onClick={() => setItems((prev) => [...prev, createEmptyItem()])}>
                    + Добавить пункт
                </button>
            </div>

            {error && <div className={styles.serverError}>{error}</div>}

            {/* ДЕЙСТВИЯ */}
            <div className={styles.actions}>
                <button type="button" className={styles.btn} disabled={isSubmitting} onClick={() => void handleSubmit()}>
                    {isSubmitting ? 'Сохранение…' : 'Сохранить задание'}
                </button>
                <button type="button" className={styles.btnSecondary} disabled={isSubmitting} onClick={() => void goBackToBank()}>
                    Отмена
                </button>
            </div>
        </div>
    );
}

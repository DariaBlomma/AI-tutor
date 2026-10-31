import { useMemo, useState } from 'react';
import { BaseInputText } from '@/shared/ui-kit/BaseInputText/BaseInputText';
import { ChipsMultiselect } from '@/tasks/ui/widgets/ChipsMultiselect/ChipsMultiselect';
import { InstructionSection } from '@/tasks/ui/widgets/InstructionSection/InstructionSection';
import { ItemTypeSelect } from '@/tasks/ui/widgets/ItemTypeSelect/ItemTypeSelect';
import { TextSection } from '@/tasks/ui/widgets/TextSection/TextSection';
import { TaskItemCard } from '@/tasks/ui/widgets/TaskItemCard/TaskItemCard';
import type { CreateTaskFormState } from '@/tasks/hooks/useCreateTask';
import { useTaskRefs } from '@/tasks/hooks/useTaskRefs';
import { needsText, validateTaskForm } from '@/tasks/lib/validateTaskForm';
import { INSTRUCTION_MAX_LENGTH, TASK_NAME_MAX_LENGTH } from '@/tasks/data';
import { CEFR_LEVEL_OPTIONS, EXAM_TYPE_OPTIONS } from '@/tasks/types';
import type { ChipItem } from '@/tasks/ui/widgets/ChipsMultiselect/types';
import type { CefrLevel, ExamType, ItemType, TaskItemDraft } from '@/tasks/types';
import styles from './TaskForm.module.scss';

// Чипы уровня CEFR (enum CefrLevel) и экзамена (enum ExamType) — числовые id для общего виджета чипов.
const LEVEL_ITEMS: ChipItem[] = CEFR_LEVEL_OPTIONS.map((o, i) => ({ id: i + 1, name: o.label }));
const LEVEL_BY_ID = new Map(LEVEL_ITEMS.map((c, i) => [c.id, CEFR_LEVEL_OPTIONS[i].value]));
const EXAM_ITEMS: ChipItem[] = EXAM_TYPE_OPTIONS.map((o, i) => ({ id: i + 1, name: o.label }));
const EXAM_BY_ID = new Map(EXAM_ITEMS.map((c, i) => [c.id, EXAM_TYPE_OPTIONS[i].value]));

let nextItemId = 1;

// Пустой пункт под выбранную механику: поля чужих типов не заводим.
export function createEmptyItem(itemType: ItemType): TaskItemDraft {
    return {
        id: nextItemId++,
        itemType,
        prompt: '',
        answer: '',
        base: '',
        options: '',
        leftLabel: '',
        rightLabel: '',
        explanation: '',
    };
}

export interface TaskFormProps {
    /** Начальное состояние: пустая форма (создание) или предзаполненная карточка (редактирование). */
    initial: CreateTaskFormState;
    /** Режим редактирования: механика задания фиксируется (задаётся только при создании). */
    editMode?: boolean;
    /**
     * Задание уже назначено кому-то или кем-то решено (GET .../usage): содержательные поля
     * (название, инструкция, текст, пункты/ответы) блокируются — править можно только метаданные
     * (уровни, экзамен, темы, грамматические типы). Бэкенд дублирует проверку на PUT (400).
     */
    contentLocked?: boolean;
    /** Текст кнопки сохранения (отличается в режимах). */
    submitLabel: string;
    submittingLabel: string;
    isSubmitting: boolean;
    /** Сообщение об ошибке бэка (400 от TaskContentValidator, 403 и т.п.). */
    serverError: string | null;
    onSubmit: (form: CreateTaskFormState) => void;
    onCancel: () => void;
}

/**
 * Форма конструктора задания — одно и то же тело для экранов создания и редактирования.
 * Состояние живёт здесь (инициализируется из props.initial); смена механики пересобирает
 * пункты под новый тип, в режиме редактирования механика заблокирована (disabled).
 */
export function TaskForm({
    initial,
    editMode = false,
    contentLocked = false,
    submitLabel,
    submittingLabel,
    isSubmitting,
    serverError,
    onSubmit,
    onCancel,
}: TaskFormProps) {
    const [name, setName] = useState(initial.name);
    const [instruction, setInstruction] = useState(initial.instruction);
    const [topicIds, setTopicIds] = useState<number[]>(initial.topicIds);
    const [grammarTypeIds, setGrammarTypeIds] = useState<number[]>(initial.grammarTypeIds);
    const [itemType, setItemType] = useState<ItemType>(initial.itemType);
    const [levels, setLevels] = useState<CefrLevel[]>(initial.levels);
    const [examType, setExamType] = useState<ExamType | null>(initial.examType);
    const [materialTitle, setMaterialTitle] = useState(initial.materialTitle);
    const [materialText, setMaterialText] = useState(initial.materialText);
    const [items, setItems] = useState<TaskItemDraft[]>(initial.items);
    const [showErrors, setShowErrors] = useState(false);

    const refs = useTaskRefs();

    const form = useMemo(
        () => ({ name, instruction, topicIds, grammarTypeIds, itemType, levels, examType, materialTitle, materialText, items }),
        [name, instruction, topicIds, grammarTypeIds, itemType, levels, examType, materialTitle, materialText, items],
    );

    const errors = validateTaskForm(form);
    const textRequired = needsText(itemType);
    const selectedTypesCount = grammarTypeIds.length;

    // Смена механики пересобирает пункты под новый тип (смешивание механик в одном задании нет);
    // поля чужого типа при этом очищаются — на форме не остаётся ничего лишнего.
    const handleItemTypeChange = (next: ItemType) => {
        setItemType(next);
        setItems((prev) => (prev.length ? prev.map((item) => ({ ...createEmptyItem(next), id: item.id })) : prev));
    };

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

    const handleSubmit = () => {
        setShowErrors(true);
        onSubmit(form);
    };

    return (
        <>
            {/* ТИП ЗАДАНИЯ */}
            <div className={styles.section}>
                <div className={styles.sectionTitle}>Тип задания</div>
                <ItemTypeSelect value={itemType} onChange={handleItemTypeChange} disabled={editMode} />
                {editMode && (
                    <div className={styles.warning}>Механику задания нельзя изменить после создания — она задаёт набор полей пунктов.</div>
                )}
                {contentLocked && (
                    <div className={styles.warning}>
                        ⚠ Задание уже назначено ученикам или кем-то решено — название, инструкция, текст и пункты
                        с ответами защищены от правки (меняются только уровни, экзамен, темы и грамматические типы).
                    </div>
                )}
            </div>

            {/* ИНСТРУКЦИЯ — необязательное ТЗ для ученика, есть у любого типа заданий */}
            <InstructionSection
                value={instruction}
                maxLength={INSTRUCTION_MAX_LENGTH}
                onChange={setInstruction}
                error={showErrors ? errors.instruction : undefined}
                disabled={contentLocked}
            />

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
                        disabled={contentLocked}
                        readOnly={contentLocked}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <div className={`${styles.counter} ${name.length > TASK_NAME_MAX_LENGTH ? styles.over : ''}`}>
                        {name.length} / {TASK_NAME_MAX_LENGTH}
                    </div>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Уровень языка *</label>
                    <ChipsMultiselect
                        items={LEVEL_ITEMS}
                        selectedIds={levels.map((lv) => LEVEL_ITEMS.findIndex((c) => LEVEL_BY_ID.get(c.id) === lv) + 1)}
                        onChange={(ids) => setLevels(ids.map((id) => LEVEL_BY_ID.get(id)).filter(Boolean) as CefrLevel[])}
                        onClear={() => setLevels([])}
                        clearLabel="Без уровня"
                    />
                    {showErrors && errors.levels && <div className={styles.fieldError}>{errors.levels}</div>}
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Экзамен</label>
                    <ChipsMultiselect
                        items={EXAM_ITEMS}
                        selectedIds={examType == null ? [] : [EXAM_ITEMS.findIndex((c) => EXAM_BY_ID.get(c.id) === examType) + 1]}
                        single
                        onChange={(ids) => setExamType(ids.length ? (EXAM_BY_ID.get(ids[0]) ?? null) : null)}
                        onClear={() => setExamType(null)}
                        clearLabel="Без экзамена"
                    />
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
                            ⚠ Выбрано несколько грамматических типов — задание будет смешанным (Mixed). Смешивайте типы только если это нужно.
                        </div>
                    )}
                </div>
            </div>

            {/* ТЕКСТ — показываем только когда механика его требует (TFNS / MATCHING) */}
            {textRequired && (
                <TextSection
                    title={materialTitle}
                    text={materialText}
                    onTitleChange={setMaterialTitle}
                    onTextChange={setMaterialText}
                    required
                    error={showErrors ? errors.text : undefined}
                    disabled={contentLocked}
                />
            )}

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
                        disabled={contentLocked}
                    />
                ))}

                {showErrors && !items.length && <div className={styles.fieldError}>Добавьте хотя бы один пункт задания</div>}

                <button type="button" className={styles.addBtn} disabled={contentLocked} onClick={() => setItems((prev) => [...prev, createEmptyItem(itemType)])}>
                    + Добавить пункт
                </button>
            </div>

            {serverError && <div className={styles.serverError}>{serverError}</div>}

            {/* ДЕЙСТВИЯ */}
            <div className={styles.actions}>
                <button type="button" className={styles.btn} disabled={isSubmitting} onClick={handleSubmit}>
                    {isSubmitting ? submittingLabel : submitLabel}
                </button>
                <button type="button" className={styles.btnSecondary} disabled={isSubmitting} onClick={onCancel}>
                    Отмена
                </button>
            </div>
        </>
    );
}

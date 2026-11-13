import { useCallback, useMemo, useState } from 'react';
import { BaseInputText } from '@/shared/ui-kit/BaseInputText/BaseInputText';
import { BaseSelectMulti } from '@/shared/ui-kit/BaseSelectMulti/BaseSelectMulti';
import { BaseSelectSingle } from '@/shared/ui-kit/BaseSelectSingle/BaseSelectSingle';
import { CourseSelectMulti } from '@/tasks/ui/widgets/CourseSelectMulti/CourseSelectMulti';
import { InstructionSection } from '@/tasks/ui/widgets/InstructionSection/InstructionSection';
import { ItemTypeSelect } from '@/tasks/ui/widgets/ItemTypeSelect/ItemTypeSelect';
import { TextSection } from '@/tasks/ui/widgets/TextSection/TextSection';
import { TaskItemCard } from '@/tasks/ui/widgets/TaskItemCard/TaskItemCard';
import type { CreateTaskFormState } from '@/tasks/hooks/useCreateTask';
import { useTaskRefs } from '@/tasks/hooks/useTaskRefs';
import { useTeacherCourses } from '@/teacher/hooks/useTeacherCourses';
import { needsText, validateTaskForm } from '@/tasks/lib/validateTaskForm';
import { INSTRUCTION_MAX_LENGTH, TASK_NAME_MAX_LENGTH } from '@/tasks/data';
import { CEFR_LEVEL_OPTIONS, EXAM_TYPE_OPTIONS } from '@/tasks/types';
import type { CefrLevel, ExamType, ItemType, TaskItemDraft } from '@/tasks/types';
import styles from './TaskForm.module.scss';

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

let nextItemId = 1;

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

    // Курсы: мультиселект всех курсов учителя с предвыбранными из initial.courseIds.
    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(initial.courseIds.map(String));

    const { courses: teacherCourses, isLoading: coursesLoading, createCourse } = useTeacherCourses(true);

    const courseOptions = useMemo(
        () => teacherCourses.map((c) => ({ value: String(c.id), label: c.name })),
        [teacherCourses],
    );

    const refs = useTaskRefs();

    const form = useMemo(
        () => ({ name, instruction, topicIds, grammarTypeIds, itemType, levels, examType, materialTitle, materialText, items, courseIds: selectedCourseIds.map(Number) }),
        [name, instruction, topicIds, grammarTypeIds, itemType, levels, examType, materialTitle, materialText, items, selectedCourseIds],
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

    const handleCourseChange = useCallback((values: string[]) => {
        setSelectedCourseIds(values);
    }, []);

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
                <ItemTypeSelect value={itemType} onChange={handleItemTypeChange} disabled={editMode} label="Тип задания" isRequired />
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
                    <BaseSelectMulti
                        options={CEFR_LEVEL_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                        value={levels}
                        onChange={setLevels}
                        placeholder="Выберите уровни"
                        isClearable
                        error={showErrors ? errors.levels : undefined}
                        label="Уровень языка"
                        isRequired
                    />
                </div>

                <div className={styles.field}>
                    <BaseSelectSingle
                        options={EXAM_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                        value={examType ?? ''}
                        onChange={(v) => setExamType(v || null)}
                        placeholder=""
                        isClearable
                        label="Экзамен"
                    />
                </div>

                <div className={styles.field}>
                    <BaseSelectMulti
                        options={refs.topics.map((t) => ({ value: String(t.id), label: t.name }))}
                        value={topicIds.map(String)}
                        onChange={(ids) => setTopicIds(ids.map(Number))}
                        placeholder="Выберите темы"
                        isClearable
                        label="Лексические темы"
                    />
                </div>

                <div className={styles.field}>
                    <BaseSelectMulti
                        options={refs.grammarTypes.map((g) => ({ value: String(g.id), label: g.name }))}
                        value={grammarTypeIds.map(String)}
                        onChange={(ids) => setGrammarTypeIds(ids.map(Number))}
                        placeholder="Выберите типы"
                        isClearable
                        error={showErrors && selectedTypesCount === 0 ? 'Выберите хотя бы один грамматический тип' : undefined}
                        label="Грамматические типы"
                        isRequired
                    />
                    {selectedTypesCount > 1 && (
                        <div className={styles.warning}>
                            ⚠ Выбрано несколько грамматических типов — задание будет смешанным (Mixed). Смешивайте типы только если это нужно.
                        </div>
                    )}
                </div>

                {/* Курсы — мультиселект с возможностью создания нового курса */}
                <div className={styles.field}>
                    <CourseSelectMulti
                        options={courseOptions}
                        value={selectedCourseIds}
                        onChange={handleCourseChange}
                        placeholder={teacherCourses.length ? 'Выберите курсы' : 'Сначала создайте курс'}
                        isDisabled={coursesLoading}
                        ariaLabel="Курсы для задания"
                        onCreateCourse={createCourse}
                        label="Курсы"
                    />
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

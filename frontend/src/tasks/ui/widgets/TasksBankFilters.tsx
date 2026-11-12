import { BasePlusButtonLink } from '@/shared/ui-kit/BasePlusButtonLink/BasePlusButtonLink';
import { BaseSelectSingle } from '@/shared/ui-kit/BaseSelectSingle/BaseSelectSingle';
import { CourseSelectMulti } from '@/tasks/ui/widgets/CourseSelectMulti/CourseSelectMulti';
import { CEFR_LEVEL_OPTIONS, EXAM_TYPE_OPTIONS, ITEM_TYPE_OPTIONS } from '@/tasks/types';
import type { CefrLevel, ExamType, ItemType } from '@/tasks/types';
// todo: refactor to use its own styles or a common layout
import styles from '../views/TasksBankView/TasksBankView.module.scss';

export interface TasksBankFiltersProps {
    grammarTypes: { id: number; name: string }[];
    topicsForFilter: { id: number; name: string }[];
    grammarTypeId: number | null;
    itemType: ItemType | null;
    level: CefrLevel | null;
    examType: ExamType | null;
    topicId: number | null;
    courseIdsFilter: string[];
    includeMixed: boolean;
    courseOptions: { value: string; label: string }[];
    teacherCoursesLoading: boolean;
    onCreateCourse: (name: string) => Promise<string | null>;
    onChangeGrammarType: (value: number | null) => void;
    changeItemType: (value: ItemType | null) => void;
    changeLevel: (value: CefrLevel | null) => void;
    changeExamType: (value: ExamType | null) => void;
    changeTopic: (value: number | null) => void;
    changeCourseIds: (value: string[]) => void;
    changeIncludeMixed: (value: boolean) => void;
    onClearAll?: () => void;
    manageGrammarTypesTo?: '/tasks-bank/grammar-types';
    manageTopicsTo?: '/tasks-bank/topics';
}

export function TasksBankFilters({
    grammarTypes,
    topicsForFilter,
    grammarTypeId,
    itemType,
    level,
    examType,
    topicId,
    courseIdsFilter,
    includeMixed,
    courseOptions,
    teacherCoursesLoading,
    onCreateCourse,
    onChangeGrammarType,
    changeItemType,
    changeLevel,
    changeExamType,
    changeTopic,
    changeCourseIds,
    changeIncludeMixed,
    onClearAll,
    manageGrammarTypesTo,
    manageTopicsTo,
}: TasksBankFiltersProps) {
    return (
        <aside className={styles.filters}>
            {onClearAll && (
                <button type="button" className={styles.clearAllBtn} onClick={onClearAll}>
                    Сбросить всё
                </button>
            )}

            <div className={styles.filterBlock}>
                <div className={styles.filterLabel}>Грамматические типы</div>
                <div className={styles.filterRow}>
                    <BaseSelectSingle
                        options={[
                            { value: '', label: 'Все типы' },
                            ...grammarTypes.map((g) => ({ value: String(g.id), label: g.name })),
                        ]}
                        value={grammarTypeId != null ? String(grammarTypeId) : ''}
                        onChange={(v) => onChangeGrammarType(v ? Number(v) : null)}
                        placeholder="Все типы"
                        isClearable
                    />
                    {manageGrammarTypesTo && (
                        <BasePlusButtonLink to={manageGrammarTypesTo} ariaLabel="Управление справочником" />
                    )}
                </div>
            </div>

            <div className={styles.filterBlock}>
                <div className={styles.filterLabel}>Лексические темы</div>
                <div className={styles.filterRow}>
                    <BaseSelectSingle
                        options={[
                            { value: '', label: 'Все темы' },
                            ...topicsForFilter.map((t) => ({ value: String(t.id), label: t.name })),
                        ]}
                        value={topicId != null ? String(topicId) : ''}
                        onChange={(v) => changeTopic(v ? Number(v) : null)}
                        placeholder="Все темы"
                        isClearable
                    />
                    {manageTopicsTo && (
                        <BasePlusButtonLink to={manageTopicsTo} ariaLabel="Управление справочником" />
                    )}
                </div>
            </div>

            <div className={styles.filterBlock}>
                <div className={styles.filterLabel}>Механика пунктов</div>
                <BaseSelectSingle
                    options={[
                        { value: '', label: 'Все' },
                        ...ITEM_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
                    ]}
                    value={itemType ?? ''}
                    onChange={(v) => changeItemType(v || null)}
                    placeholder="Все"
                    isClearable
                />
            </div>

            <div className={styles.filterBlock}>
                <div className={styles.filterLabel}>Уровень языка</div>
                <BaseSelectSingle
                    options={[
                        { value: '', label: 'Все уровни' },
                        ...CEFR_LEVEL_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
                    ]}
                    value={level ?? ''}
                    onChange={(v) => changeLevel(v || null)}
                    placeholder="Все уровни"
                    isClearable
                />
            </div>

            <div className={styles.filterBlock}>
                <div className={styles.filterLabel}>Экзамен</div>
                <BaseSelectSingle
                    options={[
                        { value: '', label: 'Все экзамены' },
                        ...EXAM_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
                    ]}
                    value={examType ?? ''}
                    onChange={(v) => changeExamType(v || null)}
                    placeholder="Все экзамены"
                    isClearable
                />
            </div>

            <div className={styles.filterBlock}>
                <div className={styles.filterLabel}>Курсы</div>
                <CourseSelectMulti
                    options={courseOptions}
                    value={courseIdsFilter}
                    onChange={changeCourseIds}
                    placeholder="Все курсы"
                    isDisabled={teacherCoursesLoading}
                    ariaLabel="Фильтр по курсам"
                    onCreateCourse={onCreateCourse}
                />
            </div>

            <label className={styles.mixedToggle}>
                <input type="checkbox" checked={includeMixed} onChange={(e) => changeIncludeMixed(e.target.checked)} />
                <span>Включать смешанные задания</span>
            </label>
        </aside>
    );
}

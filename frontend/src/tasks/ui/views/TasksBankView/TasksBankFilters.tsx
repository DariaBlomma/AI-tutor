import { ChipsMultiselect } from '@/tasks/ui/widgets/ChipsMultiselect/ChipsMultiselect';
import { CourseSelectMulti } from '@/tasks/ui/widgets/CourseSelectMulti/CourseSelectMulti';
import { CEFR_LEVEL_OPTIONS, EXAM_TYPE_OPTIONS, ITEM_TYPE_OPTIONS } from '@/tasks/types';
import type { ChipItem } from '@/tasks/ui/widgets/ChipsMultiselect/types';
import type { CefrLevel, ExamType, ItemType } from '@/tasks/types';
import styles from './TasksBankView.module.scss';

const MECHANIC_ITEMS: ChipItem[] = ITEM_TYPE_OPTIONS.map((o, i) => ({ id: i + 1, name: o.label }));
const MECHANIC_BY_ID = new Map(MECHANIC_ITEMS.map((c, i) => [c.id, ITEM_TYPE_OPTIONS[i].value]));

const LEVEL_ITEMS: ChipItem[] = CEFR_LEVEL_OPTIONS.map((o, i) => ({ id: i + 1, name: o.label }));
const LEVEL_BY_ID = new Map(LEVEL_ITEMS.map((c, i) => [c.id, CEFR_LEVEL_OPTIONS[i].value]));

const EXAM_ITEMS: ChipItem[] = EXAM_TYPE_OPTIONS.map((o, i) => ({ id: i + 1, name: o.label }));
const EXAM_BY_ID = new Map(EXAM_ITEMS.map((c, i) => [c.id, EXAM_TYPE_OPTIONS[i].value]));

export interface TasksBankFiltersProps {
    isTeacher: boolean;
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
}

export function TasksBankFilters({
    isTeacher,
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
}: TasksBankFiltersProps) {
    return (
        <aside className={styles.filters}>
            <div className={styles.filterBlock}>
                <div className={styles.filterLabel}>Грамматические типы</div>
                <ChipsMultiselect
                    items={grammarTypes}
                    selectedIds={grammarTypeId == null ? [] : [grammarTypeId]}
                    single
                    onChange={(ids) => onChangeGrammarType(ids[0] ?? null)}
                    onClear={() => onChangeGrammarType(null)}
                    clearLabel="Все типы"
                    manageTo={isTeacher ? '/tasks-bank/grammar-types' : undefined}
                />
            </div>

            <div className={styles.filterBlock}>
                <div className={styles.filterLabel}>Лексические темы</div>
                <ChipsMultiselect
                    items={topicsForFilter}
                    selectedIds={topicId == null ? [] : [topicId]}
                    single
                    onChange={(ids) => changeTopic(ids[0] ?? null)}
                    onClear={() => changeTopic(null)}
                    clearLabel="Все темы"
                    manageTo={isTeacher ? '/tasks-bank/topics' : undefined}
                />
            </div>

            <div className={styles.filterBlock}>
                <div className={styles.filterLabel}>Механика пунктов</div>
                <ChipsMultiselect
                    items={MECHANIC_ITEMS}
                    selectedIds={itemType == null ? [] : [MECHANIC_ITEMS.findIndex((c) => MECHANIC_BY_ID.get(c.id) === itemType) + 1]}
                    single
                    onChange={(ids) => changeItemType(ids.length ? (MECHANIC_BY_ID.get(ids[0]) ?? null) : null)}
                    onClear={() => changeItemType(null)}
                    clearLabel="Все"
                />
            </div>

            <div className={styles.filterBlock}>
                <div className={styles.filterLabel}>Уровень языка</div>
                <ChipsMultiselect
                    items={LEVEL_ITEMS}
                    selectedIds={level == null ? [] : [LEVEL_ITEMS.findIndex((c) => LEVEL_BY_ID.get(c.id) === level) + 1]}
                    single
                    onChange={(ids) => changeLevel(ids.length ? (LEVEL_BY_ID.get(ids[0]) ?? null) : null)}
                    onClear={() => changeLevel(null)}
                    clearLabel="Все уровни"
                />
            </div>

            <div className={styles.filterBlock}>
                <div className={styles.filterLabel}>Экзамен</div>
                <ChipsMultiselect
                    items={EXAM_ITEMS}
                    selectedIds={examType == null ? [] : [EXAM_ITEMS.findIndex((c) => EXAM_BY_ID.get(c.id) === examType) + 1]}
                    single
                    onChange={(ids) => changeExamType(ids.length ? (EXAM_BY_ID.get(ids[0]) ?? null) : null)}
                    onClear={() => changeExamType(null)}
                    clearLabel="Все экзамены"
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

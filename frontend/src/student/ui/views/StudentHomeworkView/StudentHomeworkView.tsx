import { useCallback } from 'react';
import { StudentHomeworkFilters } from '@/student/ui/widgets/StudentHomeworkFilters/StudentHomeworkFilters';
import { TaskAssignmentItem } from '@/task/ui/base/TaskAssignmentItem';
import { StudentHomeworkProgressBar } from '@/student/ui/base/StudentHomeworkProgressBar/StudentHomeworkProgressBar';
import { useTaskFilters } from '@/task/hooks/useTaskFilters';
import { useStudentHomeworkData } from '@/student/hooks/useStudentHomeworkData';
import { useMappedHomework } from '@/student/hooks/useMappedHomework';
import { Loader } from '@/shared/ui-kit/Loader/Loader';
import { Pagination } from '@/shared/ui-kit/Pagination/Pagination';
import type { DatePreset } from '@/student/utils/datePresets.ts';
import type { FilterChipType } from '@/task/types/ui';
import styles from './StudentHomeworkView.module.scss';

export function StudentHomeworkView() {
    const { statusFilter, setStatusFilter, datePreset, setDatePreset, dateRange, setDateRange, page, setPage, apiParams } = useTaskFilters();

    // Сброс на первую страницу при смене статуса или даты
    const handleStatusChange = useCallback((status: FilterChipType) => {
        setStatusFilter(status);
        setPage(0);
    }, [setStatusFilter, setPage]);

    const handleDatePresetChange = useCallback((preset: DatePreset) => {
        setDatePreset(preset);
        setPage(0);
    }, [setDatePreset, setPage]);

    const handleDatePresetClear = useCallback(() => {
        setDatePreset('all');
        setDateRange({ from: null, to: null });
        setPage(0);
    }, [setDatePreset, setDateRange, setPage]);

    const { works, totalElements, totalPages, isLoading, isError } = useStudentHomeworkData({
        ...apiParams,
        page,
    });

    const cards = useMappedHomework(works);

    if (isError) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>Ошибка загрузки данных</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Заголовок */}
            <div className={styles.header}>
                <h1>Домашние задания</h1>
            </div>

            {/* Фильтры */}
            <StudentHomeworkFilters
                statusFilter={statusFilter}
                onStatusChange={handleStatusChange}
                datePreset={datePreset}
                onDatePresetChange={handleDatePresetChange}
                onDatePresetClear={handleDatePresetClear}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
            />

            {/* Список работ */}
            {isLoading ? (
                <div className={styles.loading}>
                    <Loader />
                </div>
            ) : works.length === 0 ? (
                <div className={styles.empty}>Нет заданий</div>
            ) : (
                <div className={styles.list}>
                    {cards.map((card) => {
                        const work = works.find((w) => w.id === card.id);
                        const completedItems = work?.completedItems ?? 0;
                        const totalItems = work?.totalItems ?? 0;

                        return (
                            <TaskAssignmentItem
                                key={card.id}
                                card={card}
                                showProgress={
                                    totalItems > 0 ? (
                                        <StudentHomeworkProgressBar completed={completedItems} total={totalItems} />
                                    ) : undefined
                                }
                            />
                        );
                    })}
                </div>
            )}

            {/* Пагинация */}
            {!isLoading && totalPages >= 1 && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    totalCount={totalElements}
                    onPageChange={setPage}
                />
            )}
        </div>
    );
}

import { useCallback } from 'react';
import { StudentHomeworkFilters } from '@/student/ui/widgets/HomeworkFilters/StudentHomeworkFilters';
import { StudentAssignmentItem } from '@/student/ui/components/AssignmentItem/StudentAssignmentItem';
import { StudentHomeworkProgressBar } from '@/student/ui/base/HomeworkProgressBar/StudentHomeworkProgressBar';
import { useTaskFilters } from '@/tasks/hooks/useTaskFilters';
import { useStudentHomeworkData } from '@/student/hooks/useStudentHomeworkData';
import { Loader } from '@/shared/ui-kit/Loader/Loader';
import { Pagination } from '@/shared/ui-kit/Pagination/Pagination';
import type { DashboardAssignment } from '@/student/types/models/dashboard';
import type { DatePreset } from '@/student/lib/datePresets';
import type { FilterChipType } from '@/tasks/types/ui';
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

    const { works, totalElements, totalPages, isLoading, isError } = useStudentHomeworkData({
        ...apiParams,
        page,
    });

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
                    {works.map((work) => {
                        const completedItems = work.completedItems ?? 0;
                        const totalItems = work.totalItems ?? 0;
                        const assignment: DashboardAssignment = {
                            id: work.id,
                            taskPublicId: work.taskPublicId,
                            taskName: work.taskName,
                            status: work.status,
                            rawStatus: work.status,
                            deadline: work.deadline,
                            createdAt: work.createdAt,
                            levels: work.levels,
                            taskTypes: work.taskTypes,
                            topics: work.topics,
                            itemTypes: work.itemTypes,
                            isMixed: work.isMixed,
                        };

                        return (
                            <StudentAssignmentItem
                                key={work.id}
                                assignment={assignment}
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

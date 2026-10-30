import styles from './TeacherReportsView.module.scss';
import { useCallback } from 'react';
import { Loader } from '@/shared/ui-kit/Loader/Loader';
import { TeacherReportsService } from '@/teacher/services/TeacherReportsService';
import { useTeacherReports } from '@/teacher/hooks/useTeacherReports';
import type { StudentReportSummary } from '@/teacher/types';
import { getInitials } from '@/shared/utils/getInitials';

export function TeacherReportsView() {
    const fetchReports = useCallback(
        () => TeacherReportsService.getReportsOverview(),
        []
    );
    const { reports, isLoading, isError } = useTeacherReports(fetchReports);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Отчёты</h1>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionTitle}>Мои ученики</div>

                {isLoading && <Loader />}
                {isError && <div className={styles.error}>Не удалось загрузить отчёты.</div>}
                {!isLoading && !isError && !reports.length && <div className={styles.notice}>Нет учеников</div>}


                {!isLoading && !isError && (
                    <div className={styles.studentList}>
                        {reports.map((student) => (
                            <StudentReportRow key={student.studentId} student={student}/>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Строка уровня 1: аватар-инициалы, имя, email и счётчики активных назначений.
function StudentReportRow({ student }: { student: StudentReportSummary }) {
    return (
        <div className={styles.studentItem}>
            <div className={styles.studentAvatar}>{getInitials(student.studentName)}</div>
            <div className={styles.studentInfo}>
                <div className={styles.studentName}>{student.studentName}</div>
                <div className={styles.studentEmail}>{student.email}</div>
            </div>
            <div className={styles.studentMetrics}>
                <div className={styles.metric}>
                    <span className={styles.metricLabel}>Назначено: </span>
                    <span className={`${styles.metricValue} ${styles.highlight}`}>{student.assignedCount}</span>
                </div>
                <div className={styles.metric}>
                    <span className={styles.metricLabel}>В процессе: </span>
                    <span className={styles.metricValue}>{student.inProgressCount}</span>
                </div>
            </div>
        </div>
    );
}

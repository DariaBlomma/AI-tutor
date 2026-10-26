import styles from './TeacherReportsView.module.scss';
import { useCallback } from 'react';
import { TeacherReportsService } from '@/teacher/services/TeacherReportsService';
import { useTeacherReports } from '@/teacher/hooks/useTeacherReports';
import { MOCK_TEACHER_REPORTS } from '@/teacher/data/reports';
import type { StudentReportSummary } from '@/teacher/types';

// Флаг временной верстки: true — показывать моковый список учеников,
// false — скрыть всё, что оживёт только в будущих релизах.
const SHOW_TMP_DATA = true;

// Инициалы для аватара: первые буквы имени и фамилии (Иван Петров -> ИП).
function getInitials(studentName: string): string {
    return studentName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .join('');
}

export function TeacherReportsView() {
    // Мок возвращаем из колбэка, пока SHOW_TMP_DATA=true — при переключении на
    // реальные данные достаточно поменять fetcher на TeacherReportsService.getReportsOverview.
    const fetchReports = useCallback(
        () =>
            SHOW_TMP_DATA
                ? Promise.resolve(MOCK_TEACHER_REPORTS)
                : TeacherReportsService.getReportsOverview(),
        [],
    );
    const { reports, isLoading, isError } = useTeacherReports(fetchReports);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Отчёты</h1>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionTitle}>Мои ученики</div>

                {isLoading && <div className={styles.notice}>Загрузка…</div>}
                {isError && <div className={styles.notice}>Не удалось загрузить отчёты.</div>}

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

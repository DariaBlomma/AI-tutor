import styles from './TeacherReportsView.module.scss';
import { getInitials } from '@/shared/utils/getInitials';
import type { StudentReportSummary } from '@/teacher/types';

interface StudentReportRowProps {
    student: StudentReportSummary;
}

// Строка уровня 1: аватар-инициалы, имя, email и счётчики активных назначений.
export function StudentReportRow({ student }: StudentReportRowProps) {
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

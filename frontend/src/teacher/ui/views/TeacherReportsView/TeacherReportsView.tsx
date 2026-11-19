import styles from './TeacherReportsView.module.scss';
import { useCallback } from 'react';
import { Loader } from '@/shared/ui-kit/Loader/Loader';
import { TeacherReportsService } from '@/teacher/services/TeacherReportsService';
import { useTeacherReports } from '@/teacher/hooks/useTeacherReports';
import { StudentReportRow } from './StudentReportRow';

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

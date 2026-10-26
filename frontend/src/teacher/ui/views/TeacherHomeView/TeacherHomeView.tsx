import styles from './TeacherHomeView.module.scss';
import { useTeacherName } from '@/teacher/hooks/useTeacherName';
import { MOCK_TEACHER_LESSONS, MOCK_TEACHER_STATS } from '@/teacher/data';

// Флаг временной верстки: true — показывать моковые блоки (уроки/действия/статистика),
// false — скрыть всё, что оживёт только в будущих релизах.
const SHOW_TMP_DATA = true;

export function TeacherHomeView() {
    // Имя учителя — с бэкенда (логика вынесена в хук teacher/hooks/useTeacherName).
    const teacherName = useTeacherName();

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Доброе утро, {teacherName}</h1>
                {SHOW_TMP_DATA && <p>{MOCK_TEACHER_STATS.lessonsCountToday} урока сегодня</p>}
            </div>

            {SHOW_TMP_DATA && (
                <>
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Ближайшие уроки</div>
                        <div className={styles.lessonsCard}>
                            {MOCK_TEACHER_LESSONS.map((lesson) => (
                                <div key={lesson.id} className={styles.lessonItem}>
                                    <div className={styles.lessonAvatar}>{lesson.initials}</div>
                                    <div className={styles.lessonInfo}>
                                        <div className={styles.lessonName}>{lesson.name}</div>
                                        <div className={styles.lessonMeta}>{lesson.meta}</div>
                                    </div>
                                    <div className={styles.lessonTime}>{lesson.time}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Быстрые действия</div>
                        <div className={styles.btnRow}>
                            <button type="button" className={styles.btn}>Назначить ДЗ</button>
                        </div>
                    </div>

                    <div className={styles.statsGrid}>
                        {/* Первый треугольник: △ (вершиной вверх) — Уроков */}
                        <div className={styles.statCard}>
                            <svg viewBox="0 0 368 320" preserveAspectRatio="xMidYMid meet">
                                <polygon className={styles.statTriangle} points="184,20 328,300 40,300"/>
                                <text className={styles.statValue} x="184" y="160">{MOCK_TEACHER_STATS.lessons.value}</text>
                                <text className={styles.statLabel} x="184" y="230">{MOCK_TEACHER_STATS.lessons.label}</text>
                                <text className={styles.statChange} x="184" y="280">{MOCK_TEACHER_STATS.lessons.change}</text>
                            </svg>
                        </div>
                        {/* Второй треугольник: ▽ (вершиной вниз) — Доход */}
                        <div className={styles.statCard}>
                            <svg viewBox="0 0 368 320" preserveAspectRatio="xMidYMid meet">
                                <polygon className={styles.statTriangle} points="40,20 328,20 184,300"/>
                                <text className={styles.statLabel} x="184" y="100">{MOCK_TEACHER_STATS.income.label}</text>
                                <text className={styles.statValue} x="184" y="200">{MOCK_TEACHER_STATS.income.value}</text>
                                <text className={styles.statChange} x="184" y="260">{MOCK_TEACHER_STATS.income.change}</text>
                            </svg>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

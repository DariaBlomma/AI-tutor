import type { TeacherLesson } from '@/teacher/types/home';

// Мок-данные главной учителя: заглушки до будущих релизов (см. SHOW_TMP_DATA).
export const MOCK_TEACHER_LESSONS: TeacherLesson[] = [
    { id: 1, initials: 'ИП', name: 'Иван Петров', meta: 'IELTS · B2', time: '10:00' },
    { id: 2, initials: 'МС', name: 'Мария Сидорова', meta: 'Business · C1', time: '12:00' },
];

export const MOCK_TEACHER_STATS = {
    lessonsCountToday: 4,
    lessons: { value: '47', label: 'Уроков', change: '+12%' },
    income: { label: 'Доход', value: '₽84.5K', change: '+8%' },
};

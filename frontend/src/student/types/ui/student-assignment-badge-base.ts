export interface StudentAssignmentBadgeItem {
    studentId: number;
    studentName: string;
    lastName?: string;
}

export interface StudentAssignmentBadgeBaseProps {
    /** Число активных назначений (для иконки). */
    count: number;
    /** Список учеников с активными назначениями (для попапа). */
    assignments: StudentAssignmentBadgeItem[] | null;
    /** Загрузка данных. */
    isLoading: boolean;
}

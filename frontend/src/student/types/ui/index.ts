import type { StudentWorkResponse } from '@/student/services/StudentDashboardService.ts';
import type { StudentWorkCard } from '@/student/types/models/studentWorkCard.ts';
import type { FilterChipType } from '@/task/types/ui';
import type { DatePreset, DateRange } from '@/student/utils/datePresets.ts';
import type { UITaskStatus } from '@/task/types/ui';
import type { ReactNode } from 'react';

export interface StudentHomeworkItemProps {
    work: StudentWorkResponse;
    onClick: () => void;
}

export interface StudentHomeworkProgressBarProps {
    completed: number;
    total: number;
}

export interface StudentSectionProps {
    title: string;
    count: number;
    children: ReactNode;
}

export interface StudentStatusBadgeProps {
    type: UITaskStatus;
    children?: ReactNode;
}

export interface StudentHomeworkFiltersProps {
    statusFilter: FilterChipType;
    onStatusChange: (status: FilterChipType) => void;
    datePreset: DatePreset;
    onDatePresetChange: (preset: DatePreset) => void;
    onDatePresetClear: () => void;
    dateRange: DateRange;
    onDateRangeChange: (range: DateRange) => void;
}

export interface StudentAssignmentListProps {
    block1: StudentWorkCard[]; // «Нужно сделать»
    block2: StudentWorkCard[]; // «Новые задания»
    isLoading: boolean;
}

export interface StudentHomeworkListProps {
    works: StudentWorkResponse[];
    isLoading: boolean;
    onItemPress: (workId: number) => void;
}

export interface WorkExecutionViewProps {
    workId: string;
}

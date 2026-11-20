package com.aitutor.backend.dto.student;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Статистика ученика за текущий календарный месяц.
 * Считается по заданиям, у которых дедлайн попадает в текущий месяц.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDashboardStatsResponse {

    /** Количество выполненных заданий (COMPLETED) за текущий месяц. */
    private Integer completedCount;

    /** Количество заданий в процессе (ASSIGNED + IN_PROGRESS) за текущий месяц. */
    private Integer inProgressCount;

    /** Количество просроченных заданий (EXPIRED) за текущий месяц. */
    private Integer overdueCount;
}

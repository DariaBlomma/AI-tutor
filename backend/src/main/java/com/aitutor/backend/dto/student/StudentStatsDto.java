package com.aitutor.backend.dto.student;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Агрегированная статистика ученика для профиля (поле stats у UserResponse).
 * Считается по всем невыполненным назначениям ученика (student_work, deleted_at IS NULL):
 * - completedCount — работы в статусе COMPLETED;
 * - avgTimeSeconds — среднее время решения (completed_at − started_at) по завершённым работам,
 *   null если завершённых работ ещё нет;
 * - errorsCount — пункты, где ФИНАЛЬНЫЙ ответ ученика не совпал с эталоном
 *   (та же логика, что countFinalErrors в отчётах учителя), по всем работам с прогрессом.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentStatsDto {

    private Integer completedCount;

    /** Среднее время решения одной завершённой работы, секунды; null — нет завершённых работ. */
    private Long avgTimeSeconds;

    private Integer errorsCount;
}

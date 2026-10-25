package com.aitutor.backend.dto.student;

import com.aitutor.backend.enums.WorkStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Итог выполненной работы для экрана «Результаты» ученика (GET .../summary).
 * Агрегаты берутся из student_work (записаны при complete); для незавершённой
 * работы считаются по текущему прогрессу, durationSeconds = null до COMPLETED.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentWorkSummaryResponse {

    private Long workId;
    private String taskName;
    private WorkStatus status;
    private Instant startedAt;
    private Instant completedAt;
    /** Время решения (completedAt - startedAt), секунды; null — работа не завершена. */
    private Long durationSeconds;

    private Integer totalItems;
    /** Пункты, закрытые как SOLVED на текущий момент. */
    private Integer solvedItems;
    /** Верно с первой попытки (без подсказок и повторов). */
    private Integer firstTryCorrect;
    /** Решённые пункты, где были повторные попытки или подсказки. */
    private Integer correctAfterHints;
    /** Суммарно использованных подсказок по работе. */
    private Integer totalHintsGiven;
}

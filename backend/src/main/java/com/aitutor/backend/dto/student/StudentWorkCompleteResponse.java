package com.aitutor.backend.dto.student;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/** Итоговая статистика выполненной работы (ответ POST .../complete). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentWorkCompleteResponse {

    private Long workId;
    private Instant completedAt;
    private Integer totalItems;
    /** Пункты, решённые верно с первой попытки. */
    private Integer firstTryCorrect;
    /** Решённые пункты, где пришлось использовать подсказки или повторные попытки. */
    private Integer correctAfterHints;
    /** Суммарно выданных подсказок по работе. */
    private Integer totalHintsGiven;
}

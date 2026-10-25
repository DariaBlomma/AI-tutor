package com.aitutor.backend.dto.student;

import com.aitutor.backend.enums.ItemProgressStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Прогресс ученика по одному пункту задания (student_work_item_progress) —
 * только счётчики и статус, без эталонного ответа. Используется в StudentWorkDetailResponse.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentItemProgressDto {

    private Long taskItemId;
    private ItemProgressStatus status;
    private Integer answerAttempts;
    private Integer hintsGiven;
    /** Сколько подсказок ещё можно запросить по пункту (0 — лимит исчерпан). */
    private Integer hintsRemaining;
    private String lastAnswer;
}

package com.aitutor.backend.dto.student;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Ответ ученика по одному пункту для серверной проверки (POST .../items/{itemId}/submit).
 * Фронт присылает ТОЛЬКО ответ — вердикт выносит бэкенд через AnswerChecker.
 * Поле hintsUsed — будущий канал от ИИ-флоу (Этап 4): сколько подсказок уже выдано по пункту.
 * Сейчас ИИ не подключён, поэтому обычно 0.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentSubmitAnswerRequest {

    @NotBlank(message = "Ответ не может быть пустым")
    @Size(max = 100, message = "Ответ слишком длинный (максимум 100 символов)")
    private String answer;

    /** Сколько подсказок использовано по этому пункту на момент сдачи ответа (0..3). */
    @Builder.Default
    private Integer hintsUsed = 0;
}

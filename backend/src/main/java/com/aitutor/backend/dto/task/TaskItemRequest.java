package com.aitutor.backend.dto.task;

import com.aitutor.backend.enums.ItemType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskItemRequest {

    @NotNull(message = "Тип пункта обязателен")
    private ItemType itemType;

    /**
     * Основной текст вопроса. Для WORD_FORMATION/GAP_FILL содержит пропуск "___";
     * для TFNS — само утверждение; для MATCHING не используется (пара — в content).
     */
    private String prompt;

    private String correctAnswer;   // NULL для free-form/ИИ-проверки

    private String content;         // JSON-строка со спецификой формата (см. README: «Формат контента заданий»)
}
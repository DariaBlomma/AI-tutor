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

    @NotBlank(message = "Текст вопроса обязателен")
    private String prompt;

    private String correctAnswer;   // NULL для free-form/ИИ-проверки

    private String content;         // JSON-строка со спецификой формата
}
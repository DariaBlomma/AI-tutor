package com.aitutor.backend.dto.student;

import com.aitutor.backend.enums.ItemType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Пункт задания для экрана выполнения учеником.
 * ВАЖНО: correctAnswer намеренно отсутствует — эталонные ответы не покидают бэкенд
 * (сверку выполняет ИИ, которому бэкенд передаёт ответ напрямую сервер-сервер).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentTaskItemDto {

    private Long id;
    private ItemType itemType;
    private String prompt;
    /** JSONB-контент пункта (например, предложение с пропусками для Word Formation). */
    private String content;
    private Integer position;
}

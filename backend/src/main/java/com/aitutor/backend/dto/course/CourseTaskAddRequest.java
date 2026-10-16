package com.aitutor.backend.dto.course;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Добавление задания из банка в курс.
 * position опциональна: null — в конец (как «добавить в плейлист»).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseTaskAddRequest {

    @NotNull(message = "id задания обязателен")
    private Long taskId;

    private Integer position;
}

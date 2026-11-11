package com.aitutor.backend.dto.task;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

/**
 * Обновление только курсовой привязки задания.
 * PUT /api/tasks/{id} с { courseIds: [...] } — полная синхронизация.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskCourseIdsRequest {

    @NotEmpty(message = "Список courseIds обязателен")
    private Set<Long> courseIds;
}

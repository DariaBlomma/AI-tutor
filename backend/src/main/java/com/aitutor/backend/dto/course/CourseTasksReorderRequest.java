package com.aitutor.backend.dto.course;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Новый порядок заданий курса после drag-and-drop на фронте:
 * просто список id заданий, позиция = индекс в списке (0..N-1).
 * Список должен содержать ВСЕ задания курса — частичные перестановки не принимаются
 * (валидируется в CourseService).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseTasksReorderRequest {

    @NotEmpty(message = "Список id заданий обязателен")
    private List<Long> taskIds;
}

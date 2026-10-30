package com.aitutor.backend.dto.task;

import com.aitutor.backend.enums.CefrLevel;
import com.aitutor.backend.enums.ExamType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskCreateRequest {

    /** Необязательное название: пустое = в UI показывается publicId. */
    @Size(max = 200, message = "Название не длиннее 200 символов")
    private String name;

    /** Необязательная инструкция для ученика («что нужно сделать»), есть у любого типа заданий. */
    @Size(max = 1000, message = "Инструкция не длиннее 1000 символов")
    private String instruction;

    private String context;   // JSON-строка: общий текст/списки, если нужны

    @NotEmpty(message = "Добавьте хотя бы один пункт задания")
    @Valid
    private List<TaskItemRequest> items;

    /** Уровни CEFR задания: минимум один (миграция 021). */
    @NotEmpty(message = "Выберите хотя бы один уровень языка")
    private Set<CefrLevel> levels;

    /** Тип экзамена: OGE / EGE (nullable = не указан) — фильтр банка заданий. */
    private ExamType examType;

    private Set<Long> topicIds;

    @NotEmpty(message = "Выберите хотя бы один тип задания")
    private Set<Long> taskTypeIds;
}
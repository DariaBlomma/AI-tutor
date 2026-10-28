package com.aitutor.backend.dto.task;

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

    private String context;   // JSON-строка: общий текст/списки, если нужны

    @NotEmpty(message = "Добавьте хотя бы один пункт задания")
    @Valid
    private List<TaskItemRequest> items;

    private Set<Long> topicIds;

    @NotEmpty(message = "Выберите хотя бы один тип задания")
    private Set<Long> taskTypeIds;
}
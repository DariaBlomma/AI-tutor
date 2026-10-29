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
public class TaskUpdateRequest {

    /** Необязательное название: пустое = в UI показывается publicId. */
    @Size(max = 200)
    private String name;

    /** Необязательная инструкция; пустое значение очищает поле (edit in place). */
    @Size(max = 1000)
    private String instruction;

    private String context;

    /** Полный список пунктов: старые, отсутствующие в запросе, удаляются (orphanRemoval). */
    @NotEmpty(message = "Добавьте хотя бы один пункт задания")
    @Valid
    private List<TaskItemRequest> items;

    private Set<Long> topicIds;

    @NotEmpty(message = "Выберите хотя бы один тип задания")
    private Set<Long> taskTypeIds;
}

package com.aitutor.backend.dto.task;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
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

    @NotBlank(message = "Название задания обязательно")
    @Size(max = 200)
    private String name;

    private String context;

    /** Полный список пунктов: старые, отсутствующие в запросе, удаляются (orphanRemoval). */
    @NotEmpty(message = "Добавьте хотя бы один пункт задания")
    @Valid
    private List<TaskItemRequest> items;

    private Set<Long> topicIds;

    @NotEmpty(message = "Выберите хотя бы один тип задания")
    private Set<Long> taskTypeIds;
}

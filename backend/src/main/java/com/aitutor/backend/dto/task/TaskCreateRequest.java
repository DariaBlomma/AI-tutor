package com.aitutor.backend.dto.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskCreateRequest {

    @NotBlank(message = "Название задания обязательно")
    @Size(max = 200, message = "Название не длиннее 200 символов")
    private String name;

    @NotEmpty(message = "Выберите хотя бы одну тему")
    private Set<Long> topicIds;

    @NotEmpty(message = "Выберите хотя бы один тип задания")
    private Set<Long> taskTypeIds;
}
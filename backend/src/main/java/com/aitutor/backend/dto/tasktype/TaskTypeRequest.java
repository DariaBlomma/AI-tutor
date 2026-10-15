package com.aitutor.backend.dto.tasktype;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskTypeRequest {

    @NotBlank(message = "Название типа задания обязательно")
    @Size(max = 100, message = "Название не длиннее 100 символов")
    private String name;

    @Size(max = 1000, message = "Описание не длиннее 1000 символов")
    private String description;
}
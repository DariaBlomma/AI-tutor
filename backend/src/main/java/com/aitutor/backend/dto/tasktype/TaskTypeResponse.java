package com.aitutor.backend.dto.tasktype;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskTypeResponse {
    private Long id;
    private String name;
    private String description;
    private String instruction;
    private Boolean isActive;
}
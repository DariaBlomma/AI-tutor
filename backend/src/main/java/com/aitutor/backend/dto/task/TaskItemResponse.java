package com.aitutor.backend.dto.task;

import com.aitutor.backend.enums.ItemType;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskItemResponse {
    private Long id;
    private ItemType itemType;
    private String prompt;
    private String correctAnswer;
    private String content;
    private Integer position;
}
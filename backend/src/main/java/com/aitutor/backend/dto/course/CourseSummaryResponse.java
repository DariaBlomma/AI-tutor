package com.aitutor.backend.dto.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/** Строка списка «Мои курсы»: мета + количество заданий, без состава. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseSummaryResponse {

    private Long id;
    private String name;
    private Integer taskCount;
    private Instant createdAt;
    private Instant updatedAt;
}

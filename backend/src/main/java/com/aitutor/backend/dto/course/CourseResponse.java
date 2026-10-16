package com.aitutor.backend.dto.course;

import com.aitutor.backend.dto.task.TaskSummaryResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/** Детали курса: состав заданий, упорядоченный по position (ученик идёт по ним как по урокам). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponse {

    private Long id;
    private String name;
    private Instant createdAt;
    private Instant updatedAt;

    /** Лёгкие карточки заданий банка (без контента) в порядке курса. */
    private List<OrderedTask> tasks;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderedTask {
        private Integer position;
        private TaskSummaryResponse task;
    }
}

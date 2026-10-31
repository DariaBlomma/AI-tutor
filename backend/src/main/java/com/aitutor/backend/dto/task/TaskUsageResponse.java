package com.aitutor.backend.dto.task;

import lombok.*;

/**
 * Факт использования задания учениками (GET /api/tasks/{id}/usage) — основа для
 * блокировки «содержательных» полей на странице редактирования: если задание кому-то
 * назначено или уже решено, править текст/пункты/ответы нельзя (см. TaskService#update).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskUsageResponse {
    /** Есть хотя бы одно незавершённое назначение (ASSIGNED / IN_PROGRESS). */
    private boolean hasActiveAssignments;
    /** Есть хотя бы одна сдача (COMPLETED), в том числе по ранее удалённому назначению. */
    private boolean hasSubmissions;
}

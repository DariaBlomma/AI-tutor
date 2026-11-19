package com.aitutor.backend.dto.task;

/** Ответ на GET /api/tasks/{id}/assignments — ученики с активными назначениями. */
public record TaskAssignmentDto(
        Long studentId,
        String studentName,
        String lastName
) {}

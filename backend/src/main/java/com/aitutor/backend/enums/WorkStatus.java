package com.aitutor.backend.enums;

/**
 * Статус назначения задания ученику (student_work.status).
 * Оценок в системе нет — только факт выполнения:
 * ASSIGNED   — назначено учителем, ученик ещё не начинало;
 * IN_PROGRESS — ученик начал выполнение (пишется на фронте выполнения, отдельная фича);
 * COMPLETED  — выполнено;
 * CANCELLED  — отменено учителем;
 * EXPIRED    — дедлайн истёк, автоперевод фоновой задачей.
 */
public enum WorkStatus {
    ASSIGNED,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED,
    EXPIRED
}

package com.aitutor.backend.enums;

/**
 * Статус выполнения одного пункта задания (student_work_item_progress.status).
 * NOT_STARTED — назначен, но ученик ещё не открывал пункт;
 * IN_PROGRESS — ученик вводит ответы (есть попытки, но пункт не решён);
 * SOLVED      — пункт решён верно (или завершён по лимиту попыток — см. фичу выполнения).
 */
public enum ItemProgressStatus {
    NOT_STARTED,
    IN_PROGRESS,
    SOLVED
}

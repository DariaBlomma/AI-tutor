package com.aitutor.backend.enums;

/**
 * Статус выполнения одного пункта задания (student_work_item_progress.status).
 * NOT_STARTED — назначен, но ученик ещё не открывал пункт;
 * IN_PROGRESS — ученик вводит ответы (есть попытки, но пункт не решён);
 * SOLVED      — пункт решён верно (ответ совпал с эталоном);
 * FAILED      — исчерпан лимит подсказок, ответ неверный, пункт закрыт.
 */
public enum ItemProgressStatus {
    NOT_STARTED,
    IN_PROGRESS,
    SOLVED,
    FAILED
}

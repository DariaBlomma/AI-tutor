package com.aitutor.backend.services.student.checking;

import com.aitutor.backend.entities.TaskItem;

/**
 * Стратегия проверки ответа ученика по одному пункту задания.
 * Сейчас единственная реализация — {@link ExactMatchChecker} (детерминированное сравнение).
 * Подготовка под будущий ИИ: AI-проверка (свободные форматы, подсказки) подключается
 * новой реализацией этого же интерфейса без изменения сервиса и контроллера —
 * вердикт о правильности всегда выносит код на бэкенде, ИИ статистку не искажает.
 */
public interface AnswerChecker {

    /** Поддерживается ли данный формат пункта этой стратегией. */
    boolean supports(TaskItem item);

    /** Сверка ответа ученика с эталоном. Нормализацию выполняет реализация. */
    CheckResult check(TaskItem item, String studentAnswer);
}

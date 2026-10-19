package com.aitutor.backend.services.student.checking;

/**
 * Результат серверной сверки одного ответа: вердикт + нормализованный ответ ученика
 * (его пишем в student_answer прогресса, чтобы отчёты сравнивали корректно).
 * Эталонный ответ в результат НЕ кладём — он не покидает бэкенд.
 */
public record CheckResult(boolean correct, String normalizedStudentAnswer) {
}

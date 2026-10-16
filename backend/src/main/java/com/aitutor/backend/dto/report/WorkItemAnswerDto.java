package com.aitutor.backend.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Одна позиция выполненного задания в деталях отчёта (уровень 3):
 * текст пункта, эталонный ответ и финальный ответ ученика.
 * Правильные ответы показываем всегда — по решению заказчика.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkItemAnswerDto {

    private Long taskItemId;
    private Integer position;

    /** Формат пункта (WORD_FORMATION и т.п.) — определяет, что лежит в content. */
    private String itemType;

    private String prompt;

    /** Дополнительный JSONB-контент пункта (варианты, подсказки) — как в банке заданий. */
    private String content;

    /** Эталон (может быть null для free-form форматов). */
    private String correctAnswer;

    /** Последний введённый учеником ответ. */
    private String studentAnswer;

    /** Верно ли значение studentAnswer (нерегистросравнение с correctAnswer). */
    private boolean correct;

    /** Всего попыток по позиции (все попытки, не только финал). */
    private Integer attemptsCount;

    /** Сколько подсказок использовано (0..3). */
    private Integer hintsGiven;
}

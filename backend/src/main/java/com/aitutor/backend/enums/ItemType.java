package com.aitutor.backend.enums;

public enum ItemType {
    WORD_FORMATION,   // словообразование: prompt с ___ , answer из скобочной формы
    GAP_FILL,         // грамматический пропуск / выбор из опций
    OPEN_GAP,         // пропуск без вариантов (лексика)
    TFNS,             // true / false / not stated по тексту (текст — в tasks.context)
    MATCHING,         // соединение заголовков и частей текста (списки — в tasks.context)
    TRANSLATION,      // перевод предложения (проверка на стороне ИИ, correct_answer = NULL)
    FREE_TEXT         // любой free-form ответ с ИИ-проверкой
}
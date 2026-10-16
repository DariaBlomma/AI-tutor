package com.aitutor.backend.enums;

public enum ItemType {
    WORD_FORMATION,   // словообразование: prompt с ___ , answer из скобочной формы
    GAP_FILL,         // грамматический пропуск / выбор из опций
    TFNS,             // true / false / not stated: утверждение в prompt, материал (текст/аудио) — в tasks.context
    MATCHING          // соединение заголовков и частей текста: одна пара = один пункт, материал — в tasks.context
}
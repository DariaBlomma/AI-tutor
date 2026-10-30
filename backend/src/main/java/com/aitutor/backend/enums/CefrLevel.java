package com.aitutor.backend.enums;

/**
 * Уровень CEFR задания (фильтр банка заданий). Хранится как строка (EnumType.STRING),
 * значения совпадают с common_name из справочника CEFR (A1..C1).
 */
public enum CefrLevel {
    A1,
    A2,
    B1,
    B2,
    C1
}

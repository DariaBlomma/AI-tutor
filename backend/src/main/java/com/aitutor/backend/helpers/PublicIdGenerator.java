package com.aitutor.backend.helpers;

/**
 * Генератор публичных идентификаторов для отображения в UI (TSK-000123).
 * Формируется из внутреннего id сущности сразу после persist.
 */
public final class PublicIdGenerator {

    private PublicIdGenerator() {
    }

    public static String nextTaskId(Long id) {
        return format("TSK", id);
    }

    private static String format(String prefix, Long id) {
        if (id == null) {
            throw new IllegalStateException("Internal id must be generated before public id");
        }
        return prefix + "-" + String.format("%06d", id);
    }
}

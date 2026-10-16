package com.aitutor.backend.helpers;

import java.security.SecureRandom;

/**
 * Генератор кода учителя для ссылки-приглашения (T-XXXXXX).
 * Формат: префикс T + 6 символов из алфавита без похожих (0/O, 1/I/L), чтобы код было удобно вводить с телефона.
 */
public final class TeacherCodeGenerator {

    private static final char[] ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ".toCharArray();
    private static final int LENGTH = 6;
    private static final SecureRandom RANDOM = new SecureRandom();

    private TeacherCodeGenerator() {
    }

    public static String next() {
        StringBuilder sb = new StringBuilder("T-");
        for (int i = 0; i < LENGTH; i++) {
            sb.append(ALPHABET[RANDOM.nextInt(ALPHABET.length)]);
        }
        return sb.toString();
    }
}

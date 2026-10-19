package com.aitutor.backend.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Краткая информация об учителе для профиля ученика (сущность Teacher в БД отсутствует —
 * учитель это User с ролью TEACHER). Заполняется только в teacher у UserResponse;
 * для роли TEACHER поле teacher всегда null (собственные данные видны в полях самого ответа).
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TeacherBriefDto {
    private Long id;
    private String userName;
    private String firstName;
    private String lastName;
    /** Отображаемое имя: "Иван Петров" либо username, если имя не указано. */
    private String fullName;
    /** Код учителя (T-XXXXXX) — тот же, по которому ученик привязывается при регистрации. */
    private String teacherCode;
}

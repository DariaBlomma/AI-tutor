package com.aitutor.backend.dto.user;

import com.aitutor.backend.dto.student.StudentStatsDto;
import com.aitutor.backend.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class UserResponse {
    private Long id;
    private String userName;
    private String email;
    private String firstName;
    private String lastName;
    private UserRole role;
    /** Код учителя (T-XXXXXX) — только для роли TEACHER; ученики получают null. */
    private String teacherCode;
    /**
     * Привязанный учитель — только для роли STUDENT (берётся из student_profiles.teacher_id);
     * для TEACHER всегда null. Позволяет фронтенду после регистрации/входе показать,
     * за каким учителем числится ученик ("Вы привязаны к учителю: Иван Петров").
     */
    private TeacherBriefDto teacher;
    /**
     * Статистика ученика для профиля — только для роли STUDENT (заполняет UserService);
     * для TEACHER всегда null.
     */
    private StudentStatsDto stats;
}
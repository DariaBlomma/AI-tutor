package com.aitutor.backend.dto.auth;

import com.aitutor.backend.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class SignUpRequest {
    @NotBlank(message = "Имя пользователя обязательно")
    private String userName;

    @NotBlank(message = "Email обязателен")
    @Email(message = "Некорректный формат email")
    private String email;

    @NotBlank(message = "Пароль обязателен")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;

    @NotBlank(message = "Имя обязательно")
    private String firstName;

    @NotBlank(message = "Фамилия обязательна")
    private String lastName;

    // Роль выбирается в UI: TEACHER или STUDENT (см. UserRole)
    @NotNull(message = "Роль обязательна")
    private UserRole role;

    /**
     * Код учителя (T-XXXXXX). Обязателен для STUDENT — по нему ученик привязывается к учителю
     * при регистрации. Для TEACHER игнорируется (его собственный код генерируется автоматически).
     */
    private String teacherCode;
}
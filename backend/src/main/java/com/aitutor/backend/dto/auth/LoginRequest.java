package com.aitutor.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class LoginRequest {
    @NotBlank(message = "Имя пользователя обязательно")
    private String userName;

    @NotBlank(message = "Пароль обязателен")
    private String password;
}
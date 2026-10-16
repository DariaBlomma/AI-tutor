package com.aitutor.backend.dto.auth;

import com.aitutor.backend.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String accessToken;
    private UUID refreshToken;
    @Builder.Default
    private String type = "Bearer";
    private Instant expiresAt;
    private String userName;
    private Long userId;
    /** Роль пользователя — фронт по ней выбирает интерфейс (учитель/ученик). */
    private UserRole role;
}

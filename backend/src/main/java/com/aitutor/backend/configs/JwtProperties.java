package com.aitutor.backend.configs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@Data
@ConfigurationProperties(prefix = "jwt")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtProperties {
    private String secret;

    /**
     * Время жизни access-токена (jwt.token.expiration). Чистый геттер — возвращает
     * настроенную длительность, а не момент времени: семантика поля и геттера совпадают.
     */
    @Builder.Default
    private Duration expiration = Duration.ofMinutes(15);

    /**
     * Время жизни refresh-токена в БД (jwt.refresh-expiration).
     */
    @Builder.Default
    private Duration refreshExpiration = Duration.ofDays(30);
}
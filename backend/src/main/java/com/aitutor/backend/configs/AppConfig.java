package com.aitutor.backend.configs;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app")
public class AppConfig {
    private String frontendBaseUrl;
    private int passwordResetTtlMinutes = 30;
    private int rateLimitMaxRequestsPerHour = 3;
    private String mailFrom;

    /** Тексты писем — настраиваются через app.mail.* (см. application-*.yaml), чтобы не править код при ребрендинге. */
    @Data
    public static class Mail {
        private String fromName = "AI Tutor Platform";
        private String passwordResetSubject = "Восстановление пароля в AI Tutor Platform";
    }

    private final Mail mail = new Mail();
}
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
}
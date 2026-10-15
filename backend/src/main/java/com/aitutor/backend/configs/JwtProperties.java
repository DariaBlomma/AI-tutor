package com.aitutor.backend.configs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;
import java.time.Instant;

@Data
@ConfigurationProperties(prefix = "jwt")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtProperties {
    private String secret;

    @Builder.Default
    private Duration expiration = Duration.ofHours(24);

    public Instant getExpiration() {
        return Instant.now().plus(expiration);
    }
}
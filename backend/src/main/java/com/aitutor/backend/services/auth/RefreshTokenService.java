package com.aitutor.backend.services.auth;

import com.aitutor.backend.entities.RefreshToken;
import com.aitutor.backend.entities.User;
import com.aitutor.backend.exceptions.InvalidTokenException;
import com.aitutor.backend.exceptions.ResourceNotFoundException;
import com.aitutor.backend.repositories.auth.RefreshTokenRepository;
import com.aitutor.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    @Transactional
    public UUID createRefreshToken(Long userId) {
        User user = userRepository.findActiveById(userId).orElseThrow(
                () -> new ResourceNotFoundException("User not found or deleted: " + userId)
        );
        refreshTokenRepository.findByUserId(userId).ifPresent(refreshTokenRepository::delete);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID())
                .expiresAt(Instant.now().plus(30, ChronoUnit.DAYS))
                .revoked(false)
                .build();

        RefreshToken saved = refreshTokenRepository.save(refreshToken);
        log.info("Создан новый refresh токен для пользователя: userId={}", userId);
        return saved.getToken();
    }

    /**
     * Проверяет refresh-токен и возвращает id владельца из записи в БД.
     * Вызывается из транзакционных методов AuthService — работает с БД корректно.
     */
    public Long verifyRefreshToken(String tokenValue) {
        UUID tokenUuid;
        try {
            tokenUuid = UUID.fromString(tokenValue);
        } catch (IllegalArgumentException e) {
            log.warn("Попытка использования refresh токена с невалидным форматом");
            throw new InvalidTokenException("Invalid refresh token format");
        }

        RefreshToken refreshToken = refreshTokenRepository.findByToken(tokenUuid)
                .orElseThrow(() -> {
                    log.warn("Попытка использования несуществующего refresh токена");
                    return new InvalidTokenException("Refresh token not found");
                });

        if (refreshToken.isRevoked()) {
            log.warn("Попытка использования отозванного refresh токена");
            throw new InvalidTokenException("Refresh token has been revoked");
        }

        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            log.warn("Попытка использования просроченного refresh токена");
            throw new InvalidTokenException("Refresh token has expired");
        }

        return refreshToken.getUser().getId();
    }

    @Transactional
    public void revokeRefreshToken(Long userId) {
        userRepository.findActiveById(userId).orElseThrow(
                () -> new ResourceNotFoundException("User not found or deleted: " + userId)
        );
        refreshTokenRepository.findByUserId(userId)
                .ifPresent(refreshTokenRepository::delete);
        log.info("Refresh токен отозван для пользователя: userId={}", userId);
    }

    public UUID rotateRefreshToken(Long userId) {
        log.info("Выполнена ротация refresh токена для пользователя: userId={}", userId);
        revokeRefreshToken(userId);
        return createRefreshToken(userId);
    }

    @Transactional
    public void cleanExpiredTokens() {
        log.info("Запущена плановая очистка просроченных refresh токенов");
        refreshTokenRepository.deleteByExpiresAtBefore(Instant.now());
    }
}
package com.aitutor.backend.services.auth;

import com.aitutor.backend.entities.RefreshToken;
import com.aitutor.backend.entities.User;
import com.aitutor.backend.exceptions.InvalidTokenException;
import com.aitutor.backend.exceptions.ResourceNotFoundException;
import com.aitutor.backend.repositories.auth.PasswordResetTokenRepository;
import com.aitutor.backend.repositories.auth.RefreshTokenRepository;
import com.aitutor.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
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
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserRepository userRepository;

    @Transactional
    public UUID createRefreshToken(Long userId) {
        User user = userRepository.findActiveById(userId).orElseThrow(
                () -> new ResourceNotFoundException("User not found or deleted: " + userId)
        );
        // Мульти-девайс: не удаляем прежние токены — новый логин с телефона
        // не должен выбрасывать сессию с компьютера. Просроченные чистит cleanExpiredTokens.
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
     * Проверяет refresh-токен и возвращает запись из БД (для проверки формата — до обращения к БД).
     * Вызывается из транзакционных методов AuthService — работает с БД корректно.
     */
    private RefreshToken loadValidRefreshToken(String tokenValue) {
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

        return refreshToken;
    }

    /**
     * Проверяет refresh-токен и возвращает id владельца из записи в БД.
     * Только для чтения (например, сверка владельца в logout).
     */
    public Long verifyRefreshToken(String tokenValue) {
        return loadValidRefreshToken(tokenValue).getUser().getId();
    }

    @Transactional
    public void revokeRefreshToken(Long userId) {
        userRepository.findActiveById(userId).orElseThrow(
                () -> new ResourceNotFoundException("User not found or deleted: " + userId)
        );
        // Logout / смена пароля — отзываем ВСЕ токены пользователя со всех устройств
        refreshTokenRepository.deleteAll(refreshTokenRepository.findAllByUserId(userId));
        log.info("Все refresh токены отозваны для пользователя: userId={}", userId);
    }

    /**
     * Logout: отзываем только предъявленный refresh-токен (сессия конкретного устройства),
     * а не все токены пользователя. Привязка проверяется по БД: владелец токена должен
     * совпадать с userId из access-токена — иначе чужой refresh не будет отозван.
     */
    @Transactional
    public void revokePresentedToken(String tokenValue, Long expectedUserId) {
        Long ownerId = verifyRefreshToken(tokenValue);
        if (!ownerId.equals(expectedUserId)) {
            log.warn("Попытка отзыва refresh токена чужого пользователя: tokenOwnerId={}, accessUserId={}",
                    ownerId, expectedUserId);
            throw new InvalidTokenException("Refresh token does not match the authenticated user");
        }
        refreshTokenRepository.findByToken(UUID.fromString(tokenValue))
                .ifPresent(refreshTokenRepository::delete);
        log.info("Refresh токен отозван (logout текущего устройства): userId={}", ownerId);
    }

    /**
     * Ротация при refresh: ONE SHOT — предъявленный токен удаляется атомарно
     * (DELETE ... WHERE token = ? через SELECT ... FOR UPDATE). Гонка двух параллельных
     * refresh с одним токеном сериализуется блокировкой: второй дожидается первого,
     * удалённый токен не находит и получает 401 (reuse украденного токена тоже даёт 401),
     * а не 500 из-за конфликта delete+insert.
     */
    @Transactional
    public UUID rotateRefreshToken(String tokenValue) {
        UUID tokenUuid;
        try {
            tokenUuid = UUID.fromString(tokenValue);
        } catch (IllegalArgumentException e) {
            log.warn("Попытка использования refresh токена с невалидным форматом");
            throw new InvalidTokenException("Invalid refresh token format");
        }

        // Пессимистная блокировка строки сериализует конкурентные ротации одного токена
        RefreshToken presented = refreshTokenRepository.findByTokenForUpdate(tokenUuid)
                .orElseThrow(() -> {
                    log.warn("Попытка использования несуществующего (уже ротированного) refresh токена");
                    return new InvalidTokenException("Refresh token not found");
                });

        if (presented.isRevoked()) {
            log.warn("Попытка использования отозванного refresh токена");
            throw new InvalidTokenException("Refresh token has been revoked");
        }

        if (presented.getExpiresAt().isBefore(Instant.now())) {
            log.warn("Попытка использования просроченного refresh токена");
            throw new InvalidTokenException("Refresh token has expired");
        }

        Long userId = presented.getUser().getId();
        refreshTokenRepository.delete(presented);
        log.info("Ротация refresh токена для пользователя: userId={}", userId);
        return createRefreshToken(userId);
    }

    /**
     * Плановая очистка просроченных токенов (ежедневно в 03:00).
     * Без этого таблицы refresh_tokens/password_reset_tokens растут бесконечно.
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanExpiredTokens() {
        log.info("Запущена плановая очистка просроченных refresh токенов");
        refreshTokenRepository.deleteByExpiresAtBefore(Instant.now());
        passwordResetTokenRepository.deleteByExpiresAtBefore(Instant.now());
    }
}
package com.aitutor.backend.repositories.auth;

import com.aitutor.backend.entities.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);

    /** При повторном forgot-password все прежние токены пользователя инвалидируются. */
    void deleteAllByUserId(Long userId);

    void deleteByExpiresAtBefore(Instant cutoff);
}
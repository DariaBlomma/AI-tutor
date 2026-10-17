package com.aitutor.backend.repositories.auth;

import com.aitutor.backend.entities.RefreshToken;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(UUID token);

    /**
     * Пессимистная блокировка строки (SELECT ... FOR UPDATE) для операций ротации/отзыва:
     * два параллельных refresh с одним токеном сериализуются — второй дожидается транзакции
     * первого, не находит токен и получает 401 вместо гонки delete+insert (500).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.token = :token")
    Optional<RefreshToken> findByTokenForUpdate(@Param("token") UUID token);

    /** UNIQUE на user_id снят (см. changeset 011): у пользователя может быть несколько токенов (мульти-девайс). */
    @Query("SELECT t FROM RefreshToken t WHERE t.user.id = :userId")
    List<RefreshToken> findAllByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :now")
    void deleteByExpiresAtBefore(@Param("now") Instant now);
}
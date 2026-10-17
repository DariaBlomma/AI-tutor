package com.aitutor.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "refresh_tokens")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Мульти-девайс: пользователь может быть залогинен с нескольких устройств,
     * UNIQUE на user_id снят (см. changeset 011). Ротация при refresh удаляет
     * только предъявленный токен, logout/revoke отзывают все токены пользователя.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true)
    private UUID token;

    @Column(nullable = false)
    private Instant expiresAt;

    private boolean revoked;
}
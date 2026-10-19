package com.aitutor.backend.entities;

import com.aitutor.backend.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    /**
     * Уникальность среди неудалённых обеспечивает частичный индекс uq_users_user_name_active (lower(user_name)) в Liquibase 016.
     * unique=true здесь не ставим: Hibernate создал бы глобальный UNIQUE-констрейнт, запрещающий зарегистрировать имя удалённого пользователя.
     */
    @Column(nullable = false, length = 100)
    private String userName;

    /** Уникальность email — частичный индекс uq_users_email_active только среди неудалённых (см. changeset 016). */
    @Column(length = 200, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 100)
    private String firstName;

    @Column(length = 100)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    /**
     * Уникальный код учителя для ссылки-приглашения (T-XXXXXX).
     * Заполняется только у TEACHER; ученик при регистрации передаёт этот код и привязывается к учителю.
     */
    @Column(unique = true, length = 50)
    private String teacherCode;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    private Instant deletedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }
}
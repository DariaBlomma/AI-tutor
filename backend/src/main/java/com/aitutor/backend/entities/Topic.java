package com.aitutor.backend.entities;

import jakarta.persistence.*;

import java.time.Instant;
import lombok.*;

@Getter
@Setter
@Entity
@Table(name = "topics")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    // Уникальность обеспечивает частичный индекс uq_topics_name_active (WHERE deleted_at IS NULL) в Liquibase.
    // unique=true здесь не ставим: Hibernate создал бы глобальный UNIQUE-констрейнт, запрещающий пересоздать имя удалённой темы.
    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "deleted_at")
    private Instant deletedAt;
}
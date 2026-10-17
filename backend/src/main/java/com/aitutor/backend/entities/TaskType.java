package com.aitutor.backend.entities;

import jakarta.persistence.*;

import java.time.Instant;
import lombok.*;

@Getter
@Setter
@Entity
@Table(name = "task_types")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class TaskType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    // Уникальность обеспечивает частичный индекс uq_task_types_name_active (WHERE deleted_at IS NULL) в Liquibase — см. changelog 013.
    // unique=true здесь не ставим: Hibernate создал бы глобальный UNIQUE-констрейнт, запрещающий пересоздать имя удалённого типа.
    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(name = "deleted_at")
    private Instant deletedAt;
}
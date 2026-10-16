package com.aitutor.backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Связь курса с заданием из банка + позиция задания в курсе.
 * Таблица: course_tasks (миграция 010). Уникальны пары (course_id, task_id)
 * и (course_id, position) — последний защищает порядок от гонок при перетаскивании.
 * Сущность без soft-delete: удаление связи = физическое DELETE строки course_tasks.
 */
@Getter
@Setter
@Entity
@Table(name = "course_tasks")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class CourseTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    /** Порядок задания в курсе (0..N-1, плотный, без пропусков). */
    @Column(nullable = false)
    @Builder.Default
    private Integer position = 0;

    @Column(name = "added_at", nullable = false, updatable = false)
    private Instant addedAt;

    @PrePersist
    protected void onCreate() {
        if (addedAt == null) {
            addedAt = Instant.now();
        }
    }
}

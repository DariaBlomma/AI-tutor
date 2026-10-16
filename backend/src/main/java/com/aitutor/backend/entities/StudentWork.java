package com.aitutor.backend.entities;

import com.aitutor.backend.enums.WorkStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Факт назначения конкретного задания конкретному ученику (паттерн «Банк заданий»:
 * курс — только папка для учителя, ученику назначается всегда отдельное задание).
 * Таблица: student_work (миграция 007, переписана in-place). Жёсткая привязка ученика к одному учителю,
 * поэтому assigned_by не храним — право на управление проверяем через student_profiles.teacher_id.
 * Soft-delete через deletedAt; частичный UNIQUE индекс (student_id, task_id) WHERE deleted_at IS NULL
 * гарантирует одно активное назначение на пару «ученик + задание».
 */
@Getter
@Setter
@Entity
@Table(name = "student_work")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class StudentWork {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private WorkStatus status = WorkStatus.ASSIGNED;

    /** Опциональный срок выполнения; по истечении фоновая задача переводит в EXPIRED. */
    @Column(name = "deadline")
    private Instant deadline;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    // Статистика для отчётов (фича «Отчёты» — позже): заполняется при выполнении, не сейчас.
    @Column(name = "first_try_correct")
    private Integer firstTryCorrect;

    @Column(name = "correct_after_hints")
    private Integer correctAfterHints;

    @Column(name = "total_hints_given")
    private Integer totalHintsGiven;

    @Column(name = "teacher_report")
    private String teacherReport;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public boolean isActive() {
        return deletedAt == null
                && (status == WorkStatus.ASSIGNED || status == WorkStatus.IN_PROGRESS);
    }
}

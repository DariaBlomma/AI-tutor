package com.aitutor.backend.entities;

import com.aitutor.backend.enums.ItemProgressStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Прогресс ученика по одному пункту (item) выполненной работы (миграция 008).
 * Одна строка = один пункт задания в рамках одной student_work:
 * status (NOT_STARTED / IN_PROGRESS / SOLVED), число попыток, подсказки,
 * последний введённый ответ и время решения.
 * Оценок нет — только факт выполнения; отчёты учителя считают ошибки по final-ответу позиции.
 */
@Getter
@Setter
@Entity
@Table(name = "student_work_item_progress")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class StudentWorkItemProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_work_id", nullable = false)
    private StudentWork studentWork;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_item_id", nullable = false)
    private TaskItem taskItem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ItemProgressStatus status = ItemProgressStatus.NOT_STARTED;

    @Column(name = "answer_attempts", nullable = false)
    @Builder.Default
    private Integer answerAttempts = 0;

    /** Подсказок не больше трёх (бизнес-правило формата Word Formation). */
    @Column(name = "hints_given", nullable = false)
    @Builder.Default
    private Integer hintsGiven = 0;

    /** Последний введённый учеником ответ (эталон НЕ храним — берём из TaskItem.correctAnswer). */
    @Column(name = "student_answer", length = 100)
    private String studentAnswer;

    @Column(name = "solved_at")
    private Instant solvedAt;
}

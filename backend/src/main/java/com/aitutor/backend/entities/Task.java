package com.aitutor.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "tasks")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "public_id", nullable = false, unique = true, updatable = false, length = 20)
    private String publicId;

    /** Необязательное название (миграция 017): пустое = в UI показывается publicId. */
    @Column(length = 200)
    private String name;

    @Column(name = "preview_text", columnDefinition = "TEXT")
    private String previewText;

    /** Необязательная инструкция для ученика (миграция 018): «что нужно сделать в задании». */
    @Column(name = "instruction", length = 1000)
    private String instruction;

    @Column(nullable = false)
    private Boolean isMixed = false;

    /**
     * Уровни CEFR задания (миграция 021): минимум один обязателен, задание может иметь несколько.
     * level — reserved word в H2, поэтому таблица task_levels и поле levels.
     * Set, а не List: уровни — это набор тегов (как topics/taskTypes), порядок не имеет смысла,
     * а List + @OrderColumn требовал бы служебной колонки levels_order (миграции 021/022).
     */
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "task_levels", joinColumns = @JoinColumn(name = "task_id"))
    @Column(name = "level", nullable = false, length = 4)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Set<com.aitutor.backend.enums.CefrLevel> levels = new HashSet<>();

    /** Тип экзамена (миграция 020): OGE / EGE, nullable = не указан. */
    @Enumerated(EnumType.STRING)
    @Column(name = "exam_type", length = 30)
    private com.aitutor.backend.enums.ExamType examType;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String context;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "task_topics",
            joinColumns = @JoinColumn(name = "task_id"),
            inverseJoinColumns = @JoinColumn(name = "topic_id")
    )
    @Builder.Default
    private Set<Topic> topics = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "task_task_types",
            joinColumns = @JoinColumn(name = "task_id"),
            inverseJoinColumns = @JoinColumn(name = "task_type_id")
    )
    @Builder.Default
    private Set<TaskType> taskTypes = new HashSet<>();

    @OneToMany(mappedBy = "task", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    @Builder.Default
    private List<TaskItem> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    /**
     * publicId генерируется из отдельной SQL-последовательности task_public_id_seq
     * ДО persist (см. TaskService.create и PublicIdGenerator) — значение попадает сразу
     * в INSERT, UPDATE после вставки не требуется.
     */
}

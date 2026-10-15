package com.aitutor.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "word_formation_library")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WordFormationLibrary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "base_word", nullable = false, length = 50)
    private String baseWord;

    @Column(name = "sentence", nullable = false)
    private String sentence;

    @Column(name = "correct_answer", nullable = false, length = 100)
    private String correctAnswer;

    private String explanation;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
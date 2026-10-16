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

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "deleted_at")
    private Instant deletedAt;
}
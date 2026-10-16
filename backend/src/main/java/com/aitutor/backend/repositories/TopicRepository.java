package com.aitutor.backend.repositories;

import com.aitutor.backend.entities.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {

    boolean existsByNameIgnoreCase(String name);

    Topic findByNameIgnoreCase(String name);

    List<Topic> findByDeletedAtIsNullOrderByNameAsc();

    Optional<Topic> findByIdAndDeletedAtIsNull(Long id);
}

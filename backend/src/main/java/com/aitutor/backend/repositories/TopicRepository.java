package com.aitutor.backend.repositories;

import com.aitutor.backend.entities.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {

    boolean existsByNameIgnoreCase(String name);

    Topic findByNameIgnoreCase(String name);
}
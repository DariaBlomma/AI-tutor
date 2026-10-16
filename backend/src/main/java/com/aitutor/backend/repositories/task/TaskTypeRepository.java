package com.aitutor.backend.repositories.task;

import com.aitutor.backend.entities.TaskType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskTypeRepository extends JpaRepository<TaskType, Long> {

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    List<TaskType> findByIsActiveTrueAndDeletedAtIsNullOrderByNameAsc();

    List<TaskType> findByDeletedAtIsNullOrderByNameAsc();

    Optional<TaskType> findByIdAndDeletedAtIsNull(Long id);
}

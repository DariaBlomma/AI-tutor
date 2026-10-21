package com.aitutor.backend.repositories.task;

import com.aitutor.backend.entities.TaskType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskTypeRepository extends JpaRepository<TaskType, Long> {

    /** Уникальность имени — только среди НЕудалённых (согласовано с uq_task_types_name_active). */
    boolean existsByNameIgnoreCaseAndDeletedAtIsNull(String name);

    boolean existsByNameIgnoreCaseAndIdNotAndDeletedAtIsNull(String name, Long id);

    List<TaskType> findByIsActiveTrueAndDeletedAtIsNullOrderByNameAsc();

    List<TaskType> findByDeletedAtIsNullOrderByNameAsc();

    Optional<TaskType> findByIdAndDeletedAtIsNull(Long id);

    /** Удалённые типы нельзя привязывать к заданиям (soft-delete). */
    List<TaskType> findAllByIdInAndDeletedAtIsNull(List<Long> ids);
}

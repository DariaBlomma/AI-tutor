package com.aitutor.backend.repositories;

import com.aitutor.backend.entities.StudentWorkItemProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentWorkItemProgressRepository extends JpaRepository<StudentWorkItemProgress, Long> {

    /**
     * Прогресс по всем пунктам одной работы для отчёта учителя (уровень 3) — вместе с самим
     * пунктом задания (fetch), чтобы достать prompt / correct_answer без N+1 запросов.
     * Пункты удалённых заданий в отчёт не попадают (t.deletedAt IS NULL).
     */
    @Query("""
            SELECT p FROM StudentWorkItemProgress p
            JOIN FETCH p.taskItem ti
            JOIN FETCH ti.task t
            WHERE p.studentWork.id = :workId
              AND t.deletedAt IS NULL
            """)
    List<StudentWorkItemProgress> findByWorkIdWithItem(@Param("workId") Long workId);

    /** Строка прогресса одного пункта одной работы — для ленивого создания при первом submit. */
    @Query("""
            SELECT p FROM StudentWorkItemProgress p
            WHERE p.studentWork.id = :workId AND p.taskItem.id = :itemId
            """)
    Optional<StudentWorkItemProgress> findByWorkAndItem(@Param("workId") Long workId,
                                                        @Param("itemId") Long itemId);

    /**
     * Агрегаты прогресса по списку работ ученика одним запросом — краткий «2 из 5»
     * на дашборде (см. findActiveWorkIds в StudentWorkRepository).
     * totalItems считается по строкам прогресса: они создаются лениво при первом submit,
     * поэтому у ещё не начатой работы solved/attempted будут 0 (полный размер пунктов
     * работы добавляет сервис, см. StudentWorkService.getProgressOverview).
     */
    @Query("""
            SELECT p.studentWork.id AS workId,
                   COUNT(p)        AS progressRows,
                   SUM(CASE WHEN p.status = com.aitutor.backend.enums.ItemProgressStatus.SOLVED
                            THEN 1 ELSE 0 END) AS solvedCount,
                   SUM(CASE WHEN p.answerAttempts > 0 THEN 1 ELSE 0 END) AS attemptedCount,
                   COALESCE(SUM(p.hintsGiven), 0) AS hintsUsed
            FROM StudentWorkItemProgress p
            WHERE p.studentWork.id IN :workIds
            GROUP BY p.studentWork.id
            """)
    List<WorkProgressAggregate> aggregateByWorkIds(@Param("workIds") List<Long> workIds);

    /** Projection для aggregateByWorkIds. */
    interface WorkProgressAggregate {
        Long getWorkId();
        Long getProgressRows();
        Long getSolvedCount();
        Long getAttemptedCount();
        Integer getHintsUsed();
    }

    /**
     * Агрегаты прогресса по всем работам ученика одним запросом — статистика профиля
     * (ошибки по финальным ответам + число выполненных работ). В удалённые задания не заходят.
     */
    @Query("""
            SELECT sw.id AS workId,
                   COUNT(p) AS progressRows,
                   SUM(CASE WHEN ti.correctAnswer IS NOT NULL AND TRIM(ti.correctAnswer) <> ''
                             AND (p.studentAnswer IS NULL
                                  OR LOWER(TRIM(ti.correctAnswer)) <> LOWER(TRIM(p.studentAnswer)))
                        THEN 1 ELSE 0 END) AS errorCount
            FROM StudentWorkItemProgress p
            JOIN p.studentWork sw
            JOIN p.taskItem ti
            JOIN ti.task t
            WHERE sw.student.id = :studentId
              AND t.deletedAt IS NULL
            GROUP BY sw.id
            """)
    List<StudentStatsAggregate> aggregateByStudent(@Param("studentId") Long studentId);

    /** Projection для aggregateByStudent. */
    interface StudentStatsAggregate {
        Long getWorkId();
        Long getProgressRows();
        Long getErrorCount();
    }
}

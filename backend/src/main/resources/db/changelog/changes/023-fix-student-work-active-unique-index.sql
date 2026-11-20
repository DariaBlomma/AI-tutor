-- liquibase formatted sql

--changeset daria:023-fix-student-work-active-unique-index
--comment: Исправление частичного уникального индекса: блокировать только АКТИВНЫЕ назначения (ASSIGNED/IN_PROGRESS),
--         а не все не-удалённые. Раньше индекс WHERE deleted_at IS NULL блокировал повторное назначение даже после
--         COMPLETED/EXPIRED/CANCELLED, что противоречило требованию «повтор разрешён, если предыдущее завершено».
DROP INDEX IF EXISTS uq_student_work_active_task;

CREATE UNIQUE INDEX uq_student_work_active_task
    ON student_work(student_id, task_id)
    WHERE deleted_at IS NULL
      AND status IN ('ASSIGNED', 'IN_PROGRESS');

--rollback DROP INDEX IF EXISTS uq_student_work_active_task; CREATE UNIQUE INDEX uq_student_work_active_task ON student_work(student_id, task_id) WHERE deleted_at IS NULL;

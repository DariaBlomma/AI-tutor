-- liquibase formatted sql

--changeset daria:024-add-failed-status-to-progress-check
--comment: Добавить статус FAILED в check constraint для student_work_item_progress
ALTER TABLE student_work_item_progress
    DROP CONSTRAINT student_work_item_progress_status_check;

ALTER TABLE student_work_item_progress
    ADD CONSTRAINT student_work_item_progress_status_check
        CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'SOLVED', 'FAILED'));

--rollback ALTER TABLE student_work_item_progress DROP CONSTRAINT student_work_item_progress_status_check;
--rollback ALTER TABLE student_work_item_progress ADD CONSTRAINT student_work_item_progress_status_check CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'SOLVED'));

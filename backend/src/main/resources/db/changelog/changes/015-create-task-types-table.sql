-- liquibase formatted sql

--changeset daria:015-create-task-task-types-table
--comment: Связка заданий и типов заданий (многие ко многим)
CREATE TABLE task_task_types (
                                 task_id BIGINT NOT NULL,
                                 task_type_id BIGINT NOT NULL,
                                 PRIMARY KEY (task_id, task_type_id),

                                 CONSTRAINT fk_ttt_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
                                 CONSTRAINT fk_ttt_type FOREIGN KEY (task_type_id) REFERENCES task_types(id) ON DELETE CASCADE
);

--rollback DROP TABLE IF EXISTS task_task_types;
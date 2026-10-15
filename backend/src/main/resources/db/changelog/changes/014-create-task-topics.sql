-- liquibase formatted sql

--changeset daria:014-create-task-topics-table
--comment: Связка заданий и тем (многие ко многим)
CREATE TABLE task_topics (
                             task_id BIGINT NOT NULL,
                             topic_id BIGINT NOT NULL,
                             PRIMARY KEY (task_id, topic_id),

                             CONSTRAINT fk_tt_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
                             CONSTRAINT fk_tt_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

--rollback DROP TABLE IF EXISTS task_topics;
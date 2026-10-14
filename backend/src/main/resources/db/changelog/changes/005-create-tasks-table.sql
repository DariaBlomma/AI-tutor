-- liquibase formatted sql

--changeset daria:005-create-tasks-table
--comment: Контейнер задания (то, что назначается ученику)
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    skill_type VARCHAR(50) NOT NULL,       -- WORD_FORMATION, GRAMMAR...
    topic_id BIGINT,                       -- Опциональная тема
    created_by BIGINT NOT NULL,            -- ID учителя
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_task_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL,
    CONSTRAINT fk_task_teacher FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

--rollback DROP TABLE IF EXISTS tasks;
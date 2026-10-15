-- liquibase formatted sql

--changeset daria:013-create-task-types-table
--comment: Справочник типов заданий (форматы ЕГЭ, грамматика и т.д.)
CREATE TABLE task_types (
                            id BIGSERIAL PRIMARY KEY,
                            name VARCHAR(100) NOT NULL UNIQUE,
                            description TEXT,
                            is_active BOOLEAN DEFAULT TRUE
);

--rollback DROP TABLE IF EXISTS task_types;
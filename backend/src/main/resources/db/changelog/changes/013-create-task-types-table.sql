-- liquibase formatted sql

--changeset daria:013-create-task-types-table
--comment: Справочник типов заданий (форматы ЕГЭ, грамматика и т.д.)
CREATE TABLE task_types (
                            id BIGSERIAL PRIMARY KEY,
                            name VARCHAR(100) NOT NULL,
                            description TEXT,
                            is_active BOOLEAN DEFAULT TRUE,
                            deleted_at TIMESTAMP WITH TIME ZONE
);

--changeset daria:013a-task-types-unique-name-index
--comment: Частичный уникальный индекс: имя уникально только среди неудалённых типов (soft-delete)
CREATE UNIQUE INDEX uq_task_types_name_active ON task_types (lower(name)) WHERE deleted_at IS NULL;

--rollback DROP TABLE IF EXISTS task_types;
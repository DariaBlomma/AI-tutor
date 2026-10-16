-- liquibase formatted sql

--changeset daria:003-create-topics-table
--comment: Независимый справочник тем
CREATE TABLE topics (
                        id BIGSERIAL PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        deleted_at TIMESTAMP WITH TIME ZONE
);

--changeset daria:003a-topics-unique-name-index
--comment: Частичный уникальный индекс: имя уникально только среди неудалённых тем (soft-delete)
CREATE UNIQUE INDEX uq_topics_name_active ON topics (lower(name)) WHERE deleted_at IS NULL;

--rollback DROP TABLE IF EXISTS topics;
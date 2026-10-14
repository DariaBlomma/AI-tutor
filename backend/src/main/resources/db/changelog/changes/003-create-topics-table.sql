  -- liquibase formatted sql

    --changeset daria:003-create-topics-table
  --comment: Независимый справочник тем
    CREATE TABLE topics (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
    );

    --rollback DROP TABLE IF EXISTS topics;
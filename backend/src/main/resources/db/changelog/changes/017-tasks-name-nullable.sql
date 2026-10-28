-- liquibase formatted sql

--changeset daria:017-tasks-name-nullable
--comment: Название задания стало необязательным (пустое = в UI показывается publicId).
ALTER TABLE tasks ALTER COLUMN name DROP NOT NULL;

--rollback ALTER TABLE tasks ALTER COLUMN name SET NOT NULL;

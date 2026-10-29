-- liquibase formatted sql

--changeset daria:018-tasks-instruction
--comment: Необязательная инструкция к заданию («что нужно сделать») — есть у любого типа заданий.
ALTER TABLE tasks ADD COLUMN instruction VARCHAR(1000);

--rollback ALTER TABLE tasks DROP COLUMN instruction;

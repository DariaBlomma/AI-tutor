-- liquibase formatted sql

-- changeset aitutor:019-task-types-instruction
-- Comment(s): task_types.instruction — необязательная базовая инструкция для типа задания
-- (например, «Fill in the gaps with the correct form of the verb»). Поле справочника,
-- на механику пунктов не влияет; пустое = инструкции нет.
ALTER TABLE task_types
    ADD COLUMN instruction VARCHAR(1000);

-- rollback ALTER TABLE task_types DROP COLUMN instruction;

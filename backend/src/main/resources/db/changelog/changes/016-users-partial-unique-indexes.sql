-- liquibase formatted sql

--changeset daria:016-users-username-unique-active
--comment: username не имел UNIQUE в БД (race condition при параллельной регистрации).
-- Частичный уникальный индекс по lower(user_name) среди НЕудалённых — согласован с
-- findActiveByUserName / existsByUserNameIgnoreCaseAndDeletedAtIsNull в UserRepository.
CREATE UNIQUE INDEX uq_users_user_name_active ON users (lower(user_name)) WHERE deleted_at IS NULL;

--rollback DROP INDEX IF EXISTS uq_users_user_name_active;

--changeset daria:016-users-email-unique-active
--comment: email был уникален глобально (даже для удалённых). Табличный UNIQUE убран из
-- CREATE TABLE (001); здесь — частичный индекс только среди неудалённых, аналогично topics/task_types.
CREATE UNIQUE INDEX uq_users_email_active ON users (lower(email)) WHERE deleted_at IS NULL;

--rollback DROP INDEX IF EXISTS uq_users_email_active;

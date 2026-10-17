-- liquibase formatted sql

--changeset daria:016-users-timestamps-to-timestamptz
--comment: created_at/updated_at/deleted_at → TIMESTAMPTZ (Hibernate маппит Instant; без TZ в prod искажения таймзон)
ALTER TABLE users
    ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE USING created_at AT TIME ZONE 'UTC',
    ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE USING updated_at AT TIME ZONE 'UTC',
    ALTER COLUMN deleted_at TYPE TIMESTAMP WITH TIME ZONE USING deleted_at AT TIME ZONE 'UTC';

--rollback ALTER TABLE users ALTER COLUMN created_at TYPE TIMESTAMP, ALTER COLUMN updated_at TYPE TIMESTAMP, ALTER COLUMN deleted_at TYPE TIMESTAMP;

--changeset daria:016-courses-timestamps-to-timestamptz
--comment: временные поля courses → TIMESTAMPTZ для единообразия со остальной схемой
ALTER TABLE courses
    ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE USING created_at AT TIME ZONE 'UTC',
    ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE USING updated_at AT TIME ZONE 'UTC',
    ALTER COLUMN deleted_at TYPE TIMESTAMP WITH TIME ZONE USING deleted_at AT TIME ZONE 'UTC';

--rollback ALTER TABLE courses ALTER COLUMN created_at TYPE TIMESTAMP, ALTER COLUMN updated_at TYPE TIMESTAMP, ALTER COLUMN deleted_at TYPE TIMESTAMP;

--changeset daria:016-users-username-unique-active
--comment: username не имел UNIQUE в БД (race condition при параллельной регистрации).
-- Частичный уникальный индекс по lower(user_name) среди НЕудалённых — согласован с
-- findActiveByUserName и existsByUserNameAndDeletedAtIsNull в UserRepository.
CREATE UNIQUE INDEX uq_users_user_name_active ON users (lower(user_name)) WHERE deleted_at IS NULL;

--rollback DROP INDEX IF EXISTS uq_users_user_name_active;

--changeset daria:016-users-email-unique-active
--comment: email был уникален глобально (даже для удалённых). Убираем табличный UNIQUE,
-- заменяем частичным индексом только среди неудалённых — аналогично topics/task_types.
ALTER TABLE users DROP CONSTRAINT users_email_key;
CREATE UNIQUE INDEX uq_users_email_active ON users (lower(email)) WHERE deleted_at IS NULL;

--rollback DROP INDEX IF EXISTS uq_users_email_active; ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);

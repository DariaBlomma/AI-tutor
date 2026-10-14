-- liquibase formatted sql

--changeset daria:001-create-users-table
--comment: Таблица пользователей (аутентификация и базовые данные)
CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       user_name VARCHAR(200) NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       email VARCHAR(200) NOT NULL UNIQUE,
                       first_name VARCHAR(200),
                       last_name VARCHAR(200),
                       role VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
                       teacher_code VARCHAR(50) UNIQUE, -- Код учителя для ссылки-приглашения
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       deleted_at TIMESTAMP
);

--rollback DROP TABLE IF EXISTS users;
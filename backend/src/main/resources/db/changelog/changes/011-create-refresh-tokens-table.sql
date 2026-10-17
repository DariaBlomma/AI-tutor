-- liquibase formatted sql

-- changeset daria:011-create-refresh-tokens-table
CREATE TABLE refresh_tokens (
                                id BIGSERIAL PRIMARY KEY,
                                token UUID NOT NULL UNIQUE,
                                -- без UNIQUE: пользователь может быть активен с нескольких устройств
                                user_id BIGINT NOT NULL,
                                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                                revoked BOOLEAN NOT NULL DEFAULT FALSE,

                                CONSTRAINT fk_refresh_token_user FOREIGN KEY (user_id) REFERENCES users(id)
);
-- rollback DROP TABLE refresh_tokens;

-- changeset daria:011-create-refresh-tokens-table-add-indexes
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- rollback DROP INDEX idx_refresh_tokens_token, idx_refresh_tokens_expires_at, idx_refresh_tokens_user_id;
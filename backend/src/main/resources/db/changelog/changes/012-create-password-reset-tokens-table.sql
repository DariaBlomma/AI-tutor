-- liquibase formatted sql

-- changeset daria:012-create-password-reset-tokens-table
CREATE TABLE password_reset_tokens (
                                       id BIGSERIAL PRIMARY KEY,
                                       token VARCHAR(255) NOT NULL UNIQUE,
                                       user_id BIGINT NOT NULL,
                                       expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

                                       CONSTRAINT fk_password_reset_token_user FOREIGN KEY (user_id) REFERENCES users(id)
);
-- rollback DROP TABLE password_reset_tokens;

-- changeset daria:012-create-password-reset-tokens-table-add-indexes
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- rollback DROP INDEX idx_password_reset_tokens_token, idx_password_reset_tokens_user_id;
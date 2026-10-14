-- liquibase formatted sql

--changeset daria:007-create-student-work-table
--comment: Факт назначения задания ученику (статус, дедлайн, общая статистика)
CREATE TABLE student_work (
                              id BIGSERIAL PRIMARY KEY,
                              student_id BIGINT NOT NULL,
                              task_id BIGINT NOT NULL,
                              status VARCHAR(20) NOT NULL DEFAULT 'ASSIGNED'
                                  CHECK (status IN ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED')),
                              deadline TIMESTAMP WITH TIME ZONE,
                              started_at TIMESTAMP WITH TIME ZONE,
                              completed_at TIMESTAMP WITH TIME ZONE,

    -- Статистика для отчета
                              first_try_correct INT DEFAULT 0,
                              correct_after_hints INT DEFAULT 0,
                              total_hints_given INT DEFAULT 0,
                              teacher_report TEXT,                   -- Текстовый отчет от ИИ

                              CONSTRAINT fk_work_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                              CONSTRAINT fk_work_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE RESTRICT
);

CREATE INDEX idx_student_work_student ON student_work(student_id);
CREATE INDEX idx_student_work_status ON student_work(status);

--rollback DROP TABLE IF EXISTS student_work;
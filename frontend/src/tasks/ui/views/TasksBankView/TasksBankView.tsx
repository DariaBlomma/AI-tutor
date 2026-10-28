import { useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { AuthService } from '@/auth/services/AuthService.ts';
import { TasksBankService } from '@/tasks/services/TasksBankService';
import { useTasksBank } from '@/tasks/hooks/useTasksBank';
import { useTaskRefs } from '@/tasks/hooks/useTaskRefs';
import { RefCrudPanel } from '@/tasks/ui/widgets/RefCrudPanel/RefCrudPanel';
import type { TaskSummary } from '@/tasks/types';
import styles from './TasksBankView.module.scss';

// Страница «Банк заданий» — общая для учителя и ученика:
// список видят все авторизованные; кнопки создания и CRUD справочников — только учителю.
// ВРЕМЕННО: панели CRUD справочников тем и учебных типов (создание/редактирование/удаление).
export function TasksBankView() {
    const isTeacher = AuthService.getUserRole() === 'TEACHER';
    const fetchTasks = useCallback(() => TasksBankService.getTasks(), []);
    const { tasks, isLoading, isError } = useTasksBank(fetchTasks);
    // Справочники нужны только учителю (панели CRUD); ученику запросы не отправляем
    // (бэк закрывает /topics/** от STUDENT — 403).
    const refs = useTaskRefs(isTeacher);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Банк заданий</h1>
                <p>Общие задания учителя и ученика</p>
            </div>

            {isTeacher && (
                <Link to="/tasks-bank/create" className={styles.createBtn}>
                    Создать задание
                </Link>
            )}

            <div className={styles.section}>
                <div className={styles.sectionTitle}>Задания</div>

                {isLoading && <div className={styles.notice}>Загрузка…</div>}
                {isError && <div className={styles.notice}>Не удалось загрузить банк заданий.</div>}
                {!isLoading && !isError && !tasks.length && <div className={styles.notice}>Пока нет заданий.</div>}

                {!isLoading && !isError && (
                    <div className={styles.list}>
                        {tasks.map((task) => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </div>
                )}
            </div>

            {/* ВРЕМЕННО: управление справочниками до постоянного UI (только учитель). */}
            {isTeacher && (
                <div className={styles.refsGrid}>
                    <RefCrudPanel
                        title="Лексические темы"
                        items={refs.topics}
                        onCreate={refs.createTopic}
                        onRename={refs.renameTopic}
                        onRemove={refs.removeTopic}
                    />
                    <RefCrudPanel
                        title="Учебные типы заданий"
                        items={refs.taskTypes}
                        onCreate={refs.createTaskType}
                        onRename={refs.renameTaskType}
                        onRemove={refs.removeTaskType}
                    />
                </div>
            )}

            {refs.error && <div className={styles.notice}>{refs.error}</div>}
        </div>
    );
}

// Карточка задания — только отображение (клики/действия будут позже).
function TaskCard({ task }: { task: TaskSummary }) {
    return (
        <div className={styles.card}>
            <div className={styles.cardTop}>
                <span className={styles.cardName}>{task.name}</span>
                {task.isMixed && <span className={styles.mixedBadge}>Mixed</span>}
            </div>

            {task.previewText && <div className={styles.preview}>{task.previewText}</div>}

            <div className={styles.meta}>
                {task.taskTypes.map((type) => (
                    <span key={type.id} className={styles.metaChip}>
                        {type.name}
                    </span>
                ))}
                {task.topics.map((topic) => (
                    <span key={topic.id} className={`${styles.metaChip} ${styles.topicChip}`}>
                        {topic.name}
                    </span>
                ))}
            </div>

            <div className={styles.count}>{task.itemCount} п.</div>
        </div>
    );
}


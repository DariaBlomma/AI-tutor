import { useState } from 'react';
import { BaseInputText } from '@/shared/ui-kit/BaseInputText/BaseInputText';
import { REF_NAME_MAX_LENGTH } from '@/tasks/data';
import type { RefCrudPanelProps } from './types';
import styles from './RefCrudPanel.module.scss';

// ВРЕМЕННЫЙ виджет управления справочниками (темы / учебные типы):
// создание, переименование и удаление прямо на странице банка заданий.
// Убрать после реализации постоянного UI управления справочниками.
export function RefCrudPanel({ title, items, onCreate, onRename, onRemove }: RefCrudPanelProps) {
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');

    const handleCreate = async () => {
        const name = newName.trim();
        if (!name) return;
        const created = await onCreate(name);
        if (created) setNewName('');
    };

    const startEdit = (id: number, name: string) => {
        setEditingId(id);
        setEditValue(name);
    };

    const saveEdit = async (id: number) => {
        const name = editValue.trim();
        if (!name) return;
        const ok = await onRename(id, name);
        if (ok) setEditingId(null);
    };

    return (
        <div className={styles.panel}>
            <div className={styles.title}>{title}</div>

            {items.length === 0 && <div className={styles.empty}>Список пуст.</div>}

            <ul className={styles.list}>
                {items.map((item) => (
                    <li key={item.id} className={styles.row}>
                        {editingId === item.id ? (
                            <>
                                <BaseInputText
                                    className={styles.editInput}
                                    value={editValue}
                                    maxLength={REF_NAME_MAX_LENGTH}
                                    onChange={(e) => setEditValue(e.target.value)}
                                />
                                <button type="button" className={styles.actionBtn} onClick={() => void saveEdit(item.id)}>
                                    OK
                                </button>
                                <button type="button" className={styles.actionBtn} onClick={() => setEditingId(null)}>
                                    ✕
                                </button>
                            </>
                        ) : (
                            <>
                                <span className={styles.name}>{item.name}</span>
                                <button type="button" className={styles.actionBtn} onClick={() => startEdit(item.id, item.name)}>
                                    Ред.
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.actionBtn} ${styles.danger}`}
                                    onClick={() => void onRemove(item.id)}
                                >
                                    Удалить
                                </button>
                            </>
                        )}
                    </li>
                ))}
            </ul>

            <div className={styles.addRow}>
                <BaseInputText
                    className={styles.addInput}
                    value={newName}
                    maxLength={REF_NAME_MAX_LENGTH}
                    placeholder="Новое название"
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') void handleCreate();
                    }}
                />
                <button type="button" className={styles.addBtn} onClick={() => void handleCreate()}>
                    + Создать
                </button>
            </div>
        </div>
    );
}

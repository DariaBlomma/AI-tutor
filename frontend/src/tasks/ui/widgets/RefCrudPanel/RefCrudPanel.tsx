import { useState } from 'react';
import { BaseInputText } from '@/shared/ui-kit/BaseInputText/BaseInputText';
import { REF_NAME_MAX_LENGTH } from '@/tasks/data';

import type { RefCrudPanelProps, RefItem } from './types';
import styles from './RefCrudPanel.module.scss';

// Виджет управления справочником (темы / грамматические типы): создание, редактирование, удаление.
// Используется на страницах /tasks-bank/topics и /tasks-bank/grammar-types. Только для учителя.
export function RefCrudPanel({ title, items, hasDescription, onCreate, onRename, onRemove }: RefCrudPanelProps) {
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');

    const handleCreate = async () => {
        const name = newName.trim();
        if (!name) return;
        const created = await onCreate(name, hasDescription ? newDescription.trim() || undefined : undefined);
        if (created) {
            setNewName('');
            setNewDescription('');
        }
    };

    const startEdit = (item: RefItem) => {
        setEditingId(item.id);
        setEditName(item.name);
        setEditDescription('description' in item && item.description ? item.description : '');
    };

    const saveEdit = async (id: number) => {
        const name = editName.trim();
        if (!name) return;
        const ok = await onRename(id, name, hasDescription ? editDescription.trim() || null : null);
        if (ok) setEditingId(null);
    };

    const isEditing = (id: number) => editingId === id;

    return (
        <div className={styles.panel}>
            <div className={styles.title}>{title}</div>

            {items.length === 0 && <div className={styles.empty}>Список пуст.</div>}

            <ul className={styles.list}>
                {items.map((item) => (
                    <li key={item.id} className={`${styles.row} ${isEditing(item.id) ? styles.editing : ''}`}>
                        {isEditing(item.id) ? (
                            <div className={styles.editForm}>
                                <BaseInputText
                                    className={styles.fieldInput}
                                    value={editName}
                                    maxLength={REF_NAME_MAX_LENGTH}
                                    placeholder="Название"
                                    autoFocus
                                    onChange={(e) => setEditName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') void saveEdit(item.id);
                                        if (e.key === 'Escape') setEditingId(null);
                                    }}
                                />
                                {hasDescription && (
                                    <textarea
                                        className={styles.fieldTextarea}
                                        value={editDescription}
                                        placeholder="Описание (необязательно)"
                                        rows={2}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                    />
                                )}
                                <div className={styles.editActions}>
                                    <button type="button" className={styles.primaryBtn} onClick={() => void saveEdit(item.id)}>
                                        Сохранить
                                    </button>
                                    <button type="button" className={styles.iconBtn} onClick={() => setEditingId(null)} title="Отмена">
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className={styles.info}>
                                    <span className={styles.name}>{item.name}</span>
                                    {hasDescription && (
                                        <span className={styles.desc}>
                                            {'description' in item && item.description ? item.description : '—'}
                                        </span>
                                    )}
                                </div>
                                <div className={styles.controls}>
                                    <button type="button" className={styles.iconBtn} onClick={() => startEdit(item)} title="Редактировать">
                                        ✎
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.iconBtn} ${styles.danger}`}
                                        onClick={() => void onRemove(item.id)}
                                        title="Удалить"
                                    >
                                        ✕
                                    </button>
                                </div>
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
                {hasDescription && (
                    <textarea
                        className={styles.addTextarea}
                        value={newDescription}
                        placeholder="Описание (необязательно)"
                        rows={2}
                        onChange={(e) => setNewDescription(e.target.value)}
                    />
                )}
                <button
                    type="button"
                    className={styles.addBtn}
                    disabled={!newName.trim()}
                    onClick={() => void handleCreate()}
                >
                    + Создать
                </button>
            </div>
        </div>
    );
}




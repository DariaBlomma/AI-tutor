import type { Topic, TaskType } from '@/tasks/types';

/** Элемент справочника: тема (только name) или учебный тип (name + description). */
export type RefItem = Topic | TaskType;

export interface RefCrudPanelProps {
    title: string;
    items: RefItem[];
    /** Создание элемента по названию (POST /topics или /task-types). */
    onCreate: (name: string) => Promise<unknown>;
    onRename: (id: number, name: string) => Promise<boolean>;
    onRemove: (id: number) => Promise<boolean>;
}

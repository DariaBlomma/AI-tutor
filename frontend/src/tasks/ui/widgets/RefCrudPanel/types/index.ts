import type { Topic, TaskType } from '@/tasks/types';

/** Элемент справочника: тема (только name) или учебный тип (name + description). */
export type RefItem = Topic | TaskType;

export interface RefCrudPanelProps {
    title: string;
    items: RefItem[];
    /** Показывать поле «Описание» (для учебных типов; у тем описания нет). */
    hasDescription?: boolean;
    /** Создание элемента (POST /topics или /task-types). Описание — только для типов. */
    onCreate: (name: string, description?: string) => Promise<unknown>;
    /** Обновление (PUT). description === null означает «очистить поле» (важно для task-types). */
    onRename: (id: number, name: string, description: string | null) => Promise<boolean>;
    onRemove: (id: number) => Promise<boolean>;
}

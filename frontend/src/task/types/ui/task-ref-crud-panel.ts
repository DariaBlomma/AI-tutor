import type { Topic, GrammarType } from '@/task/types';

/** Элемент справочника: тема (только name) или грамматический тип (name + description). */
export type TaskRefItem = Topic | GrammarType;

export interface TaskRefCrudPanelProps {
    title: string;
    items: TaskRefItem[];
    /** Показывать поле «Описание» (для грамматических типов; у тем описания нет). */
    hasDescription?: boolean;
    /** Создание элемента (POST /topics или /task-types). Описание — только для типов. */
    onCreate: (name: string, description?: string) => Promise<unknown>;
    /** Обновление (PUT). description === null означает «очистить поле» (важно для task-types). */
    onRename: (id: number, name: string, description: string | null) => Promise<boolean>;
    onRemove: (id: number) => Promise<boolean>;
}

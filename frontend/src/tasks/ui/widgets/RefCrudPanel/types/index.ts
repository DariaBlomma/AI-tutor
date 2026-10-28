import type { Topic, GrammarType } from '@/tasks/types';

/** Элемент справочника: тема (только name) или грамматический тип (name + description). */
export type RefItem = Topic | GrammarType;

export interface RefCrudPanelProps {
    title: string;
    items: RefItem[];
    /** Показывать поле «Описание» (для грамматических типов; у тем описания нет). */
    hasDescription?: boolean;
    /** Создание элемента (POST /topics или /task-types). Описание — только для типов. */
    onCreate: (name: string, description?: string) => Promise<unknown>;
    /** Обновление (PUT). description === null означает «очистить поле» (важно для task-types). */
    onRename: (id: number, name: string, description: string | null) => Promise<boolean>;
    onRemove: (id: number) => Promise<boolean>;
}

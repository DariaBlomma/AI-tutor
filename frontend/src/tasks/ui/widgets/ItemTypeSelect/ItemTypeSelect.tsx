import { BaseSelectSingle } from '@/shared/ui-kit/BaseSelectSingle/BaseSelectSingle';
import { ITEM_TYPES } from '@/tasks/data';
import type { ItemType } from '@/tasks/types';
import type { ItemTypeSelectProps } from './types';

// Выбор механики задания (enum ItemType бэка) до конструктора пунктов:
// тип определяет набор полей карточки пункта и необходимость текста-материала.
export function ItemTypeSelect({ value, onChange }: ItemTypeSelectProps) {
    return (
        <BaseSelectSingle<ItemType>
            options={ITEM_TYPES}
            value={value}
            onChange={onChange}
            ariaLabel="Тип задания"
        />
    );
}

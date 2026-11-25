import { BaseSelectSingle } from '@/shared/ui-kit/BaseSelectSingle/BaseSelectSingle';
import { ITEM_TYPES } from '@/task/data';
import type { ItemType } from '@/task/types';
import type { TaskItemTypeSelectProps } from '@/task/types/ui';

// Выбор механики задания (enum ItemType бэка) до конструктора пунктов:
// тип определяет набор полей карточки пункта и необходимость текста-материала.
export function TaskItemTypeSelect({ value, onChange, disabled = false, label, isRequired }: TaskItemTypeSelectProps) {
    return (
        <BaseSelectSingle<ItemType>
            options={ITEM_TYPES}
            value={value}
            onChange={onChange}
            isDisabled={disabled}
            label={label}
            isRequired={isRequired}
        />
    );
}

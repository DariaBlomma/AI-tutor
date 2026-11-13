import type { ItemType } from '@/tasks/types';

export interface ItemTypeSelectProps {
    value: ItemType;
    onChange: (itemType: ItemType) => void;
    /** Режим редактирования: механику задания менять нельзя (задаётся при создании). */
    disabled?: boolean;
    /** Видимый лейбл над полем. */
    label?: string;
    /** Показывать красную звёздочку перед лейблом. */
    isRequired?: boolean;
}

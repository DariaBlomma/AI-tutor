import type { ItemType } from '@/tasks/types';

export interface ItemTypeSelectProps {
    value: ItemType;
    onChange: (itemType: ItemType) => void;
    /** Режим редактирования: механику задания менять нельзя (задаётся при создании). */
    disabled?: boolean;
}

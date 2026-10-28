import type { ItemType } from '@/tasks/types';

export interface ItemTypePickerProps {
    value: ItemType;
    onChange: (itemType: ItemType) => void;
}

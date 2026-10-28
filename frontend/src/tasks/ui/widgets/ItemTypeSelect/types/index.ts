import type { ItemType } from '@/tasks/types';

export interface ItemTypeSelectProps {
    value: ItemType;
    onChange: (itemType: ItemType) => void;
}

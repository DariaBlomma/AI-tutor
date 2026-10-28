import { ITEM_TYPES } from '@/tasks/data';
import type { ItemTypePickerProps } from './types';
import styles from './ItemTypePicker.module.scss';

// Выбор механики задания (enum ItemType бэка) перед конструктором пунктов:
// тип задаёт набор полей формы и необходимость текста-материала.
export function ItemTypePicker({ value, onChange }: ItemTypePickerProps) {
    return (
        <div className={styles.grid}>
            {ITEM_TYPES.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    className={`${styles.option} ${value === option.value ? styles.selected : ''}`}
                    onClick={() => onChange(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

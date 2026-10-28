import { Link } from '@tanstack/react-router';
import type { ChipsMultiselectProps } from './types';
import styles from './ChipsMultiselect.module.scss';

// Мультивыбор чипов по id справочника (темы / учебные типы).
// single=true — режим фильтра: один выбранный id, повторный клик снимает выбор.
// Кнопка «+» справа — ссылка на страницу управления соответствующим справочником
// (создание/редактирование/удаление).
export function ChipsMultiselect({ items, selectedIds, onChange, manageTo, single, onClear, clearLabel }: ChipsMultiselectProps) {
    const toggle = (id: number) => {
        if (single) {
            onChange(selectedIds.includes(id) ? [] : [id]);
            return;
        }
        onChange(
            selectedIds.includes(id)
                ? selectedIds.filter((selected) => selected !== id)
                : [...selectedIds, id],
        );
    };

    return (
        <div className={styles.row}>
            <div className={styles.chips}>
                {!items.length && <div className={styles.empty}>Список пуст — добавьте элемент.</div>}
                {items.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className={`${styles.chip} ${selectedIds.includes(item.id) ? styles.selected : ''}`}
                        onClick={() => toggle(item.id)}
                    >
                        {item.name}
                    </button>
                ))}
                {onClear && selectedIds.length > 0 && (
                    <button type="button" className={`${styles.chip} ${styles.clearChip}`} onClick={onClear}>
                        {clearLabel ?? 'Сбросить'}
                    </button>
                )}
            </div>

            {manageTo && (
                <Link to={manageTo} className={styles.addBtn} aria-label="Управление справочником">
                    +
                </Link>
            )}
        </div>
    );
}

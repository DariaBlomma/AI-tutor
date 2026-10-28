import { PlusLinkButton } from '@/shared/ui-kit/PlusLinkButton/PlusLinkButton';
import type { ChipsMultiselectProps } from './types';
import styles from './ChipsMultiselect.module.scss';

// Мультивыбор чипов по id справочника (темы / грамматические типы).
// single=true — режим фильтра: один выбранный id, повторный клик снимает выбор.
// Чип «Все» показывается всегда, когда есть хотя бы один элемент списка;
// в режиме single он активен, когда ничего не выбрано (пустой фильтр = «Все»).
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

    const allActive = single && selectedIds.length === 0;

    return (
        <div className={styles.row}>
            <div className={styles.chips}>
                {!items.length && <div className={styles.empty}>Список пуст — добавьте элемент.</div>}
                {items.length > 0 && onClear && (
                    <button
                        type="button"
                        className={`${styles.chip} ${styles.clearChip} ${allActive ? styles.selected : ''}`}
                        onClick={onClear}
                    >
                        {clearLabel ?? 'Все'}
                    </button>
                )}
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
            </div>

            {manageTo && (
                <PlusLinkButton to={manageTo} ariaLabel="Управление справочником" />
            )}
        </div>
    );
}

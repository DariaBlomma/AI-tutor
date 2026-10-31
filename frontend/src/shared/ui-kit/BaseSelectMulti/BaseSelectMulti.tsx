// Базовый мультивыбор (react-select isMulti) в стиле проекта — пара к BaseSelectSingle:
// та же библиотека и те же CSS-классы темы (тёмная фиолетовая гамма).
// Стандартный подход для кликабельных элементов: hover/active меняют цвет, не размер.
import Select, { type GroupBase, type MultiValue, type OptionsOrGroups } from 'react-select';
import type { BaseSelectMultiProps } from './types';
import styles from './BaseSelectMulti.module.scss';

type Option = { value: string; label: string };

export function BaseSelectMulti<TValue extends string = string>({
    options,
    value,
    onChange,
    placeholder = 'Выберите...',
    isDisabled,
    className,
    ariaLabel,
}: BaseSelectMultiProps<TValue>) {
    const selected: Option[] = value
        .map((v) => options.find((o) => o.value === v))
        .filter((o): o is Option => o != null);

    return (
        <div className={className} style={{ width: '100%' }}>
            <Select<Option, true>
                isMulti
                options={options as unknown as OptionsOrGroups<Option, GroupBase<Option>>}
                value={selected}
                onChange={(next: MultiValue<Option>) => onChange(next.map((o) => o.value as TValue))}
                placeholder={placeholder}
                isDisabled={isDisabled}
                isClearable={false}
                aria-label={ariaLabel}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                unstyled
                menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                menuShouldBlockScroll={false}
                components={{
                    DropdownIndicator: (props) => (
                        <div {...props.innerProps} className={styles.dropdownIndicator}>
                            <span className={styles.arrow} aria-hidden="true">
                                ▾
                            </span>
                        </div>
                    ),
                    IndicatorSeparator: () => null,
                }}
                classNames={{
                    control: ({ isFocused }) => `${styles.control} ${isFocused ? styles.controlFocused : ''}`,
                    valueContainer: () => styles.valueContainer,
                    placeholder: () => styles.placeholder,
                    indicatorsContainer: () => styles.indicatorsContainer,
                    multiValue: () => styles.multiValue,
                    multiValueLabel: () => styles.multiValueLabel,
                    multiValueRemove: () => styles.multiValueRemove,
                    menu: () => styles.menu,
                    menuList: () => styles.menuList,
                    option: ({ isSelected, isFocused }) =>
                        `${styles.option} ${isSelected ? styles.optionSelected : ''} ${isFocused ? styles.optionFocused : ''}`,
                }}
                styles={{
                    control: (base) => ({ ...base, minHeight: 0, width: '100%', cursor: isDisabled ? 'not-allowed' : 'pointer' }),
                    menuPortal: (base) => ({ ...base, zIndex: 300 }),
                    valueContainer: (base) => ({ ...base, padding: '2px 8px' }),
                }}
            />
        </div>
    );
}

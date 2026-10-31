// Базовый мультивыбор (react-select isMulti) в стиле проекта — пара к BaseSelectSingle:
// та же библиотека и те же CSS-классы темы (тёмная фиолетовая гамма).
// Стандартный подход для кликабельных элементов: hover/active меняют цвет, не размер.
import Select from 'react-select';
import type { BaseSelectMultiProps } from './types';
import styles from './BaseSelectMulti.module.scss';

export function BaseSelectMulti<TValue extends string = string>({
    options,
    value,
    onChange,
    placeholder = 'Выберите...',
    isDisabled,
    className,
    ariaLabel,
}: BaseSelectMultiProps<TValue>) {
    type RSType = { readonly value: string; readonly label: string };
    const rsOptions: ReadonlyArray<RSType> = options;
    const selected: RSType[] = value
        .map((v) => options.find((o) => o.value === v))
        .filter((o): o is { value: TValue; label: string } => o != null);

    return (
        <div className={className} style={{ width: '100%' }}>
            <Select<RSType, true>
                isMulti
                options={rsOptions}
                value={selected}
                onChange={(next) => onChange(next.map((o) => o.value as TValue))}
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

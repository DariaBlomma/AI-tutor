import { useCallback } from 'react';
import CreatableSelect from 'react-select/creatable';
import type { MultiValue } from 'react-select';
import type { CourseSelectMultiProps } from './types';
import styles from './CourseSelectMulti.module.scss';

type RSType = { readonly value: string; readonly label: string };

export function CourseSelectMulti({
                                      options,
                                      value,
                                      onChange,
                                      placeholder = 'Выберите курсы',
                                      isDisabled,
                                      className,
                                      ariaLabel,
                                      error,
                                      onCreateCourse,
                                  }: CourseSelectMultiProps) {
    const rsOptions: ReadonlyArray<RSType> = options;
    const selected: RSType[] = value
        .map((v) => options.find((o) => o.value === v))
        .filter((o): o is RSType => o != null);

    const handleChange = useCallback(
        (newValue: MultiValue<RSType>) => {
            onChange(newValue.map((o) => o.value));
        },
        [onChange],
    );

    // CreatableSelect сам вызывает эту функцию, когда пользователь
    // вводит новое название и нажимает Enter (или кликает на "Создать ...")
    const handleCreateOption = useCallback(
        async (inputValue: string) => {
            const trimmed = inputValue.trim();
            if (!trimmed) return;
            const error = await onCreateCourse(trimmed);
            if (error) {
                // В случае ошибки можно показать уведомление через тосты
                console.error('Ошибка создания курса:', error);
            }
            // После успешного создания родитель обновит options,
            // и новый курс автоматически появится в списке
        },
        [onCreateCourse],
    );

    return (
        <div className={className} style={{ width: '100%' }}>
            <CreatableSelect<RSType, true>
                isMulti
                options={rsOptions}
                value={selected}
                onChange={handleChange}
                onCreateOption={handleCreateOption}
                placeholder={placeholder}
                isDisabled={isDisabled}
                isClearable={false}
                aria-label={ariaLabel}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                unstyled
                menuPortalTarget={undefined}
                menuShouldBlockScroll={false}
                // Кастомизация текста подсказки при создании
                formatCreateLabel={(inputValue) => `Создать курс «${inputValue}»`}
                // Валидация: не показывать кнопку создания, если опция уже существует
                isValidNewOption={(inputValue, _value, opts) => {
                    const trimmed = inputValue.trim();
                    if (!trimmed) return false;
                    return !opts.some(
                        (o) => o.label.toLowerCase() === trimmed.toLowerCase(),
                    );
                }}
                components={{
                    DropdownIndicator: (props: any) => (
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
                    // Стилизация самой опции "Создать курс ..."
                    createOption: () => styles.createOption,
                }}
                styles={{
                    control: (base: any) => ({ ...base, minHeight: 0, width: '100%', cursor: isDisabled ? 'not-allowed' : 'pointer' }),
                    menuPortal: (base: any) => ({ ...base, zIndex: 300 }),
                    valueContainer: (base: any) => ({ ...base, padding: '2px 8px' }),
                }}
            />
            {error && <div className={styles.errorText}>{error}</div>}
        </div>
    );
}
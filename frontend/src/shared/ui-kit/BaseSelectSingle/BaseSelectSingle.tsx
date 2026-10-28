// Базовый однострочный селект (react-select) в стиле проекта.
// Стандартный подход для кликабельных элементов: hover/active меняют цвет, не размер
// (см. правило в shared/styles/global.scss).
import Select, {
  type GroupBase,
  type OptionsOrGroups,
  type StylesConfig,
} from "react-select";
import type { BaseSelectOption, BaseSelectSingleProps } from "./types";
import styles from "./BaseSelectSingle.module.scss";

// Стили react-select минимальны: всё остальное — CSS-модуль через classNames,
// чтобы наследовать CSS-переменные темы и псевдосостояния (:hover/:active).
const selectStyles: StylesConfig<BaseSelectOption<string>, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 0,
    width: "100%",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
  }),
  menu: (base) => ({ ...base, zIndex: 200 }),
  menuPortal: (base) => ({ ...base, zIndex: 300 }),
  valueContainer: (base) => ({ ...base, padding: "2px 8px" }),
};

export function BaseSelectSingle<TValue extends string = string>({
  options,
  value,
  onChange,
  placeholder = "Выберите...",
  isDisabled,
  className,
  ariaLabel,
}: BaseSelectSingleProps<TValue>) {
  const selected =
    value != null ? (options.find((o) => o.value === value) ?? null) : null;

  return (
    <div className={className} style={{ width: "100%" }}>
      <Select<BaseSelectOption<string>, false>
        options={
          options as unknown as OptionsOrGroups<
            BaseSelectOption<string>,
            GroupBase<BaseSelectOption<string>>
          >
        }
        value={selected}
        onChange={(option) => {
          if (option && !Array.isArray(option)) {
            onChange(option.value as TValue);
          }
        }}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isClearable={false}
        isSearchable={false}
        aria-label={ariaLabel}
        styles={selectStyles}
        menuPortalTarget={
          typeof document !== "undefined" ? document.body : undefined
        }
        menuShouldBlockScroll={false}
        unstyled
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
          control: ({ isFocused }) =>
            `${styles.control} ${isFocused ? styles.controlFocused : ""}`,
          valueContainer: () => styles.valueContainer,
          singleValue: () => styles.singleValue,
          placeholder: () => styles.placeholder,
          indicatorsContainer: () => styles.indicatorsContainer,
          menu: () => styles.menu,
          menuList: () => styles.menuList,
          option: ({ isSelected, isFocused }) =>
            `${styles.option} ${isSelected ? styles.optionSelected : ""} ${isFocused ? styles.optionFocused : ""}`,
        }}
      />
    </div>
  );
}

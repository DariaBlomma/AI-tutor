import { BaseInputText } from '@/shared/ui-kit/BaseInputText/BaseInputText';
import type { InstructionSectionProps } from './types';
import styles from './InstructionSection.module.scss';

// Блок «Инструкция» — необязательное ТЗ для ученика («что нужно сделать в задании»).
// Есть у любого типа заданий (tasks.instruction, миграция 018); на механику не влияет.
export function InstructionSection({ value, maxLength, onChange, error, disabled = false }: InstructionSectionProps) {
    return (
        <div className={styles.section}>
            <div className={styles.sectionTitle}>
                <span>Инструкция</span>
                <span className={styles.optional}>необязательно</span>
            </div>

            <div className={styles.field}>
                <label className={styles.fieldLabel}>Что нужно сделать в задании</label>
                <BaseInputText
                    value={value}
                    maxLength={maxLength}
                    placeholder="Например: Complete the sentences with the correct form of the word in brackets"
                    error={error}
                    disabled={disabled}
                    readOnly={disabled}
                    onChange={(e) => onChange(e.target.value)}
                />
                <div className={`${styles.counter} ${value.length > maxLength ? styles.over : ''}`}>
                    {value.length} / {maxLength}
                </div>
            </div>
        </div>
    );
}

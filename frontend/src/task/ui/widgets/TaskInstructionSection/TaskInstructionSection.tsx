import { BaseInputText } from '@/shared/ui-kit/BaseInputText/BaseInputText';
import type { TaskInstructionSectionProps } from '@/task/types/ui';
import styles from './TaskInstructionSection.module.scss';

// Блок «Инструкция» — необязательное ТЗ для ученика («что нужно сделать в задании»).
// Есть у любого типа заданий (tasks.instruction, миграция 018); на механику не влияет.
export function TaskInstructionSection({ value, maxLength, onChange, error, disabled = false }: TaskInstructionSectionProps) {
    return (
        <div className={styles.section}>
            <div className={styles.sectionTitle}>Инструкция</div>

            <div className={styles.field}>
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

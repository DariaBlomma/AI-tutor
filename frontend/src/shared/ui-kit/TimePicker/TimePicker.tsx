import { InputHTMLAttributes, forwardRef } from 'react';
import styles from './TimePicker.module.scss';

interface TimePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
    /** Значение в формате HH:mm (соответствует datetime-local). */
    value: string;
    onChange: (value: string) => void;
}

/**
 * Нативный HTML5 пикер времени.
 * Формат: HH:mm (24-часовой формат).
 */
export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(
    ({ value, onChange, className, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(e.target.value);
        };

        return (
            <div className={`${styles.wrapper} ${className || ''}`}>
                <input
                    ref={ref}
                    type="time"
                    className={styles.input}
                    value={value}
                    onChange={handleChange}
                    {...props}
                />
            </div>
        );
    }
);
TimePicker.displayName = 'TimePicker';

import styles from './BaseLabel.module.scss';

interface BaseLabelProps {
    /** Текст лейбла. */
    label: string;
    /** Дополнительный класс. */
    className?: string;
}

export function BaseLabel({ label, className }: BaseLabelProps) {
    return <label className={`${styles.label} ${className || ''}`}>{label}</label>;
}

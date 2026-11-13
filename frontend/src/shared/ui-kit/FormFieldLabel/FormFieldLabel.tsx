import { RequiredBadge } from '@/shared/ui-kit/RequiredBadge/RequiredBadge';
import { BaseLabel } from '@/shared/ui-kit/BaseLabel/BaseLabel';
import styles from './FormFieldLabel.module.scss';

interface FormFieldLabelProps {
    /** Текст лейбла. Если не передан — рендерится только звёздочка (если isRequired). */
    label?: string;
    /** Показывать красную звёздочку перед лейблом. */
    isRequired?: boolean;
    /** Дополнительный класс. */
    className?: string;
}

/**
 * Компонент лейбла формы: звёздочка + BaseLabel.
 * Если label не передан — рендерит только звёздочку (если isRequired).
 */
export function FormFieldLabel({ label, isRequired, className }: FormFieldLabelProps) {
    if (!label && !isRequired) return null;

    return (
        <div className={`${styles.fieldLabelRow} ${className || ''}`}>
            {isRequired && <RequiredBadge />}
            {label && <BaseLabel label={label} />}
        </div>
    );
}

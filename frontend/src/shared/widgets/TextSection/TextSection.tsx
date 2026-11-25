import { BaseInputText } from '@/shared/ui-kit/BaseInputText/BaseInputText';
import type { TextSectionProps } from './types';
import styles from './TextSection.module.scss';

// Блок «Текст» — материал задания для TFNS/MATCHING (tasks.context, type=TEXT).
// Аудио-материал бэк формально допускает, но он не реализован — только текст.
export function TextSection({ title, text, onTitleChange, onTextChange, required, error, disabled = false }: TextSectionProps) {
    return (
        <div className={styles.section}>
            <div className={styles.sectionTitle}>
                <span>Текст</span>
                {required && <span className={styles.req}>*</span>}
            </div>

            <div className={styles.field}>
                <label className={styles.fieldLabel}>Заголовок</label>
                <BaseInputText
                    value={title}
                    placeholder="Например: Reading passage about travel"
                    disabled={disabled}
                    readOnly={disabled}
                    onChange={(e) => onTitleChange(e.target.value)}
                />
            </div>

            <div className={styles.field}>
                <label className={styles.fieldLabel}>
                    Текст {required && <span className={styles.req}>*</span>}
                </label>
                <textarea
                    className={`${styles.textarea} ${error ? styles.textareaError : ''}`}
                    value={text}
                    placeholder="Вставьте текст, по которому будут составляться утверждения..."
                    disabled={disabled}
                    readOnly={disabled}
                    onChange={(e) => onTextChange(e.target.value)}
                />
                {error && <div className={styles.fieldError}>{error}</div>}
            </div>
        </div>
    );
}

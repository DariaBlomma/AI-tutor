import { BaseInputText } from '@/shared/ui-kit/BaseInputText/BaseInputText';
import type { MaterialSectionProps } from './types';
import styles from './MaterialSection.module.scss';

// Блок «Материал»: переключатель Текст/Аудио + поля заголовка и текста.
// Вкладка Аудио пока всегда disabled (загрузка аудио ещё не реализована).
export function MaterialSection({
    format,
    onFormatChange,
    title,
    text,
    onTitleChange,
    onTextChange,
    required,
    error,
}: MaterialSectionProps) {
    return (
        <div className={styles.section}>
            <div className={styles.sectionTitle}>
                <span>Материал</span>
                {required && <span className={styles.required}>обязателен для TFNS / MATCHING</span>}
            </div>

            <div className={styles.toggleRow}>
                <button
                    type="button"
                    className={`${styles.toggleBtn} ${format === 'TEXT' ? styles.active : ''}`}
                    onClick={() => onFormatChange('TEXT')}
                >
                    Текст
                </button>
                <button type="button" className={`${styles.toggleBtn} ${styles.disabled}`} disabled title="Скоро">
                    Аудио
                </button>
            </div>

            <div className={styles.field}>
                <label className={styles.fieldLabel}>Заголовок</label>
                <BaseInputText
                    value={title}
                    placeholder="Например: Reading passage about travel"
                    onChange={(e) => onTitleChange(e.target.value)}
                />
            </div>

            <div className={styles.field}>
                <label className={styles.fieldLabel}>Текст {required && <span className={styles.req}>*</span>}</label>
                <textarea
                    className={`${styles.textarea} ${error ? styles.textareaError : ''}`}
                    value={text}
                    placeholder="Вставьте текст материала..."
                    onChange={(e) => onTextChange(e.target.value)}
                />
                {error && <div className={styles.fieldError}>{error}</div>}
            </div>
        </div>
    );
}

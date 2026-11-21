import styles from './ReportAiComment.module.scss';

export function ReportAiComment() {
    return (
        <div className={styles.placeholder}>
            <span className={styles.icon}>✦</span>
            <p className={styles.text}>
                Комментарий появится после подключения AI-проверки
            </p>
        </div>
    );
}

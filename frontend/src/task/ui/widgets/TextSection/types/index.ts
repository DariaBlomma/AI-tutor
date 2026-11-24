export interface TextSectionProps {
    title: string;
    text: string;
    onTitleChange: (value: string) => void;
    onTextChange: (value: string) => void;
    /** Текст обязателен, если в задании есть TFNS/MATCHING (см. TaskContentValidator.validateContext). */
    required: boolean;
    error?: string;
    /** Блокировка содержательных полей, если задание уже назначено/решено учениками. */
    disabled?: boolean;
}

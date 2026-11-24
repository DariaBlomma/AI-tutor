export interface InstructionSectionProps {
    value: string;
    /** Зеркалит @Size(max = 1000) из TaskCreateRequest/TaskUpdateRequest. */
    maxLength: number;
    onChange: (value: string) => void;
    error?: string;
    /** true, если задание уже назначено/решено — содержательные поля блокируются на странице редактирования. */
    disabled?: boolean;
}

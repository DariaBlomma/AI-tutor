export interface InstructionSectionProps {
    value: string;
    /** Зеркалит @Size(max = 1000) из TaskCreateRequest/TaskUpdateRequest. */
    maxLength: number;
    onChange: (value: string) => void;
    error?: string;
}

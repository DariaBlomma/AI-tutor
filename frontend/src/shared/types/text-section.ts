export interface TextSectionProps {
    title: string;
    text: string;
    onTitleChange: (value: string) => void;
    onTextChange: (value: string) => void;
    required: boolean;
    error?: string;
    disabled?: boolean;
}

import type { MaterialFormat } from '@/tasks/types';

export interface MaterialSectionProps {
    format: MaterialFormat;
    onFormatChange: (format: MaterialFormat) => void;
    title: string;
    text: string;
    onTitleChange: (value: string) => void;
    onTextChange: (value: string) => void;
    /** Обязателен, если в задании есть TFNS/MATCHING. */
    required: boolean;
    error?: string;
}

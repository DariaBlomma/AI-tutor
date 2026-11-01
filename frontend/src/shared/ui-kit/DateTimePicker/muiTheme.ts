import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

/**
 * Локальная MUI-тема для DateTimePicker (см. CODE_STYLE.md: чужие UI-киты не
 * подмешиваем в глобальные стили — тема существует только внутри ThemeProvider
 * виджета и больше нигде). Единственное отличие от стандартной тёмной темы —
 * акцентный цвет: вместо голубого Material Design используется наш фиолетовый
 * $p (#9D7CF2, см. shared/styles/_variables.scss).
 */
export const dateTimePickerTheme: Theme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#9D7CF2' },
        background: { default: '#0F0F0F', paper: '#1A1A1A' },
    },
});

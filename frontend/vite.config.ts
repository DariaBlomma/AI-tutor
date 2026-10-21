import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tanstackRouter from '@tanstack/router-plugin/vite'; // <-- 1. ДОБАВИТЬ ИМПОРТ

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        importers: [
          {
            findFileUrl(url: string) {
              if (!url.startsWith('@/')) return null;
              return new URL('file://' + path.resolve(__dirname, 'src', url.slice(2)));
            },
          },
        ],
      },
    },
  },
  server: {
    port: 5173,
  },
});
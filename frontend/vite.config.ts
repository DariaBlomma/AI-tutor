import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        // @use '@/app/styles/variables' в *.module.scss
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
    // Прокси не используем: API берётся напрямую из VITE_API_URL (см. core/api/AxiosInstance.ts).
  },
});

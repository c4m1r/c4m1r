import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',            // открыть сайт по https://c4m1r.github.io/
  build: {
    outDir: 'site/output'      // чтобы собранные файлы попали в папку `site`
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

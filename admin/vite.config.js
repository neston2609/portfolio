import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite dev server proxies /api to the Express server so the admin SPA can
// run on its own port (5173) during development. In production, Vite builds
// to admin/dist/ and Express serves it directly under admin.<root>.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        headers: { Host: 'admin.rasikawan.com' },
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});

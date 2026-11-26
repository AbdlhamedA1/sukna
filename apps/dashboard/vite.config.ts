import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: true,
    allowedHosts: true,
    port: 4173,
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@icons': '/src/icons'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'icons': ['/src/icons']
        }
      }
    }
  }
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@homurajs/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@homurajs/devtools': path.resolve(__dirname, '../../packages/devtools/src/index.ts'),
      '@homurajs/react': path.resolve(__dirname, '../../packages/react/src/index.ts')
    }
  }
});

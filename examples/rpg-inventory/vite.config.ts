import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@homurajs/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@homurajs/devtools': path.resolve(__dirname, '../../packages/devtools/src/index.ts')
    }
  }
});

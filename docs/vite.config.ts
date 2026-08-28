import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/homura-js/',
  resolve: {
    alias: {
      '@homura-js/core': path.resolve(__dirname, '../packages/core/src/index.ts'),
      '@homura-js/devtools': path.resolve(__dirname, '../packages/devtools/src/index.ts')
    }
  }
});

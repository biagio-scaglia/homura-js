import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@homurajs/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@homurajs/devtools': path.resolve(__dirname, '../../packages/devtools/src/index.ts'),
      '@homurajs/vue': path.resolve(__dirname, '../../packages/vue/src/index.ts')
    }
  }
});

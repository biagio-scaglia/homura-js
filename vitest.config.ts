import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['packages/*/tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/*/src/**/*.ts']
    }
  },
  resolve: {
    alias: {
      '@homura-js/core': path.resolve(__dirname, './packages/core/src/index.ts'),
      '@homura-js/devtools': path.resolve(__dirname, './packages/devtools/src/index.ts'),
      '@homura-js/react': path.resolve(__dirname, './packages/react/src/index.ts'),
      '@homura-js/vue': path.resolve(__dirname, './packages/vue/src/index.ts'),
      '@homura-js/vanilla': path.resolve(__dirname, './packages/vanilla/src/index.ts'),
      '@homurajs/core': path.resolve(__dirname, './packages/core/src/index.ts'),
      '@homurajs/devtools': path.resolve(__dirname, './packages/devtools/src/index.ts'),
      '@homurajs/react': path.resolve(__dirname, './packages/react/src/index.ts'),
      '@homurajs/vue': path.resolve(__dirname, './packages/vue/src/index.ts'),
      '@homurajs/vanilla': path.resolve(__dirname, './packages/vanilla/src/index.ts')
    }
  }
});

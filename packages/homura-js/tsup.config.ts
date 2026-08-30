import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2022',
    external: ['@homura-js/core', '@homura-js/devtools', '@homura-js/vanilla']
  },
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    globalName: 'Homura',
    sourcemap: true,
    target: 'es2020',
    noExternal: ['@homura-js/core', '@homura-js/devtools', '@homura-js/vanilla']
  }
]);

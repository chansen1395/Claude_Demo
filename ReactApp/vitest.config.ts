/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    pool: 'forks',
    forks: {
      minForks: 4,
      maxForks: 8,
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/vite-env.d.ts',
        'src/styled.d.ts',
        'src/engine/types.ts',
        'src/**/*.test.{ts,tsx}',
        'src/__tests__/**',
      ],
      thresholds: {
        statements: 98,
        branches: 95,
        functions: 100,
        lines: 99,
      },
    },
  },
});

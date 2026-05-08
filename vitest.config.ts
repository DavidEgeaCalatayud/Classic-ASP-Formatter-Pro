import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/test/**/*.test.ts', 'src/formatter/**/__tests__/**/*.test.ts'],
    exclude: ['node_modules', 'out'],
  },
});

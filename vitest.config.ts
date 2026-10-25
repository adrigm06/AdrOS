import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Never load the developer's .env files into unit tests.
  envDir: false,
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});

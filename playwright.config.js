import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'e2e.spec.js',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3010',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  reporter: [['list']],
  webServer: {
    command: 'npx vite --port 3010',
    port: 3010,
    reuseExistingServer: true,
    timeout: 30000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});

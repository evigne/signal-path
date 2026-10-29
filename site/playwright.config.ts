import { defineConfig, devices } from '@playwright/test';

// Runs against the static build (npm run build first).
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  // python's http.server occasionally resets a connection under parallel load.
  retries: 1,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:4322' },
  webServer: {
    command: 'python3 -m http.server 4322 --bind 127.0.0.1 --directory dist',
    url: 'http://127.0.0.1:4322/',
    reuseExistingServer: true,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});

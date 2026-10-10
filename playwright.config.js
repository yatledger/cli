import { defineConfig, devices } from '@playwright/test'

const PORT = 9100
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          // Prefer a system Chrome to avoid downloading a browser.
          // Set CHROME_PATH to override.
          executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome-stable',
          args: ['--no-sandbox', '--disable-dev-shm-usage']
        }
      }
    }
  ],
  webServer: {
    command: 'node scripts/serve-dist.mjs',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 30000
  }
})

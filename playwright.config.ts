import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Vibe Framework demo
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',

  // Test timeout
  timeout: 60000,

  // Fail fast on CI
  fullyParallel: false,

  // Retry failed tests
  retries: process.env.CI ? 2 : 0,

  // Parallel workers (increase for faster execution)
  workers: process.env.CI ? 2 : 3,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list']
  ],

  // Shared settings for all tests
  use: {
    // Base URL for navigation
    baseURL: 'https://www.saucedemo.com',

    // Collect trace on failure
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video recording (managed by vibe-framework)
    video: 'retain-on-failure',

    // Browser viewport
    viewport: { width: 1280, height: 720 },
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment to test on other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});

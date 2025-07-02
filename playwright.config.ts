// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e/tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 2 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  outputDir: 'test-results',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {name: 'setup', testMatch: /.*\.setup\.ts/},
    
    // Cluster tests (new project for cluster functionality)
    {
      name: '[Cluster] - Chromium',
      use: { 
        ...devices['Desktop Chrome'],
      },
      grep: /@cluster/,
      testMatch: /.*cluster\.spec\.ts$/,
    },
    {
      name: '[Cluster] - Firefox',
      use: { 
        ...devices['Desktop Firefox'],
      },
      grep: /@cluster/,
      testMatch: /.*cluster\.spec\.ts$/,
    },
    
    // Regular projects for sharding (exclude TLS and settings)
    {
      name: '[Admin] Chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup'],
      grep: /@admin/,
      testIgnore: /.*settingsConfig\.spec\.ts$|.*tls\.spec\.ts$|.*cluster\.spec\.ts$/,
    },
    {
      name: '[Admin] Firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup'],
      grep: /@admin/,
      testIgnore: /.*settingsConfig\.spec\.ts$|.*tls\.spec\.ts$|.*cluster\.spec\.ts$/,
    },
    {
      name: '[Read-Write] - Chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/readwriteuser.json',
      },
      dependencies: ['setup'],
      grep: /@readwrite/,
      testIgnore: /.*tls\.spec\.ts$|.*cluster\.spec\.ts$/,
    },
    {
      name: '[Read-Write] - Firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/readwriteuser.json',
      },
      dependencies: ['setup'],
      grep: /@readwrite/,
      testIgnore: /.*tls\.spec\.ts$|.*cluster\.spec\.ts$/,
    },
    {
      name: '[Read-Only] - Chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/readonlyuser.json',
      },
      dependencies: ['setup'],
      grep: /@readonly/,
      testIgnore: /.*tls\.spec\.ts$|.*cluster\.spec\.ts$/,
    },
    {
      name: '[Read-Only] - Firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/readonlyuser.json',
      },
      dependencies: ['setup'],
      grep: /@readonly/,
      testIgnore: /.*tls\.spec\.ts$|.*cluster\.spec\.ts$/,
    },

    // Settings tests (run separately)
    {
      name: '[Admin: Settings - Chromium]',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/admin.json',
      },
      grep: /@admin|@config/,
      dependencies: ['setup'],
      testMatch: /.*(settingsConfig|settingsUsers)\.spec\.ts$/,
    },
    {
      name: '[Admin: Settings - Firefox]',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/admin.json',
      },
      grep: /@admin|@config/,
      dependencies: ['setup'],
      testMatch: /.*(settingsConfig|settingsUsers)\.spec\.ts$/,
    },

    // TLS tests (run separately)
    {
      name: '[TLS - Chromium]',
      use: {
        ...devices['Desktop Chrome'],
      },
      grep: /@tls/,
    },
    {
      name: '[TLS - Firefox]',
      use: {
        ...devices['Desktop Firefox'],
      },
      grep: /@tls/,
    }, 

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

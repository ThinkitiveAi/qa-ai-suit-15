/**
 * @fileoverview Playwright Test Configuration
 * @description Professional test configuration for healthcare automation framework
 * @author Sainath Gaikwad - QA Core Team
 * @team QA Core
 * @version 1.0.0
 */

import { defineConfig, devices } from '@playwright/test';
import { TEST_CONFIG } from './src/config/test.config';

export default defineConfig({
  // Test directory configuration
  testDir: './tests',
  
  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? TEST_CONFIG.retries.onCI : TEST_CONFIG.retries.onLocal,
  workers: process.env.CI ? TEST_CONFIG.workers.onCI : TEST_CONFIG.workers.onLocal,
  
  // Global test timeout
  timeout: TEST_CONFIG.timeouts.test,
  
  // Expect timeout for assertions
  expect: {
    timeout: TEST_CONFIG.timeouts.assertion
  },
  
  // Reporter configuration
  reporter: [
    ['html', { 
      outputFolder: 'reports/html-report',
      open: 'never'
    }],
    ['json', { 
      outputFile: 'reports/test-results.json'
    }],
    ['junit', { 
      outputFile: 'reports/junit-results.xml'
    }],
    ['line']
  ],
  
  // Output directories
  outputDir: 'test-results/',
  
  // Global test configuration
  use: {
    // Base URL for all tests
    baseURL: process.env.BASE_URL || 'https://stage_aithinkitive.uat.provider.ecarehealth.com',
    
    // Browser settings - Always run in headed mode
    headless: false,
    viewport: TEST_CONFIG.browser.viewport,
    
    // Timeouts
    actionTimeout: TEST_CONFIG.timeouts.element,
    navigationTimeout: TEST_CONFIG.timeouts.navigation,
    
    // Screenshots and videos
    screenshot: TEST_CONFIG.capture.screenshot as 'off' | 'on' | 'only-on-failure',
    video: TEST_CONFIG.capture.video as 'off' | 'on' | 'retain-on-failure' | 'on-first-retry',
    trace: TEST_CONFIG.capture.trace as 'off' | 'on' | 'retain-on-failure' | 'on-first-retry',
    
    // Other settings
    ignoreHTTPSErrors: true,
    colorScheme: 'light',
  },

  // Browser projects - simplified to Chrome only
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Chrome-specific settings
        launchOptions: {
          args: ['--no-sandbox', '--disable-web-security'],
          slowMo: 500  // Slow down for better visibility in headed mode
        }
      },
    },
  ],
  // Simple configuration

  // Web server configuration (for local development)
  webServer: process.env.NODE_ENV === 'development' ? {
    command: 'npm start',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  } : undefined,
});

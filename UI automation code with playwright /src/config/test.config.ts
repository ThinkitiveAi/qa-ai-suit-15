/**
 * @fileoverview Test configuration and environment settings
 * @author Senior QA Automation Engineer
 * @version 1.0.0
 */

import { TestEnvironment, UserCredentials } from '../types/test-data.types';
import { TIMEOUTS, APP_URLS } from '../constants/app.constants';

const DEFAULT_CREDENTIALS: UserCredentials = {
  email: 'rose.gomez@jourrapide.com',
  password: 'Pass@123',
  role: 'admin'
};

export const TEST_CONFIG = {
  // Browser settings
  browser: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    slowMo: 100
  },
  
  // Timeout configurations
  timeouts: {
    test: TIMEOUTS.TEST_TIMEOUT,
    navigation: TIMEOUTS.NAVIGATION,
    element: TIMEOUTS.EXTRA_LONG,
    assertion: TIMEOUTS.MEDIUM
  },
  
  // Retry configurations
  retries: {
    onCI: 2,
    onLocal: 1
  },
  
  // Parallel execution
  workers: {
    onCI: 4,
    onLocal: 2
  },
  
  // Screenshot and video settings
  capture: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure'
  }
} as const;

export const ENVIRONMENTS: Record<string, TestEnvironment> = {
  staging: {
    name: 'staging',
    baseUrl: APP_URLS.BASE_URL,
    credentials: DEFAULT_CREDENTIALS
  },
  production: {
    name: 'production',
    baseUrl: 'https://provider.ecarehealth.com',
    credentials: {
      email: process.env.PROD_EMAIL || '',
      password: process.env.PROD_PASSWORD || '',
      role: 'admin'
    }
  },
  development: {
    name: 'development',
    baseUrl: 'https://dev.provider.ecarehealth.com',
    credentials: DEFAULT_CREDENTIALS
  }
};

export const getCurrentEnvironment = (): TestEnvironment => {
  const env = process.env.TEST_ENV || 'staging';
  return ENVIRONMENTS[env] || ENVIRONMENTS.staging;
};

export const getBaseUrl = (): string => {
  return getCurrentEnvironment().baseUrl;
};

export const getCredentials = (): UserCredentials => {
  return getCurrentEnvironment().credentials;
}; 
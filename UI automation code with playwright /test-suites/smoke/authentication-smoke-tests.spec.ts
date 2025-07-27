/**
 * @fileoverview Authentication Smoke Tests
 * @description Quick validation tests for login and authentication functionality
 * @author Senior QA Automation Engineer
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test';
import { getCredentials } from '../../src/config/test.config';
import { APP_URLS } from '../../src/constants/app.constants';

test.describe('Authentication Smoke Tests', () => {
  
  test('User can successfully login with valid credentials', async ({ page }) => {
    await page.goto(APP_URLS.BASE_URL + APP_URLS.LOGIN);
    
    const credentials = getCredentials();
    await page.getByRole('textbox', { name: 'Email' }).fill(credentials.email);
    await page.getByRole('textbox', { name: '*********' }).fill(credentials.password);
    await page.getByRole('button', { name: 'Let\'s get Started' }).click();
    
    // Verify successful login
    await expect(page).toHaveURL(/.*app.*/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Login form displays all required elements', async ({ page }) => {
    await page.goto(APP_URLS.BASE_URL + APP_URLS.LOGIN);
    
    // Verify form elements
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: '*********' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Let\'s get Started' })).toBeVisible();
  });
}); 
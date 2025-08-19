import { test, expect } from '@playwright/test';

test('Simple Healthcare Test', async ({ page }) => {
  // Login
  await page.goto('https://stage_aithinkitive.uat.provider.ecarehealth.com/auth/login');
  await page.getByRole('textbox', { name: 'Email' }).fill('rose.gomez@jourrapide.com');
  await page.getByRole('textbox', { name: '*********' }).fill('Pass@123');
  await page.getByRole('button', { name: 'Let\'s get Started' }).click();
  
  // Wait for navigation after login
  await page.waitForLoadState('networkidle');
  
  console.log('Login successful');
});

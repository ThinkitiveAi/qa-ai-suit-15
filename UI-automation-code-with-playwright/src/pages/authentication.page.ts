/**
 * @fileoverview Login page object with authentication functionality
 * @author Senior QA Automation Engineer
 * @version 1.0.0
 */

import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { Logger } from '../utils/logger.util';
import { APP_URLS, TIMEOUTS } from '../constants/app.constants';
import { UserCredentials } from '../types/test-data.types';

export class LoginPage extends BasePage {
  // Page selectors
  private readonly selectors = {
    emailInput: 'input[type="email"], [role="textbox"][name="Email"]',
    passwordInput: 'input[type="password"], [role="textbox"][name="*********"]',
    loginButton: 'button:has-text("Let\'s get Started"), [type="submit"]',
    errorMessage: '.error, .alert-danger, [role="alert"]',
    forgotPasswordLink: 'a:has-text("Forgot"), a:has-text("forgot")',
    rememberMeCheckbox: 'input[type="checkbox"]'
  };

  constructor(page: Page) {
    super(page, APP_URLS.BASE_URL + APP_URLS.LOGIN);
  }

  /**
   * Perform login with credentials
   */
  async login(credentials: UserCredentials): Promise<void> {
    Logger.step(1, `Logging in with email: ${credentials.email}`);
    
    await this.navigate();
    await this.waitForPageLoad();
    
    // Fill email
    await this.safeType(this.selectors.emailInput, credentials.email);
    Logger.debug(`Entered email: ${credentials.email}`, 'LoginPage');
    
    // Fill password
    await this.safeType(this.selectors.passwordInput, credentials.password);
    Logger.debug('Entered password', 'LoginPage');
    
    // Click login button
    await this.safeClick(this.selectors.loginButton);
    Logger.debug('Clicked login button', 'LoginPage');
    
    // Wait for navigation away from login page
    await this.waitForLoginSuccess();
    
    Logger.success('Login completed successfully', 'LoginPage');
  }

  /**
   * Quick login method for existing sessions
   */
  async quickLogin(credentials: UserCredentials): Promise<void> {
    const startTime = Date.now();
    
    try {
      await this.page.goto(APP_URLS.BASE_URL + APP_URLS.LOGIN);
      await this.page.getByRole('textbox', { name: 'Email' }).fill(credentials.email);
      await this.page.getByRole('textbox', { name: '*********' }).fill(credentials.password);
      await this.page.getByRole('button', { name: 'Let\'s get Started' }).click();
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.NAVIGATION });
      
      const duration = Date.now() - startTime;
      Logger.performance('Quick login', duration);
      Logger.success('Quick login completed', 'LoginPage');
    } catch (error) {
      Logger.error(`Quick login failed: ${error.message}`, 'LoginPage');
      throw error;
    }
  }

  /**
   * Wait for successful login and navigation
   */
  private async waitForLoginSuccess(): Promise<void> {
    try {
      // Wait for navigation away from login page
      await this.page.waitForURL('**/app/**', { timeout: TIMEOUTS.NAVIGATION });
      Logger.assertion('Successfully navigated away from login page', true);
      
      // Additional verification that we're on the dashboard
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.LONG });
      
    } catch (error) {
      // Check if there's an error message on the login page
      const errorMessage = await this.getLoginErrorMessage();
      if (errorMessage) {
        Logger.error(`Login failed with error: ${errorMessage}`, 'LoginPage');
        throw new Error(`Login failed: ${errorMessage}`);
      }
      
      Logger.error(`Login timeout or navigation failed: ${error.message}`, 'LoginPage');
      throw error;
    }
  }

  /**
   * Get login error message if present
   */
  async getLoginErrorMessage(): Promise<string | null> {
    try {
      const errorElement = this.page.locator(this.selectors.errorMessage);
      if (await errorElement.count() > 0) {
        const errorText = await errorElement.textContent();
        return errorText?.trim() || null;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if user is already logged in
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      const currentUrl = this.page.url();
      const isOnDashboard = currentUrl.includes('/app/');
      
      if (isOnDashboard) {
        Logger.debug('User appears to be already logged in', 'LoginPage');
        return true;
      }
      
      return false;
    } catch (error) {
      Logger.debug('Could not determine login status', 'LoginPage');
      return false;
    }
  }

  /**
   * Logout from the application
   */
  async logout(): Promise<void> {
    try {
      Logger.step(1, 'Logging out of the application');
      
      // Click user menu
      await this.safeClick('button[data-testid="KeyboardArrowRightIcon"], .user-menu, .profile-menu');
      await this.page.waitForTimeout(1000);
      
      // Click logout option
      await this.safeClick('[role="menuitem"]:has-text("Logout"), a:has-text("Logout")');
      
      // Wait for redirect to login page
      await this.page.waitForURL('**/login**', { timeout: TIMEOUTS.MEDIUM });
      
      Logger.success('Logout completed successfully', 'LoginPage');
    } catch (error) {
      Logger.error(`Logout failed: ${error.message}`, 'LoginPage');
      // Continue anyway as logout failure shouldn't break tests
    }
  }

  /**
   * Toggle remember me checkbox
   */
  async toggleRememberMe(shouldCheck: boolean = true): Promise<void> {
    await this.ensureCheckboxState(this.selectors.rememberMeCheckbox, shouldCheck);
    Logger.debug(`Remember me toggled to: ${shouldCheck}`, 'LoginPage');
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword(): Promise<void> {
    await this.safeClick(this.selectors.forgotPasswordLink);
    Logger.debug('Clicked forgot password link', 'LoginPage');
  }

  /**
   * Verify login page elements are visible
   */
  async verifyLoginPageElements(): Promise<void> {
    Logger.step(1, 'Verifying login page elements');
    
    await this.waitForElement(this.selectors.emailInput);
    await this.waitForElement(this.selectors.passwordInput);
    await this.waitForElement(this.selectors.loginButton);
    
    Logger.assertion('All login page elements are visible', true);
  }

  /**
   * Clear login form
   */
  async clearForm(): Promise<void> {
    await this.safeType(this.selectors.emailInput, '', { clear: true });
    await this.safeType(this.selectors.passwordInput, '', { clear: true });
    Logger.debug('Login form cleared', 'LoginPage');
  }
} 
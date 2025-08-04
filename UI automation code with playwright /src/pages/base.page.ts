/**
 * @fileoverview Base page class with common functionality for all page objects
 * @author Senior QA Automation Engineer
 * @version 1.0.0
 */

import { Page, Locator, expect } from '@playwright/test';
import { Logger } from '../utils/logger.util';
import { BrowserUtils } from '../utils/browser.util';
import { TIMEOUTS, SELECTORS } from '../constants/app.constants';
import { UserCredentials } from '../types/test-data.types';

export abstract class BasePage {
  protected page: Page;
  protected url: string;

  constructor(page: Page, url: string) {
    this.page = page;
    this.url = url;
    BrowserUtils.setupPageErrorHandlers(page);
  }

  /**
   * Navigate to the page
   */
  async navigate(): Promise<void> {
    const startTime = Date.now();
    const success = await BrowserUtils.navigateToUrl(this.page, this.url);
    const duration = Date.now() - startTime;
    
    if (!success) {
      throw new Error(`Failed to navigate to ${this.url}`);
    }
    
    Logger.performance(`Navigation to ${this.constructor.name}`, duration);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    await BrowserUtils.waitForPageStabilization(this.page);
  }

  /**
   * Check if page is ready for interaction
   */
  async isPageReady(): Promise<boolean> {
    return await BrowserUtils.checkBrowserResponsiveness(this.page, this.constructor.name);
  }

  /**
   * Safe element interaction with retry logic
   */
  protected async safeClick(selector: string, options?: { timeout?: number; force?: boolean }): Promise<void> {
    Logger.debug(`Attempting to click: ${selector}`, this.constructor.name);
    const success = await BrowserUtils.safeClick(this.page, selector, options);
    
    if (!success) {
      throw new Error(`Failed to click element: ${selector}`);
    }
  }

  /**
   * Safe text input with validation
   */
  protected async safeType(selector: string, text: string, options?: { clear?: boolean; timeout?: number }): Promise<void> {
    const { clear = true, timeout = TIMEOUTS.MEDIUM } = options || {};
    
    try {
      const element = this.page.locator(selector);
      await element.waitFor({ timeout, state: 'visible' });
      
      if (clear) {
        await element.clear();
      }
      
      await element.fill(text);
      Logger.debug(`Typed "${text}" into ${selector}`, this.constructor.name);
    } catch (error) {
      Logger.error(`Failed to type into ${selector}: ${error.message}`, this.constructor.name);
      throw error;
    }
  }

  /**
   * Wait for element to be visible
   */
  protected async waitForElement(selector: string, timeout: number = TIMEOUTS.MEDIUM): Promise<Locator> {
    const element = this.page.locator(selector);
    await element.waitFor({ timeout, state: 'visible' });
    return element;
  }

  /**
   * Select dropdown option by text
   */
  protected async selectDropdownOption(
    dropdownSelector: string, 
    optionText: string,
    openButtonSelector: string = SELECTORS.DROPDOWN.OPEN_BUTTON
  ): Promise<boolean> {
    try {
      // Open dropdown
      const openButton = this.page.locator(dropdownSelector).locator(openButtonSelector);
      await openButton.click();
      await this.page.waitForTimeout(1000);

      // Select option
      const option = this.page.locator(SELECTORS.DROPDOWN.OPTION, { hasText: optionText });
      await option.click();
      
      Logger.debug(`Selected dropdown option: ${optionText}`, this.constructor.name);
      return true;
    } catch (error) {
      Logger.error(`Failed to select dropdown option ${optionText}: ${error.message}`, this.constructor.name);
      return false;
    }
  }

  /**
   * Select dropdown option with multiple strategies
   */
  protected async selectDropdownOptionAdvanced(
    dropdownSelectors: string[],
    optionTexts: string[],
    context: string
  ): Promise<boolean> {
    Logger.info(`Attempting to select dropdown option for ${context}`, this.constructor.name);
    
    // Try to open dropdown with different selectors
    let dropdownOpened = false;
    for (const selector of dropdownSelectors) {
      try {
        const element = this.page.locator(selector);
        const count = await element.count();
        
        if (count === 1) {
          await element.click();
          await this.page.waitForTimeout(1500);
          
          const optionCount = await this.page.locator(SELECTORS.DROPDOWN.OPTION).count();
          if (optionCount > 0) {
            dropdownOpened = true;
            break;
          }
        }
      } catch (error) {
        continue;
      }
    }

    if (!dropdownOpened) {
      Logger.error(`Could not open dropdown for ${context}`, this.constructor.name);
      return false;
    }

    // Try to select option
    for (const optionText of optionTexts) {
      try {
        const option = this.page.locator(SELECTORS.DROPDOWN.OPTION, { hasText: optionText });
        if (await option.count() > 0) {
          await option.click();
          Logger.success(`Selected ${context}: ${optionText}`, this.constructor.name);
          return true;
        }
      } catch (error) {
        continue;
      }
    }

    Logger.error(`Could not select any option for ${context}`, this.constructor.name);
    return false;
  }

  /**
   * Check if checkbox is checked and toggle if needed
   */
  protected async ensureCheckboxState(selector: string, shouldBeChecked: boolean): Promise<void> {
    const checkbox = this.page.locator(selector);
    const isChecked = await checkbox.isChecked();
    
    if (isChecked !== shouldBeChecked) {
      await checkbox.click();
      Logger.debug(`Toggled checkbox ${selector} to ${shouldBeChecked}`, this.constructor.name);
    }
  }

  /**
   * Wait for and verify page title
   */
  protected async verifyPageTitle(expectedTitle: string): Promise<void> {
    await expect(this.page).toHaveTitle(expectedTitle, { timeout: TIMEOUTS.MEDIUM });
    Logger.assertion(`Page title is "${expectedTitle}"`, true);
  }

  /**
   * Wait for and verify URL contains expected path
   */
  protected async verifyUrlContains(expectedPath: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(expectedPath), { timeout: TIMEOUTS.MEDIUM });
    Logger.assertion(`URL contains "${expectedPath}"`, true);
  }

  /**
   * Take screenshot for debugging
   */
  async captureScreenshot(filename: string): Promise<string | null> {
    return await BrowserUtils.captureScreenshot(this.page, `${this.constructor.name}_${filename}`);
  }

  /**
   * Get all available options from a dropdown
   */
  protected async getDropdownOptions(): Promise<string[]> {
    try {
      const options = await this.page.locator(SELECTORS.DROPDOWN.OPTION).allTextContents();
      Logger.debug(`Found dropdown options: ${options.join(', ')}`, this.constructor.name);
      return options;
    } catch (error) {
      Logger.warn(`Could not get dropdown options: ${error.message}`, this.constructor.name);
      return [];
    }
  }

  /**
   * Wait for loading spinner to disappear
   */
  protected async waitForLoadingComplete(): Promise<void> {
    try {
      // Common loading indicators
      const loadingSelectors = [
        '.loading',
        '.spinner',
        '[data-testid="loading"]',
        '.MuiCircularProgress-root'
      ];

      for (const selector of loadingSelectors) {
        await this.page.locator(selector).waitFor({ 
          state: 'hidden', 
          timeout: TIMEOUTS.SHORT 
        }).catch(() => {}); // Ignore if not found
      }
    } catch (error) {
      // Loading indicators might not be present, which is fine
    }
  }
} 
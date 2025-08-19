/**
 * @fileoverview Browser utility functions for enhanced test stability
 * @author Senior QA Automation Engineer
 * @version 1.0.0
 */

import { Page } from '@playwright/test';
import { Logger } from './logger.util';
import { TIMEOUTS } from '../constants/app.constants';

export class BrowserUtils {
  
  /**
   * Check if browser page is responsive and accessible
   */
  static async checkBrowserResponsiveness(
    page: Page, 
    context: string
  ): Promise<boolean> {
    Logger.debug(`Checking browser responsiveness for ${context}`, 'BROWSER_UTILS');
    
    try {
      // Check if page is closed
      if (page.isClosed()) {
        Logger.error(`Browser page is closed during ${context}`, 'BROWSER_UTILS');
        return false;
      }
      
      // Check if body element is visible
      await page.locator('body').isVisible({ timeout: TIMEOUTS.MEDIUM });
      
      // Check if we can interact with the page
      await page.evaluate(() => document.readyState);
      
      Logger.debug(`Browser is responsive for ${context}`, 'BROWSER_UTILS');
      return true;
    } catch (error) {
      Logger.error(`Browser responsiveness check failed for ${context}: ${error.message}`, 'BROWSER_UTILS');
      return false;
    }
  }

  /**
   * Safe page navigation with error handling
   */
  static async navigateToUrl(
    page: Page, 
    url: string, 
    waitForLoadState: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'
  ): Promise<boolean> {
    try {
      Logger.info(`Navigating to: ${url}`, 'BROWSER_UTILS');
      await page.goto(url);
      await page.waitForLoadState(waitForLoadState, { timeout: TIMEOUTS.NAVIGATION });
      Logger.success(`Successfully navigated to: ${url}`, 'BROWSER_UTILS');
      return true;
    } catch (error) {
      Logger.error(`Navigation failed for ${url}: ${error.message}`, 'BROWSER_UTILS');
      return false;
    }
  }

  /**
   * Wait for page to stabilize after actions
   */
  static async waitForPageStabilization(
    page: Page, 
    timeout: number = TIMEOUTS.SHORT
  ): Promise<void> {
    try {
      await page.waitForLoadState('domcontentloaded', { timeout });
      await page.waitForTimeout(1000); // Additional buffer
    } catch (error) {
      Logger.warn(`Page stabilization timeout: ${error.message}`, 'BROWSER_UTILS');
    }
  }

  /**
   * Safe screenshot capture with error handling
   */
  static async captureScreenshot(
    page: Page, 
    filename: string, 
    fullPage: boolean = true
  ): Promise<string | null> {
    try {
      if (page.isClosed()) {
        Logger.warn('Cannot capture screenshot - page is closed', 'BROWSER_UTILS');
        return null;
      }
      
      const screenshotPath = `reports/screenshots/${filename}_${Date.now()}.png`;
      await page.screenshot({ path: screenshotPath, fullPage });
      Logger.info(`Screenshot saved: ${screenshotPath}`, 'BROWSER_UTILS');
      return screenshotPath;
    } catch (error) {
      Logger.error(`Screenshot capture failed: ${error.message}`, 'BROWSER_UTILS');
      return null;
    }
  }

  /**
   * Set up page error handlers
   */
  static setupPageErrorHandlers(page: Page): void {
    page.on('close', () => {
      Logger.warn('Browser page was closed unexpectedly', 'BROWSER_UTILS');
    });

    page.on('crash', () => {
      Logger.error('Browser page crashed', 'BROWSER_UTILS');
    });

    page.on('pageerror', (error) => {
      Logger.error(`Page error occurred: ${error.message}`, 'BROWSER_UTILS');
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        Logger.error(`Console error: ${msg.text()}`, 'BROWSER_UTILS');
      }
    });
  }

  /**
   * Wait for element with retry mechanism
   */
  static async waitForElementWithRetry(
    page: Page,
    selector: string,
    options: { timeout?: number; retries?: number } = {}
  ): Promise<boolean> {
    const { timeout = TIMEOUTS.MEDIUM, retries = 3 } = options;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await page.waitForSelector(selector, { timeout });
        Logger.debug(`Element found on attempt ${attempt}: ${selector}`, 'BROWSER_UTILS');
        return true;
      } catch (error) {
        Logger.warn(`Element not found on attempt ${attempt}/${retries}: ${selector}`, 'BROWSER_UTILS');
        if (attempt === retries) {
          Logger.error(`Element not found after ${retries} attempts: ${selector}`, 'BROWSER_UTILS');
          return false;
        }
        await page.waitForTimeout(1000); // Wait before retry
      }
    }
    
    return false;
  }

  /**
   * Safe click with multiple fallback strategies
   */
  static async safeClick(
    page: Page,
    selector: string,
    options: { timeout?: number; force?: boolean } = {}
  ): Promise<boolean> {
    const { timeout = TIMEOUTS.MEDIUM, force = false } = options;
    
    try {
      const element = page.locator(selector);
      
      // Strategy 1: Normal click
      try {
        await element.click({ timeout });
        Logger.debug(`Successfully clicked element: ${selector}`, 'BROWSER_UTILS');
        return true;
      } catch (error) {
        Logger.warn(`Normal click failed for ${selector}: ${error.message}`, 'BROWSER_UTILS');
      }
      
      // Strategy 2: Force click
      if (force) {
        try {
          await element.click({ force: true, timeout });
          Logger.debug(`Force click successful for: ${selector}`, 'BROWSER_UTILS');
          return true;
        } catch (error) {
          Logger.warn(`Force click failed for ${selector}: ${error.message}`, 'BROWSER_UTILS');
        }
      }
      
      // Strategy 3: JavaScript click
      try {
        await element.evaluate((el: HTMLElement) => el.click());
        Logger.debug(`JavaScript click successful for: ${selector}`, 'BROWSER_UTILS');
        return true;
      } catch (error) {
        Logger.error(`All click strategies failed for ${selector}: ${error.message}`, 'BROWSER_UTILS');
        return false;
      }
      
    } catch (error) {
      Logger.error(`Safe click failed for ${selector}: ${error.message}`, 'BROWSER_UTILS');
      return false;
    }
  }

  /**
   * Get page performance metrics
   */
  static async getPerformanceMetrics(page: Page): Promise<any> {
    try {
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          responseTime: navigation.responseEnd - navigation.requestStart
        };
      });
      
      Logger.performance('Page load', metrics.loadTime);
      return metrics;
    } catch (error) {
      Logger.warn(`Could not get performance metrics: ${error.message}`, 'BROWSER_UTILS');
      return null;
    }
  }
} 
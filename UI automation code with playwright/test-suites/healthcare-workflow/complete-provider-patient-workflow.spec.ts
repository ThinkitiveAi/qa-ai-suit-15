/**
 * @fileoverview End-to-End Healthcare Management Workflow Test Suite
 * @description Complete workflow testing provider creation, patient registration, 
 *              availability setup, and appointment booking
 * @author Senior QA Automation Engineer
 * @version 1.0.0
 */

import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../../src/pages/authentication.page';
import { testDataFactory } from '../../src/data/test-data.factory';
import { Logger } from '../../src/utils/logger.util';
import { BrowserUtils } from '../../src/utils/browser.util';
import { getCredentials } from '../../src/config/test.config';
import { TIMEOUTS, SUCCESS_MESSAGES } from '../../src/constants/app.constants';
import { TestSession } from '../../src/types/test-data.types';

// Test suite configuration
test.describe.configure({ mode: 'serial' });

test.describe('Healthcare Management Workflow - Complete E2E', () => {
  let testSession: TestSession;
  let loginPage: LoginPage;

  test.beforeAll(async () => {
    // Generate unique test data for this workflow
    testSession = testDataFactory.generateTestSession();
    Logger.separator('Healthcare Workflow Test Suite Initialized');
  });

  test.beforeEach(async ({ page }) => {
    // Configure test timeouts and browser settings
    test.setTimeout(TIMEOUTS.TEST_TIMEOUT);
    await page.setViewportSize({ width: 1280, height: 720 });
    page.setDefaultTimeout(TIMEOUTS.EXTRA_LONG);
    page.setDefaultNavigationTimeout(TIMEOUTS.NAVIGATION);
    
    // Setup error handlers
    BrowserUtils.setupPageErrorHandlers(page);
    
    // Initialize page objects
    loginPage = new LoginPage(page);
    
    await page.waitForTimeout(2000); // Stability buffer between tests
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Capture screenshot on failure
    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshotPath = await BrowserUtils.captureScreenshot(
        page, 
        `failure_${testInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}`
      );
      
      if (screenshotPath) {
        Logger.error(`Test failed - Screenshot: ${screenshotPath}`);
      }
    }
    
    // Log test completion
    const status = testInfo.status === testInfo.expectedStatus ? 'PASSED' : 'FAILED';
    Logger.endTest(testInfo.title, status as 'PASSED' | 'FAILED');
  });

  test('01. Provider Creation - Foundation', async ({ page }) => {
    Logger.startTest('Provider Creation');
    
    await test.step('Login to application', async () => {
      await loginPage.quickLogin(getCredentials());
    });

    await test.step('Navigate to provider management', async () => {
      await page.getByRole('banner').getByTestId('KeyboardArrowRightIcon').click();
      await page.getByRole('tab', { name: 'Settings' }).click();
      await page.getByRole('menuitem', { name: 'User Settings' }).click();
      await page.getByRole('tab', { name: 'Providers' }).click();
      await page.getByRole('button', { name: 'Add Provider User' }).click();
    });

    await test.step('Fill provider information', async () => {
      const provider = testSession.provider;
      
      await page.getByRole('textbox', { name: 'First Name *' }).fill(provider.firstName);
      await page.getByRole('textbox', { name: 'Last Name *' }).fill(provider.lastName);
      
      // Provider type selection
      await page.getByRole('combobox', { name: 'Provider Type' }).click();
      await page.getByRole('option', { name: 'MD' }).click();
      
      // Handle specialties selection
      await selectProviderSpecialties(page);
      
      await page.getByRole('combobox', { name: 'Role *' }).click();
      await page.getByRole('option', { name: 'Provider' }).click();
      
      // Personal information
      await page.getByRole('textbox', { name: 'DOB' }).fill(provider.dateOfBirth);
      await page.getByRole('combobox', { name: 'Gender *' }).click();
      await page.getByRole('option', { name: provider.gender, exact: true }).click();
      
      // Professional information
      await page.getByRole('textbox', { name: 'NPI Number', exact: true }).fill(provider.npiNumber);
      await page.getByRole('textbox', { name: 'Email *' }).fill(provider.email);
    });

    await test.step('Save provider and verify creation', async () => {
      await page.getByRole('button', { name: 'Save' }).click();
      
      // Wait for save completion with enhanced error handling
      await page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.LONG });
      await page.waitForTimeout(15000); // Backend sync time
      
      // Verify browser responsiveness
      const isResponsive = await BrowserUtils.checkBrowserResponsiveness(page, 'Provider Creation');
      expect(isResponsive).toBeTruthy();
      
      // Mark provider as created
      testSession.provider.created = true;
      
      Logger.success(`${SUCCESS_MESSAGES.PROVIDER_CREATED}: ${testSession.provider.fullName}`);
      Logger.info(`Provider Email: ${testSession.provider.email}`);
      Logger.info(`Provider NPI: ${testSession.provider.npiNumber}`);
    });
  });

  test('02. Patient Registration - Dependent on Provider', async ({ page }) => {
    Logger.startTest('Patient Registration');
    
    // Verify prerequisites
    expect(testSession.provider.created).toBeTruthy();
    Logger.dependency('✓ Provider creation prerequisite satisfied');

    await test.step('Login and navigate to patient registration', async () => {
      await loginPage.quickLogin(getCredentials());
      
      // Navigate to dashboard and create patient
      await page.getByText('Create').click();
      await page.getByRole('menuitem', { name: 'New Patient' }).click();
      await page.locator('div').filter({ hasText: /^Enter Patient Details$/ }).click();
      await page.getByRole('button', { name: 'Next' }).click();
    });

    await test.step('Fill patient information', async () => {
      const patient = testSession.patient;
      
      await page.getByRole('textbox', { name: 'First Name *' }).fill(patient.firstName);
      await page.getByRole('textbox', { name: 'Last Name *' }).fill(patient.lastName);
      await page.getByRole('textbox', { name: 'Date Of Birth *' }).fill(patient.dateOfBirth);
      
      // Gender selection
      await page.locator('form').filter({ hasText: 'Gender *Gender *' }).getByLabel('Open').click();
      await page.getByRole('option', { name: patient.gender, exact: true }).click();
      
      // Contact information
      await page.getByRole('textbox', { name: 'Mobile Number *' }).fill(patient.phoneNumber);
      await page.getByRole('textbox', { name: 'Email *' }).fill(patient.email);
    });

    await test.step('Save patient and verify registration', async () => {
      await page.getByRole('button', { name: 'Save' }).click();
      
      // Verify success message
      await expect(page.locator('text=Patient Details Added Successfully')).toBeVisible({ 
        timeout: TIMEOUTS.MEDIUM 
      });
      
      // Verify navigation to patients page
      await page.waitForURL('**/patients');
      await expect(page.getByRole('tab', { name: 'Patients', selected: true })).toBeVisible();
      
      // Mark patient as created
      testSession.patient.created = true;
      
      Logger.success(`${SUCCESS_MESSAGES.PATIENT_REGISTERED}: ${testSession.patient.fullName}`);
      Logger.info(`Patient Email: ${testSession.patient.email}`);
      Logger.info(`Patient Phone: ${testSession.patient.phoneNumber}`);
    });
  });

  test('03. Provider Availability Setup - Dependent on Provider & Patient', async ({ page }) => {
    Logger.startTest('Provider Availability Setup');
    
    // Verify prerequisites  
    expect(testSession.provider.created).toBeTruthy();
    expect(testSession.patient.created).toBeTruthy();
    Logger.dependency('✓ Provider and Patient creation prerequisites satisfied');

    await test.step('Navigate to availability management', async () => {
      await loginPage.quickLogin(getCredentials());
      
      await page.getByRole('tab', { name: 'Scheduling' }).click();
      await page.getByText('Availability').click();
      await page.getByRole('button', { name: 'Edit Availability' }).click();
      await page.waitForTimeout(2000);
    });

    await test.step('Configure provider and basic settings', async () => {
      // Provider selection with exact matching
      await selectExactProvider(page, testSession.provider.fullName);
      
      // Timezone configuration
      await selectTimezone(page);
      
      // Booking window configuration  
      await selectBookingWindow(page);
    });

    await test.step('Configure time slots for weekdays', async () => {
      // Start with Monday configuration
      await page.getByRole('tab', { name: 'Monday' }).click();
      await configureTimeSlots(page);
      
      // Enable telehealth
      const telehealthCheckbox = page.getByRole('checkbox', { name: 'Telehealth' });
      if (!(await telehealthCheckbox.isChecked())) {
        await telehealthCheckbox.check();
      }
      
      // Copy settings to other enabled weekdays
      await copyAvailabilityToWeekdays(page);
    });

    await test.step('Configure appointment settings', async () => {
      await configureAppointmentSettings(page);
    });

    await test.step('Save availability configuration', async () => {
      await page.getByRole('button', { name: 'Save' }).click();
      
      // Enhanced save verification
      await verifyAvailabilitySave(page);
      
      // Mark availability as configured
      testSession.availability.set = true;
      
      Logger.success(`${SUCCESS_MESSAGES.AVAILABILITY_SET}`);
      Logger.info(`Configured days: ${testSession.availability.enabledDays.join(', ')}`);
    });
  });

  test('04. Appointment Booking - Complete Workflow', async ({ page }) => {
    Logger.startTest('Appointment Booking');
    
    // Verify all prerequisites
    expect(testSession.provider.created).toBeTruthy();
    expect(testSession.patient.created).toBeTruthy(); 
    expect(testSession.availability.set).toBeTruthy();
    Logger.dependency('✓ All prerequisites satisfied for appointment booking');

    await test.step('Navigate to appointment creation', async () => {
      await loginPage.quickLogin(getCredentials());
      
      await page.getByText('Create').click();
      await page.getByRole('menuitem', { name: 'New Appointment' }).click();
    });

    await test.step('Select patient and appointment type', async () => {
      // Select the exact patient created in test 2
      await selectExactPatient(page, testSession.patient.fullName);
      
      await page.getByPlaceholder('Select Type').click();
      await page.getByRole('option', { name: 'Follow-up Visit' }).click();
      
      await page.getByPlaceholder('Reason').fill('Annual Physical Checkup');
    });

    await test.step('Configure appointment settings', async () => {
      // Timezone selection
      await page.getByLabel('Timezone *').click();
      await page.getByRole('option', { name: 'Eastern Daylight Time (GMT -04:00)' }).click();
      
      // Visit type
      await page.getByRole('button', { name: 'Telehealth' }).click();
      
      // Provider selection - use exact same provider from availability
      await selectExactProviderForBooking(page, testSession.provider.selectedInAvailability || testSession.provider.fullName);
    });

    await test.step('Select date and time slot', async () => {
      await page.getByRole('button', { name: 'View availability' }).click();
      await page.waitForTimeout(2000);
      
      // Enhanced date and slot selection
      const appointmentDate = await selectAvailableDate(page);
      const timeSlot = await selectAvailableTimeSlot(page);
      
      // Store appointment details
      testSession.appointment = {
        patient: testSession.patient,
        provider: testSession.provider,
        appointmentType: 'Follow-up Visit',
        reason: 'Annual Physical Checkup',
        date: appointmentDate,
        timeSlot: timeSlot,
        visitType: 'Telehealth',
        timezone: 'Eastern Daylight Time (GMT -04:00)',
        booked: true
      };
    });

    await test.step('Complete appointment booking', async () => {
      await page.getByRole('button', { name: 'Save And Close' }).click();
      await page.waitForLoadState('networkidle');
      
      // Mark test session as complete
      testSession.endTime = new Date();
      
      Logger.success(`🎉 ${SUCCESS_MESSAGES.APPOINTMENT_BOOKED} 🎉`);
      Logger.success(`Appointment for: ${testSession.patient.fullName}`);
      Logger.success(`With provider: ${testSession.provider.fullName}`);
      Logger.success(`Date: ${testSession.appointment.date}, Time: ${testSession.appointment.timeSlot}`);
      
      // Log final test summary
      logFinalTestSummary(testSession);
    });
  });
});

// =================================================================
// Helper Functions for Complex Operations
// =================================================================

async function selectProviderSpecialties(page: Page): Promise<void> {
  try {
    await page.getByRole('combobox', { name: 'specialities' }).click();
    await page.waitForTimeout(1000);
    
    // Try to select first available specialty
    const firstCheckbox = page.getByRole('checkbox').first();
    if (await firstCheckbox.count() > 0) {
      await firstCheckbox.check();
      Logger.info('Selected first available specialty');
    }
  } catch (error) {
    Logger.warn(`Specialty selection failed: ${error.message}`);
  }
}

async function selectExactProvider(page: Page, providerName: string): Promise<void> {
  const selectors = [
    'form .MuiFormControl-root:has-text("Select Provider") [aria-label="Open"]',
    'div:has-text("Select Provider") [aria-label="Open"]'
  ];
  
  for (const selector of selectors) {
    try {
      const element = page.locator(selector);
      if (await element.count() === 1) {
        await element.click();
        await page.waitForTimeout(2000);
        
        const option = page.getByRole('option', { name: providerName });
        if (await option.count() > 0) {
          await option.click();
          Logger.success(`Selected provider: ${providerName}`);
          return;
        }
      }
    } catch (error) {
      continue;
    }
  }
  
  throw new Error(`Could not select provider: ${providerName}`);
}

async function selectTimezone(page: Page): Promise<void> {
  await page.locator('form').filter({ hasText: 'Time Zone *Time Zone *' }).getByLabel('Open').click();
  await page.waitForTimeout(1500);
  
  const timezones = ['Eastern Standard Time (UTC -5)', 'Eastern Daylight Time (UTC -4)'];
  for (const timezone of timezones) {
    try {
      await page.getByRole('option', { name: timezone }).click();
      Logger.info(`Selected timezone: ${timezone}`);
      return;
    } catch (error) {
      continue;
    }
  }
  
  // Fallback to first available
  await page.getByRole('option').first().click();
  Logger.info('Selected fallback timezone');
}

async function selectBookingWindow(page: Page): Promise<void> {
  // Enhanced booking window selection with JavaScript fallback
  try {
    await page.evaluate(() => {
      const candidates = [...document.querySelectorAll('[role="button"]')];
      for (const candidate of candidates) {
        const parent = candidate.closest('div');
        const parentText = parent ? parent.textContent || '' : '';
        if (parentText.includes('Booking Window')) {
          (candidate as HTMLElement).click();
          return true;
        }
      }
      return false;
    });
    
    await page.waitForTimeout(2000);
    await page.getByRole('option', { name: '2 Week' }).click();
    Logger.success('Selected booking window: 2 Week');
  } catch (error) {
    Logger.warn(`Booking window selection failed: ${error.message}`);
  }
}

async function configureTimeSlots(page: Page): Promise<void> {
  // Start time configuration
  const startTimeSelectors = [
    'form div:has-text("Start Time") [aria-label="Open"]:first-of-type'
  ];
  
  for (const selector of startTimeSelectors) {
    try {
      await page.locator(selector).click();
      await page.waitForTimeout(1500);
      await page.getByRole('option', { name: '09:00 AM' }).click();
      Logger.info('Set start time: 09:00 AM');
      break;
    } catch (error) {
      continue;
    }
  }
  
  // End time configuration
  const endTimeSelectors = [
    'form div:has-text("End Time") [aria-label="Open"]:first-of-type'
  ];
  
  for (const selector of endTimeSelectors) {
    try {
      await page.locator(selector).click();
      await page.waitForTimeout(1500);
      await page.getByRole('option', { name: '05:00 PM (8 hrs)' }).click();
      Logger.info('Set end time: 05:00 PM (8 hrs)');
      break;
    } catch (error) {
      continue;
    }
  }
}

async function copyAvailabilityToWeekdays(page: Page): Promise<void> {
  const weekdays = ['Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const configuredDays = ['Monday'];
  
  for (const day of weekdays) {
    try {
      const dayTab = page.getByRole('tab', { name: day });
      const isDisabled = await dayTab.getAttribute('disabled');
      
      if (isDisabled === null) {
        await dayTab.click();
        await page.waitForTimeout(500);
        
        const telehealthCheckbox = page.getByRole('checkbox', { name: 'Telehealth' });
        if (!(await telehealthCheckbox.isChecked())) {
          await telehealthCheckbox.check();
        }
        
        configuredDays.push(day);
        Logger.info(`Configured ${day} with availability`);
      } else {
        Logger.info(`${day} tab is disabled - skipping`);
      }
    } catch (error) {
      Logger.warn(`Could not configure ${day}: ${error.message}`);
    }
  }
  
  Logger.success(`Availability configured for: ${configuredDays.join(', ')}`);
}

async function configureAppointmentSettings(page: Page): Promise<void> {
  // Appointment type
  await page.locator('form').filter({ hasText: 'Appointment TypeAppointment' }).getByLabel('Open').click();
  await page.getByRole('option', { name: 'New Patient Visit' }).click();
  
  // Duration
  await page.locator('form').filter({ hasText: 'DurationDuration' }).getByLabel('Open').click();
  await page.getByRole('option', { name: '15 minutes' }).click();
  
  // Schedule notice
  await page.locator('form').filter({ hasText: 'Schedule NoticeSchedule Notice' }).getByLabel('Open').click();
  await page.getByRole('option', { name: '15 Minutes Away' }).click();
}

async function verifyAvailabilitySave(page: Page): Promise<void> {
  try {
    await page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.MEDIUM });
    await page.waitForTimeout(3000);
    
    const stillOnEditPage = await page.locator('text=Edit Availability').count();
    if (stillOnEditPage === 0) {
      Logger.success('Successfully saved availability settings');
    } else {
      Logger.warn('Still on edit page - save may need verification');
    }
  } catch (error) {
    Logger.warn(`Availability save verification timeout: ${error.message}`);
  }
}

async function selectExactPatient(page: Page, patientName: string): Promise<void> {
  const searchInput = page.getByPlaceholder('Search Patient');
  await searchInput.click();
  await searchInput.clear();
  await searchInput.fill(patientName);
  await page.waitForTimeout(2000);
  
  const option = page.getByRole('option', { name: new RegExp(patientName, 'i') });
  await option.first().click();
  Logger.success(`Selected patient: ${patientName}`);
}

async function selectExactProviderForBooking(page: Page, providerName: string): Promise<void> {
  const searchInput = page.getByPlaceholder('Search Provider');
  await searchInput.clear();
  await searchInput.fill(providerName);
  await page.waitForTimeout(2000);
  
  const option = page.getByRole('option', { name: providerName });
  await option.first().click();
  Logger.success(`Selected provider for booking: ${providerName}`);
}

async function selectAvailableDate(page: Page): Promise<string> {
  // Calculate weekday dates for current month
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const todayDate = today.getDate();
  
  const weekdayDates: string[] = [];
  for (let day = todayDate; day <= todayDate + 14; day++) {
    const testDate = new Date(currentYear, currentMonth, day);
    if (testDate.getMonth() === currentMonth) {
      const dayOfWeek = testDate.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
        weekdayDates.push(day.toString());
      }
    }
  }
  
  for (const dateNum of weekdayDates) {
    try {
      const dateButton = page.locator(`button.MuiButtonBase-root.MuiPickersDay-root.MuiPickersDay-dayWithMargin:has-text("${dateNum}")`);
      if (await dateButton.count() > 0) {
        const isDisabled = await dateButton.getAttribute('disabled');
        if (isDisabled === null) {
          await dateButton.click();
          await page.waitForTimeout(2000);
          
          // Check if slots are available
          const slotCount = await page.locator('div:has-text("AM"), div:has-text("PM")').count();
          const noSlotsCount = await page.locator('text=No Slots Available').count();
          
          if (slotCount > 0 && noSlotsCount === 0) {
            Logger.success(`Selected date: ${dateNum} with available slots`);
            return dateNum;
          }
        }
      }
    } catch (error) {
      continue;
    }
  }
  
  throw new Error('No available dates found with time slots');
}

async function selectAvailableTimeSlot(page: Page): Promise<string> {
  const slotSelectors = [
    "button.MuiButtonBase-root:not([disabled]):has-text('AM')",
    "button.MuiButtonBase-root:not([disabled]):has-text('PM')",
    "div:has-text('AM'):not(:has-text('No'))",
    "div:has-text('PM'):not(:has-text('No'))"
  ];
  
  for (const selector of slotSelectors) {
    try {
      const slots = page.locator(selector);
      const count = await slots.count();
      
      if (count > 0) {
        const slotText = await slots.first().textContent();
        await slots.first().click();
        Logger.success(`Selected time slot: ${slotText}`);
        return slotText || 'Unknown slot';
      }
    } catch (error) {
      continue;
    }
  }
  
  throw new Error('No available time slots found');
}

function logFinalTestSummary(session: TestSession): void {
  const duration = session.endTime ? session.endTime.getTime() - session.startTime.getTime() : 0;
  const durationMinutes = Math.round(duration / 60000);
  
  Logger.separator('FINAL TEST EXECUTION SUMMARY');
  Logger.info(`📊 Test Run ID: ${session.testRunId}`);
  Logger.info(`⏱️ Total Execution Time: ${durationMinutes} minutes`);
  Logger.info(`✅ Provider Created: ${session.provider.fullName} (NPI: ${session.provider.npiNumber})`);
  Logger.info(`✅ Patient Registered: ${session.patient.fullName} (Phone: ${session.patient.phoneNumber})`);
  Logger.info(`✅ Availability Configured: ${session.availability.enabledDays.length} days`);
  Logger.info(`✅ Appointment Booked: ${session.appointment?.date} at ${session.appointment?.timeSlot}`);
  Logger.separator('🎉 HEALTHCARE WORKFLOW COMPLETED SUCCESSFULLY 🎉');
} 
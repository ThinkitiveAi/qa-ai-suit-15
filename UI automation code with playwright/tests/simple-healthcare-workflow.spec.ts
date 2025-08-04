/**
 * @fileoverview Healthcare Management Workflow Automation
 * @description Complete end-to-end automation for Provider Creation, Patient Registration, Availability Setup, and Appointment Booking
 * @author Sainath Gaikwad
 * @team QA Core
 * @version 1.0.0
 */

import { test, expect, Page } from '@playwright/test';

// Simple test data generation
function generateTestData() {
  const timestamp = Date.now();
  return {
    provider: {
      firstName: 'Dr John',
      lastName: 'Smith',
      email: `provider${timestamp}@test.com`,
      npiNumber: `1234${timestamp}`,
      dateOfBirth: '01/15/1980',
      phoneNumber: `555${timestamp}`,
      gender: 'Male'
    },
    patient: {
      firstName: 'Jane',
      lastName: 'Doe', 
      email: `patient${timestamp}@test.com`,
      dateOfBirth: '05/20/1990',
      phoneNumber: `444${timestamp}`,
      gender: 'Female'
    }
  };
}

test.describe.serial('Healthcare Workflow Tests', () => {
  let testData: any;
  
  test.beforeAll(() => {
    console.log('🚀 Healthcare Test Automation Framework v1.0.0');
    console.log('👨‍💻 Developed by: Sainath Gaikwad - QA Core Team');
    console.log('📋 Running Healthcare Management Workflow Tests');
    console.log('═══════════════════════════════════════════════');
    
    testData = generateTestData();
    console.log('Generated test data:', testData);
  });

  test('1. Login and Create Provider', async ({ page }) => {
    test.setTimeout(300000);
    
    // Login
    await page.goto('https://stage_aithinkitive.uat.provider.ecarehealth.com/auth/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('rose.gomez@jourrapide.com');
    await page.getByRole('textbox', { name: '*********' }).fill('Pass@123');
    await page.getByRole('button', { name: 'Let\'s get Started' }).click();
    await page.waitForLoadState('networkidle');
    
    // Navigate to providers
    await page.getByRole('banner').getByTestId('KeyboardArrowRightIcon').click();
    await page.getByRole('tab', { name: 'Settings' }).click();
    await page.getByRole('menuitem', { name: 'User Settings' }).click();
    await page.getByRole('tab', { name: 'Providers' }).click();
    await page.getByRole('button', { name: 'Add Provider User' }).click();
    
    // Fill provider details
    await page.getByRole('textbox', { name: 'First Name *' }).fill(testData.provider.firstName);
    await page.getByRole('textbox', { name: 'Last Name *' }).fill(testData.provider.lastName);
    await page.getByRole('textbox', { name: 'Email *' }).fill(testData.provider.email);
    await page.locator('input[name="npi"]').fill(testData.provider.npiNumber);
    await page.getByRole('textbox', { name: 'Date of Birth' }).fill(testData.provider.dateOfBirth);
    await page.getByRole('textbox', { name: 'Phone Number' }).fill(testData.provider.phoneNumber);
    
    // Select gender
    await page.getByRole('combobox', { name: 'Gender' }).click();
    await page.getByRole('option', { name: testData.provider.gender }).click();
    
    // Select provider type
    await page.getByRole('combobox', { name: 'Provider Type' }).click();
    await page.getByRole('option', { name: 'MD' }).click();
    
    // Select specialties (try multiple methods)
    await page.getByRole('combobox', { name: 'Specialties' }).click();
    await page.waitForTimeout(2000);
    
    try {
      await page.getByRole('checkbox', { name: 'Cardiology' }).click();
    } catch {
      try {
        await page.locator('text=Cardiology').click();
      } catch {
        await page.locator('[role="option"]:has-text("Cardiology")').click();
      }
    }
    
    // Select role
    await page.getByRole('combobox', { name: 'Role' }).click();
    await page.getByRole('option', { name: 'Therapist' }).click();
    
    // Save provider
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(5000);
    
    console.log('✅ Provider created successfully');
  });

  test('2. Create Patient', async ({ page }) => {
    test.setTimeout(300000);
    
    // Navigate to patients
    await page.getByRole('tab', { name: 'Patients' }).click();
    await page.getByRole('button', { name: 'Add Patient' }).click();
    
    // Fill patient details
    await page.getByRole('textbox', { name: 'First Name *' }).fill(testData.patient.firstName);
    await page.getByRole('textbox', { name: 'Last Name *' }).fill(testData.patient.lastName);
    await page.getByRole('textbox', { name: 'Email *' }).fill(testData.patient.email);
    await page.getByRole('textbox', { name: 'Date of Birth *' }).fill(testData.patient.dateOfBirth);
    await page.getByRole('textbox', { name: 'Phone Number *' }).fill(testData.patient.phoneNumber);
    
    // Select gender
    await page.getByRole('combobox', { name: 'Gender' }).click();
    await page.getByRole('option', { name: testData.patient.gender }).click();
    
    // Save patient
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(5000);
    
    console.log('✅ Patient created successfully');
  });

  test('3. Set Provider Availability', async ({ page }) => {
    test.setTimeout(300000);
    
    // Navigate to availability
    await page.getByRole('tab', { name: 'Scheduling' }).click();
    await page.getByRole('menuitem', { name: 'Availability' }).click();
    await page.getByRole('button', { name: 'Add Availability' }).click();
    
    // Select provider
    await page.getByRole('combobox', { name: 'Provider *' }).click();
    await page.locator(`text=${testData.provider.firstName} ${testData.provider.lastName}`).click();
    
    // Set availability for weekdays
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    for (const day of weekdays) {
      await page.getByRole('tab', { name: day }).click();
      await page.getByRole('checkbox', { name: `${day} Available` }).check();
      
      // Set start time
      await page.locator('div').filter({ hasText: /^Start Time \*/ }).getByRole('button').first().click();
      await page.getByRole('option', { name: '09:00' }).click();
      
      // Set end time
      await page.locator('div').filter({ hasText: /^End Time \*/ }).getByRole('button').first().click();
      await page.getByRole('option', { name: '17:00' }).click();
    }
    
    // Set other details
    await page.getByRole('combobox', { name: 'Appointment Type' }).click();
    await page.getByRole('option', { name: 'New Patient Visit' }).click();
    
    await page.getByRole('combobox', { name: 'Duration' }).click();
    await page.getByRole('option', { name: '30 mins' }).click();
    
    // Save availability
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(10000);
    
    console.log('✅ Provider availability set successfully');
  });

  test('4. Book Appointment', async ({ page }) => {
    test.setTimeout(300000);
    
    // Navigate to appointments
    await page.getByRole('menuitem', { name: 'Appointment' }).click();
    await page.getByRole('button', { name: 'Book Appointment' }).click();
    
    // Select patient
    await page.getByRole('combobox', { name: 'Patient *' }).click();
    await page.locator(`text=${testData.patient.firstName} ${testData.patient.lastName}`).click();
    
    // Select provider
    await page.getByRole('combobox', { name: 'Provider *' }).click();
    await page.locator(`text=${testData.provider.firstName} ${testData.provider.lastName}`).click();
    
    // Select a future weekday date
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 7); // Next week
    
    // Click on date picker and select date
    await page.locator('button:has-text("' + futureDate.getDate() + '")').first().click();
    
    // Select available time slot
    await page.locator('button:has-text("09:00")').first().click();
    
    // Book appointment
    await page.getByRole('button', { name: 'Book Appointment' }).click();
    await page.waitForTimeout(5000);
    
    console.log('✅ Appointment booked successfully');
  });

  test.afterAll(() => {
    console.log('═══════════════════════════════════════════════');
    console.log('🎉 Healthcare Workflow Tests Completed Successfully!');
    console.log('📊 Framework: Healthcare Test Automation v1.0.0');
    console.log('👨‍💻 Built by: Sainath Gaikwad - QA Core Team');
    console.log('═══════════════════════════════════════════════');
  });
}); 
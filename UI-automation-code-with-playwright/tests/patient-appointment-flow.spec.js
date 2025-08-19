const { test, expect } = require('@playwright/test');
const { faker } = require('@faker-js/faker');

// Test configuration
const config = {
  url: 'https://stage_aithinkitive.uat.provider.ecarehealth.com/auth/login',
  email: 'rose.gomez@jourrapide.com',
  password: 'Pass@123',
  timeout: 60000
};

// Helper function to generate random test data
function generateTestData() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const dob = faker.date.past({ years: 30, refDate: new Date() });
  
  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    dob: formatDateForInput(dob),
    dobDisplay: formatDateForDisplay(dob),
    gender: faker.helpers.arrayElement(['Male', 'Female']),
    maritalStatus: faker.helpers.arrayElement(['Single', 'Married', 'Divorced', 'Widowed']),
    mobile: faker.phone.number('(###) ###-#####'),
    email: faker.internet.email(),
    chiefComplaint: faker.lorem.sentence()
  };
}

// Format date for input field (MM-DD-YYYY)
function formatDateForInput(date) {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
}

// Format date for display (e.g., "8 Apr")
function formatDateForDisplay(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

// Helper function to find next weekday
function getNextWeekday() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  
  return date.getDate().toString();
}

test.describe('Patient Appointment Flow', () => {
  test.setTimeout(120000); // 2 minutes timeout for the entire test

  test('Complete patient appointment workflow', async ({ page }) => {
    const testData = generateTestData();
    console.log('Generated test data:', testData);
    
    // Step 1: Login
    console.log('\n--- Step 1: Login ---');
    await page.goto(config.url);
    
    // Handle welcome text if present
    try {
      await page.getByText('Hey, good to see youLet\'s').click({ timeout: 3000 });
    } catch (e) {
      // Welcome text not found, continue
    }
    
    await page.getByRole('textbox', { name: 'Email' }).fill(config.email);
    await page.getByRole('textbox', { name: '*********' }).fill(config.password);
    await page.getByRole('button', { name: 'Let\'s get Started' }).click();
    await page.waitForLoadState('networkidle');
    console.log('✓ Login successful');
    
    // Pause for visibility
    await page.waitForTimeout(2000);
    
    // Step 2: Create New Patient
    console.log('\n--- Step 2: Create New Patient ---');
    await page.getByText('Create').click();
    await page.getByText('New Patient', { exact: true }).click();
    await page.locator('div').filter({ hasText: /^Enter Patient Details$/ }).getByRole('img').click();
    await page.getByRole('button', { name: 'Next' }).click();
    
    // Fill patient form
    await page.getByRole('textbox', { name: 'First Name *' }).fill(testData.firstName);
    await page.getByRole('textbox', { name: 'Last Name *' }).fill(testData.lastName);
    await page.getByRole('textbox', { name: 'Date Of Birth *' }).fill(testData.dob);
    
    await page.getByRole('combobox', { name: 'Gender *' }).click();
    await page.getByRole('option', { name: testData.gender, exact: true }).click();
    
    await page.getByRole('combobox', { name: 'Marital Status' }).click();
    await page.getByRole('option', { name: testData.maritalStatus }).click();
    
    await page.getByRole('textbox', { name: 'Mobile Number *' }).fill(testData.mobile);
    await page.getByRole('textbox', { name: 'Email *' }).fill(testData.email);
    
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForLoadState('networkidle');
    console.log(`✓ Patient created: ${testData.fullName}`);
    
    // Pause for visibility
    await page.waitForTimeout(2000);
    
    // Step 3: Book Appointment
    console.log('\n--- Step 3: Book Appointment ---');
    await page.getByText('Create').click();
    await page.getByText('New Appointment').click();
    
    // Search patient
    await page.locator('.MuiAutocomplete-endAdornment').first().click();
    await page.getByRole('combobox', { name: 'Patient Name *' }).fill(testData.firstName.toLowerCase());
    await page.waitForTimeout(1000);
    
    const patientOption = `${testData.fullName} ${testData.dobDisplay}`;
    await page.getByRole('option', { name: patientOption }).click();
    
    // Appointment details
    await page.locator('div').filter({ hasText: /^Appointment Type \*$/ }).nth(1).click();
    await page.getByRole('option', { name: 'Care Coordination' }).click();
    
    await page.getByRole('textbox', { name: 'Chief Complaint *' }).fill(testData.chiefComplaint);
    await page.getByRole('button', { name: 'Telehealth' }).click();
    
    await page.getByRole('combobox', { name: 'Provider *' }).click();
    await page.getByRole('combobox', { name: 'Provider *' }).fill('rose');
    await page.getByRole('option', { name: 'Rose Gomez' }).click();
    
    await page.getByRole('button', { name: 'View availability' }).click();
    
    // Select next weekday
    const nextWeekday = getNextWeekday();
    await page.getByRole('gridcell', { name: nextWeekday }).click();
    
    // Select first available time slot
    const timeSlots = await page.getByRole('button', { name: /AM - |PM -/ }).all();
    if (timeSlots.length > 0) {
      await timeSlots[0].click();
    }
    
    await page.getByRole('button', { name: 'Save And Close' }).click();
    await page.waitForLoadState('networkidle');
    console.log('✓ Appointment booked');
    
    // Pause for visibility
    await page.waitForTimeout(2000);
    
    // Step 4: Confirm Appointment
    console.log('\n--- Step 4: Confirm Appointment ---');
    await page.getByRole('tab', { name: 'Scheduling' }).click();
    await page.getByText('Appointments').click();
    
    // Search patient
    await page.locator('.MuiInputBase-root').first().click();
    await page.getByRole('combobox', { name: 'Search & Select' }).fill(testData.firstName.toLowerCase());
    await page.waitForTimeout(1000);
    await page.getByRole('option', { name: testData.fullName }).click();
    
    await page.waitForTimeout(2000);
    
    // Confirm appointment
    await page.getByRole('cell', { name: 'Scheduled' }).getByTestId('ChevronRightIcon').click();
    await page.getByRole('button', { name: 'Confirm Appointment' }).click();
    
    await page.waitForLoadState('networkidle');
    console.log('✓ Appointment confirmed');
    
    // Keep browser open for 5 seconds to see the result
    await page.waitForTimeout(5000);
    
    console.log('\n✅ All steps completed successfully!');
  });
});

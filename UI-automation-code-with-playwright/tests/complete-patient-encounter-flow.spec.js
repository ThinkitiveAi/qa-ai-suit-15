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

// Helper function to draw signature on canvas
async function drawSignature(page) {
  const canvas = page.getByTitle('Sign And Lock Diagnosis And').locator('canvas');
  const box = await canvas.boundingBox();
  
  if (box) {
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    
    await page.mouse.move(centerX - 50, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX - 30, centerY - 20);
    await page.mouse.move(centerX - 10, centerY + 20);
    await page.mouse.move(centerX + 10, centerY - 20);
    await page.mouse.move(centerX + 30, centerY + 20);
    await page.mouse.move(centerX + 50, centerY);
    await page.mouse.up();
  }
}

test.describe('Complete Patient Encounter Flow', () => {
  test.setTimeout(300000); // 5 minutes timeout

  test('Full patient workflow from creation to signed encounter', async ({ page }) => {
    const testData = generateTestData();
    console.log('Generated test data:', testData);
    
    // Step 1: Login
    console.log('\n=== STEP 1: LOGIN ===');
    await page.goto(config.url);
    
    try {
      await page.getByText('Hey, good to see youLet\'s').click({ timeout: 3000 });
    } catch (e) {}
    
    await page.getByRole('textbox', { name: 'Email' }).fill(config.email);
    await page.getByRole('textbox', { name: '*********' }).fill(config.password);
    await page.getByRole('button', { name: 'Let\'s get Started' }).click();
    await page.waitForLoadState('networkidle');
    console.log('✓ Login successful');
    
    // Step 2: Create New Patient
    console.log('\n=== STEP 2: CREATE NEW PATIENT ===');
    await page.getByText('Create').click();
    await page.getByText('New Patient', { exact: true }).click();
    await page.locator('div').filter({ hasText: /^Enter Patient Details$/ }).getByRole('img').click();
    await page.getByRole('button', { name: 'Next' }).click();
    
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
    
    // Step 3: Book Appointment
    console.log('\n=== STEP 3: BOOK APPOINTMENT ===');
    await page.getByText('Create').click();
    await page.getByText('New Appointment').click();
    
    await page.locator('.MuiAutocomplete-endAdornment').first().click();
    await page.getByRole('combobox', { name: 'Patient Name *' }).fill(testData.firstName.toLowerCase());
    await page.waitForTimeout(1000);
    
    const patientOption = `${testData.fullName} ${testData.dobDisplay}`;
    await page.getByRole('option', { name: patientOption }).click();
    
    await page.locator('div').filter({ hasText: /^Appointment Type \*$/ }).nth(1).click();
    await page.getByRole('option', { name: 'Care Coordination' }).click();
    
    await page.getByRole('textbox', { name: 'Chief Complaint *' }).fill(testData.chiefComplaint);
    await page.getByRole('button', { name: 'Telehealth' }).click();
    
    await page.getByRole('combobox', { name: 'Provider *' }).click();
    await page.getByRole('combobox', { name: 'Provider *' }).fill('rose');
    await page.getByRole('option', { name: 'Rose Gomez' }).click();
    
    await page.getByRole('button', { name: 'View availability' }).click();
    
    const nextWeekday = getNextWeekday();
    await page.getByRole('gridcell', { name: nextWeekday }).click();
    
    const timeSlots = await page.getByRole('button', { name: /AM - |PM -/ }).all();
    if (timeSlots.length > 0) {
      await timeSlots[0].click();
    }
    
    await page.getByRole('button', { name: 'Save And Close' }).click();
    await page.waitForLoadState('networkidle');
    console.log('✓ Appointment booked');
    
    // Step 4: Navigate to Appointments and Search
    console.log('\n=== STEP 4: NAVIGATE TO APPOINTMENTS ===');
    await page.getByRole('tab', { name: 'Scheduling' }).click();
    await page.getByText('Appointments').click();
    
    await page.locator('.MuiInputBase-root').first().click();
    await page.getByRole('combobox', { name: 'Search & Select' }).fill(testData.firstName.toLowerCase());
    await page.waitForTimeout(1000);
    await page.getByRole('option', { name: testData.fullName }).click();
    
    await page.locator('div').filter({ hasText: /^TodayAugust \d+ – \d+$/ }).getByRole('button').nth(2).click();
    console.log('✓ Found patient appointment');
    
    // Step 5: Confirm Appointment
    console.log('\n=== STEP 5: CONFIRM APPOINTMENT ===');
    await page.getByRole('cell', { name: 'Scheduled' }).getByTestId('ChevronRightIcon').click();
    await page.getByRole('button', { name: 'Confirm Appointment' }).click();
    await page.waitForTimeout(2000);
    console.log('✓ Appointment confirmed');
    
    // Step 6: Start Check In
    console.log('\n=== STEP 6: START CHECK IN ===');
    await page.locator('#root div').filter({ hasText: /^Confirmed$/ }).nth(3).click();
    await page.getByRole('button', { name: 'Start Check In' }).click();
    
    // Handle if we need to click again
    try {
      await page.getByRole('cell', { name: 'Confirmed' }).getByRole('paragraph').click({ timeout: 3000 });
      await page.getByRole('button', { name: 'Start Check In' }).click();
    } catch (e) {
      // Already clicked, continue
    }
    await page.waitForTimeout(2000);
    console.log('✓ Check in started');
    
    // Step 7: Complete Check In
    console.log('\n=== STEP 7: COMPLETE CHECK IN ===');
    await page.getByRole('button', { name: 'Complete Check In' }).click();
    await page.waitForTimeout(2000);
    console.log('✓ Check in completed');
    
    // Step 8: Start Appointment
    console.log('\n=== STEP 8: START APPOINTMENT ===');
    await page.getByRole('button', { name: 'Start Appointment' }).click();
    await page.waitForTimeout(2000);
    console.log('✓ Appointment started');
    
    // Step 9: Start Encounter
    console.log('\n=== STEP 9: START ENCOUNTER ===');
    await page.getByRole('button', { name: 'Start Encounter' }).click();
    await page.waitForTimeout(3000);
    console.log('✓ Encounter started');
    
    // Step 10: Save & Start Exam
    console.log('\n=== STEP 10: SAVE & START EXAM ===');
    await page.getByRole('button', { name: 'Save & Start Exam' }).click();
    await page.waitForTimeout(3000);
    console.log('✓ Exam started');
    
    // Step 11: Select Diagnosis
    console.log('\n=== STEP 11: SELECT DIAGNOSIS ===');
    await page.locator('.MuiBox-root.css-1wdhvac > div:nth-child(2) > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner').click();
    await page.getByRole('option', { name: 'A001 - This is description' }).click();
    await page.waitForTimeout(2000);
    console.log('✓ Diagnosis selected');
    
    // Step 12: Done With Exam
    console.log('\n=== STEP 12: COMPLETE EXAM ===');
    await page.getByRole('button', { name: 'Done With Exam' }).click();
    await page.waitForTimeout(2000);
    console.log('✓ Exam completed');
    
    // Step 13: Save & Sign Notes
    console.log('\n=== STEP 13: SAVE & SIGN NOTES ===');
    await page.getByRole('button', { name: 'Save & Sign Notes' }).click();
    await page.waitForTimeout(2000);
    console.log('✓ Notes saved');
    
    // Step 14: Sign
    console.log('\n=== STEP 14: SIGN ENCOUNTER ===');
    await page.getByRole('button', { name: 'Sign' }).click();
    await page.waitForTimeout(2000);
    
    // Draw signature on canvas
    await drawSignature(page);
    console.log('✓ Signature drawn');
    
    // Step 15: Sign & Lock
    console.log('\n=== STEP 15: SIGN & LOCK ===');
    await page.getByRole('button', { name: 'Sign & Lock' }).click();
    await page.waitForTimeout(3000);
    console.log('✓ Encounter signed and locked');
    
    // Step 16: Close dialogs
    console.log('\n=== STEP 16: CLOSE DIALOGS ===');
    await page.getByLabel('Close').click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Close' }).click();
    await page.waitForTimeout(1000);
    console.log('✓ Dialogs closed');
    
    // Step 17: Logout
    console.log('\n=== STEP 17: LOGOUT ===');
    await page.getByTestId('PersonIcon').click();
    await page.getByText('Log Out').click();
    await page.getByRole('button', { name: 'Yes,Sure' }).click();
    console.log('✓ Logged out successfully');
    
    console.log('\n🎉 COMPLETE WORKFLOW EXECUTED SUCCESSFULLY! 🎉');
    console.log('================================================');
    console.log('✅ Patient created');
    console.log('✅ Appointment booked and confirmed');
    console.log('✅ Patient checked in');
    console.log('✅ Encounter completed');
    console.log('✅ Notes signed and locked');
    console.log('✅ System logout completed');
  });
});

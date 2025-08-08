const credentials = {
  username: 'rose.gomez@jourrapide.com',
  password: 'demo1234'
};

module.exports = {
  async authenticate(apiClient) {
    const token = await apiClient.login(credentials);
    console.log('🔐 Authenticated with token:', token?.substring(0, 20) + '...');
  }
};


// File: utils/testDataGenerator.js
" + `YOUR FULL ORIGINAL DETAILED testDataGenerator.js CONTENT HERE`


// File: tests/apiFlow.test.js
const { test, expect } = require('@playwright/test');
const ApiClient = require('../utils/apiClient');
const AuthHelper = require('../utils/authHelper');
const TestDataGenerator = require('../utils/testDataGenerator');

test('🔁 Complete eCareHealth Flow', async ({ request }) => {
  const apiClient = new ApiClient(request);
  await AuthHelper.authenticate(apiClient);

  // Provider creation
  const providerData = TestDataGenerator.generateProviderData();
  const provider = await apiClient.createProvider(providerData);
  const providerId = provider?.requestId || provider?.data?.uuid;
  expect(providerId).toBeTruthy();

  // Availability
  const availabilityData = TestDataGenerator.generateAvailabilityData(providerId);
  const availability = await apiClient.setAvailability(availabilityData);
  expect(availability).toBeTruthy();

  // Patient creation
  const patientData = TestDataGenerator.generatePatientData();
  const patient = await apiClient.createPatient(patientData);
  const patientId = patient?.requestId || patient?.data?.uuid;
  expect(patientId).toBeTruthy();

  // Book appointment
  const appointmentData = TestDataGenerator.generateAppointmentData(providerId, patientId);
  const appointment = await apiClient.bookAppointment(appointmentData);
  const appointmentId = appointment?.uuid;
  expect(appointmentId).toBeTruthy();

  // Confirm appointment
  const confirm = await apiClient.confirmAppointment(appointmentId);
  expect(confirm).toBeTruthy();

  // Check-in
  const checkin = await apiClient.checkIn(appointmentId);
  expect(checkin).toBeTruthy();

  // Save encounter
  const encounterData = TestDataGenerator.generateEncounterData(providerId, patientId);
  const encounter = await apiClient.saveEncounter(encounterData);
  const encounterId = encounter?.uuid;
  expect(encounterId).toBeTruthy();

  // Update encounter
  const updatedEncounter = await apiClient.updateEncounter(encounterId, encounterData);
  expect(updatedEncounter).toBeTruthy();

  // Sign-off
  const signoff = await apiClient.signOffEncounter(encounterId);
  expect(signoff).toBeTruthy();

  console.log('✅ Complete eCareHealth flow tested successfully.');
});

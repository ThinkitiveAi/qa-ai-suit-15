// test.config.ts
// Configuration for using existing test data or creating new ones

export const testConfig = {
  // Set to true to use existing IDs instead of creating new entities
  useExistingData: process.env.USE_EXISTING_DATA === 'true' || false,
  
  // Existing IDs from your Postman collection
  existingIds: {
    providerId: 'dc769997-f9ce-4153-a6f9-bd491ac35228',
    patientId: 'ac59331f-b6ff-4787-8eeb-a52ff0257861',
    appointmentId: 'e565284c-e0b8-4efc-81f2-01ddd6921ee0',
    encounterId: 'a88bc8f4-ddc7-4f29-b0a1-cd86ceb4b612'
  },
  
  // Test credentials
  credentials: {
    username: process.env.TEST_USERNAME || 'rose.gomez@jourrapide.com',
    password: process.env.TEST_PASSWORD || 'Pass@123'
  },
  
  // API Configuration
  api: {
    baseUrl: process.env.BASE_URL || 'https://stage-api.ecarehealth.com',
    tenantId: process.env.TENANT_ID || 'stage_aithinkitive'
  }
};
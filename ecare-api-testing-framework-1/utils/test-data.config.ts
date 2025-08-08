// test-data.config.ts
export const testConfig = {
  // Authentication credentials
  auth: {
    username: process.env.TEST_USERNAME || 'rose.gomez@jourrapide.com',
    password: process.env.TEST_PASSWORD || 'Pass@123'
  },

  // Test data defaults
  provider: {
    roleType: 'PROVIDER',
    gender: 'MALE',
    timezone: 'IST',
    bookingWindow: '4',
    slotDuration: 15,
    availabilityMode: 'VIRTUAL'
  },

  patient: {
    gender: 'MALE',
    timezone: 'IST',
    birthDate: '1994-08-16T18:30:00.000Z',
    copayType: 'FIXED'
  },

  appointment: {
    mode: 'VIRTUAL',
    type: 'NEW',
    paymentType: 'CASH',
    duration: 15,
    timezone: 'IST',
    chiefComplaint: 'Test',
    recurringFrequency: 'daily',
    customFrequencyUnit: 'days'
  },

  encounter: {
    formType: 'SIMPLE_SOAP_NOTE',
    initialStatus: 'INTAKE',
    examStatus: 'EXAM',
    defaultNote: 'Automated test encounter',
    defaultTreatment: 'Treatment plan to be determined'
  },

  // Provider availability schedule
  availability: {
    days: [
      { day: 'MONDAY', startTime: '00:00:00', endTime: '23:45:00' },
      { day: 'TUESDAY', startTime: '10:00:00', endTime: '22:00:00' },
      { day: 'WEDNESDAY', startTime: '00:00:00', endTime: '00:30:00' },
      { day: 'THURSDAY', startTime: '00:15:00', endTime: '01:15:00' },
      { day: 'FRIDAY', startTime: '10:00:00', endTime: '22:00:00' },
      { day: 'SATURDAY', startTime: '00:00:00', endTime: '23:45:00' },
      { day: 'SUNDAY', startTime: '00:00:00', endTime: '23:45:00' }
    ],
    settings: [
      { type: 'NEW', slotTime: 15, minNoticeUnit: 'string' },
      { type: 'CARE_COORDINATION', slotTime: 30, minNoticeUnit: 'string' }
    ]
  },

  // Tenant configuration
  tenant: {
    id: 'stage_aithinkitive',
    origin: 'https://stage_aithinkitive.uat.provider.ecarehealth.com'
  }
};
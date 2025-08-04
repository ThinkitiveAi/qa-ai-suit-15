/**
 * @fileoverview Application constants and configuration values
 * @author Senior QA Automation Engineer
 * @version 1.0.0
 */

export const APP_URLS = {
  BASE_URL: 'https://stage_aithinkitive.uat.provider.ecarehealth.com',
  LOGIN: '/auth/login',
  DASHBOARD: '/app/provider/scheduling/appointment',
  PROVIDERS: '/app/provider/settings/providers',
  PATIENTS: '/app/provider/patients',
  AVAILABILITY: '/app/provider/scheduling/availability',
  APPOINTMENTS: '/app/provider/scheduling/appointment'
} as const;

export const TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 15000,
  LONG: 30000,
  EXTRA_LONG: 60000,
  NAVIGATION: 90000,
  TEST_TIMEOUT: 300000
} as const;

export const TEST_DATA_POOLS = {
  PROVIDER_FIRST_NAMES: [
    'Dr. Sainath', 'Dr. Gargi', 'Dr. Rutuja', 'Dr. Ashish', 
    'Dr. Shubham', 'Dr. Hero', 'Dr. Nikita', 'Dr. Starc', 
    'Dr. Shekhawat', 'Dr. Angela'
  ],
  PROVIDER_LAST_NAMES: [
    'Mitchell', 'Johnson', 'Williams', 'Brown', 'Davis', 
    'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 
    'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 
    'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark'
  ],
  PATIENT_FIRST_NAMES: [
    'Michael', 'David', 'James', 'Robert', 'Christopher', 
    'William', 'Daniel', 'Matthew', 'Anthony', 'Mark', 
    'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 
    'Kenneth', 'Kevin', 'Brian', 'George', 'Edward'
  ],
  PATIENT_LAST_NAMES: [
    'Rodriguez', 'Martinez', 'Anderson', 'Wilson', 'Taylor', 
    'Smith', 'Jones', 'Brown', 'Davis', 'Miller', 
    'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 
    'Jackson', 'White', 'Harris', 'Martin', 'Thompson'
  ]
} as const;

export const DROPDOWN_OPTIONS = {
  TIMEZONES: [
    'Eastern Standard Time (UTC -5)', 'Eastern Daylight Time (UTC -4)',
    'Central Standard Time (UTC -6)', 'Central Daylight Time (UTC -5)',
    'Mountain Standard Time (UTC -7)', 'Mountain Daylight Time (UTC -6)',
    'Pacific Standard Time (UTC -8)', 'Pacific Daylight Time (UTC -7)',
    'Alaska Standard Time (UTC -9)', 'Alaska Daylight Time (UTC -8)'
  ],
  BOOKING_WINDOWS: ['1 Week', '2 Week', '3 Week', '4 Week'],
  APPOINTMENT_TYPES: [
    'New Patient Visit', 'Consultation', 'Office Visit', 'Follow-up Visit'
  ],
  DURATIONS: ['15 minutes', '30 minutes', '45 minutes', '60 minutes'],
  SCHEDULE_NOTICES: [
    '15 Minutes Away', '30 Minutes Away', '1 Hours Away', '2 Hours Away'
  ],
  SPECIALTIES: [
    'Internal Medicine', 'Family Medicine', 'General Practice',
    'Primary Care', 'Cardiology'
  ]
} as const;

export const WEEKDAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
] as const;

export const ALL_DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
] as const;

export const SELECTORS = {
  MUI_DATE_PICKER: {
    DATE_BUTTON: 'button.MuiButtonBase-root.MuiPickersDay-root.MuiPickersDay-dayWithMargin',
    DATE_WITH_TIMESTAMP: 'button[data-timestamp].MuiPickersDay-root',
    DATE_GRIDCELL: 'button[role="gridcell"].MuiPickersDay-root'
  },
  DROPDOWN: {
    OPEN_BUTTON: '[aria-label="Open"]',
    OPTION: '[role="option"]',
    SELECT_BUTTON: '[role="button"]:has-text("Select")'
  },
  FORM_ELEMENTS: {
    CHECKBOX: '[role="checkbox"]',
    TEXTBOX: '[role="textbox"]',
    COMBOBOX: '[role="combobox"]'
  }
} as const;

export const ERROR_MESSAGES = {
  BROWSER_CLOSED: 'Browser page was closed unexpectedly',
  TIMEOUT_EXCEEDED: 'Operation timeout exceeded',
  ELEMENT_NOT_FOUND: 'Required element not found on page',
  VALIDATION_ERROR: 'Form validation error occurred',
  NETWORK_ERROR: 'Network request failed'
} as const;

export const SUCCESS_MESSAGES = {
  PROVIDER_CREATED: 'Provider created successfully',
  PATIENT_REGISTERED: 'Patient registered successfully',
  AVAILABILITY_SET: 'Provider availability configured successfully',
  APPOINTMENT_BOOKED: 'Appointment booked successfully'
} as const; 
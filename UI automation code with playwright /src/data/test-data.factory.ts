/**
 * @fileoverview Test data factory for generating unique test entities
 * @author Senior QA Automation Engineer
 * @version 1.0.0
 */

import { 
  Provider, 
  Patient, 
  TestSession, 
  AvailabilitySettings 
} from '../types/test-data.types';
import { TEST_DATA_POOLS, DROPDOWN_OPTIONS } from '../constants/app.constants';
import { Logger } from '../utils/logger.util';

export class TestDataFactory {
  private static instance: TestDataFactory;
  private testRunId: number;
  private randomSuffix: number;

  private constructor() {
    this.testRunId = Date.now();
    this.randomSuffix = Math.floor(Math.random() * 1000);
    Logger.setTestRunId(this.testRunId);
  }

  public static getInstance(): TestDataFactory {
    if (!TestDataFactory.instance) {
      TestDataFactory.instance = new TestDataFactory();
    }
    return TestDataFactory.instance;
  }

  /**
   * Generate a unique email address
   */
  private generateEmail(prefix: string): string {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    return `${prefix}.${this.testRunId}.${randomNum}.${timestamp}@example.com`;
  }

  /**
   * Generate a random date of birth
   */
  private generateDateOfBirth(minAge: number = 25, maxAge: number = 65): string {
    const today = new Date();
    const birthYear = today.getFullYear() - minAge - Math.floor(Math.random() * (maxAge - minAge));
    const birthMonth = Math.floor(Math.random() * 12) + 1;
    const birthDay = Math.floor(Math.random() * 28) + 1; // Safe day range
    
    return `${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}-${birthYear}`;
  }

  /**
   * Get random item from array
   */
  private getRandomFromArray<T>(array: readonly T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Generate a unique provider
   */
  generateProvider(): Provider {
    const firstName = this.getRandomFromArray(TEST_DATA_POOLS.PROVIDER_FIRST_NAMES);
    const lastName = this.getRandomFromArray(TEST_DATA_POOLS.PROVIDER_LAST_NAMES);
    
    const provider: Provider = {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: this.generateEmail('provider'),
      npiNumber: `12345${String(this.testRunId).slice(-5)}`, // Unique 10-digit NPI
      dateOfBirth: this.generateDateOfBirth(30, 60),
      gender: this.getRandomFromArray(['Male', 'Female'] as const),
      providerType: 'MD',
      specialties: [this.getRandomFromArray(DROPDOWN_OPTIONS.SPECIALTIES)],
      role: 'Provider',
      created: false,
      selectedInAvailability: ''
    };

    Logger.info(`Generated provider: ${provider.fullName}`, 'DATA_FACTORY');
    return provider;
  }

  /**
   * Generate a unique patient
   */
  generatePatient(): Patient {
    const firstName = this.getRandomFromArray(TEST_DATA_POOLS.PATIENT_FIRST_NAMES);
    const lastName = this.getRandomFromArray(TEST_DATA_POOLS.PATIENT_LAST_NAMES);
    
    const patient: Patient = {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: this.generateEmail('patient'),
      phoneNumber: `555${String(this.testRunId).slice(-7)}`, // Unique phone number
      dateOfBirth: this.generateDateOfBirth(18, 80),
      gender: this.getRandomFromArray(['Male', 'Female'] as const),
      created: false
    };

    Logger.info(`Generated patient: ${patient.fullName}`, 'DATA_FACTORY');
    return patient;
  }

  /**
   * Generate default availability settings
   */
  generateAvailabilitySettings(): AvailabilitySettings {
    return {
      timezone: this.getRandomFromArray(DROPDOWN_OPTIONS.TIMEZONES),
      bookingWindow: this.getRandomFromArray(DROPDOWN_OPTIONS.BOOKING_WINDOWS),
      startTime: '09:00 AM',
      endTime: '05:00 PM (8 hrs)',
      appointmentType: this.getRandomFromArray(DROPDOWN_OPTIONS.APPOINTMENT_TYPES),
      duration: this.getRandomFromArray(DROPDOWN_OPTIONS.DURATIONS),
      scheduleNotice: this.getRandomFromArray(DROPDOWN_OPTIONS.SCHEDULE_NOTICES),
      telehealth: true,
      enabledDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      set: false
    };
  }

  /**
   * Generate a complete test session with all required data
   */
  generateTestSession(): TestSession {
    const session: TestSession = {
      testRunId: this.testRunId,
      provider: this.generateProvider(),
      patient: this.generatePatient(),
      availability: this.generateAvailabilitySettings(),
      randomSuffix: this.randomSuffix,
      startTime: new Date()
    };

    this.logTestSessionSummary(session);
    return session;
  }

  /**
   * Log test session summary for debugging
   */
  private logTestSessionSummary(session: TestSession): void {
    Logger.separator(`Test Session Generated - ID: ${session.testRunId}`);
    Logger.info(`✅ Provider: ${session.provider.fullName} (NPI: ${session.provider.npiNumber})`);
    Logger.info(`✅ Patient: ${session.patient.fullName} (Phone: ${session.patient.phoneNumber})`);
    Logger.info(`🔄 Unique identifiers embedded in emails, NPI, and phone numbers`);
    Logger.separator();
  }

  /**
   * Get current test run ID
   */
  getTestRunId(): number {
    return this.testRunId;
  }

  /**
   * Reset factory for new test run
   */
  reset(): void {
    this.testRunId = Date.now();
    this.randomSuffix = Math.floor(Math.random() * 1000);
    Logger.setTestRunId(this.testRunId);
    Logger.info(`Test data factory reset with new run ID: ${this.testRunId}`, 'DATA_FACTORY');
  }
}

// Export singleton instance
export const testDataFactory = TestDataFactory.getInstance(); 
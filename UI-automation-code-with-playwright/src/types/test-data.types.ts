/**
 * @fileoverview Type definitions for test data and entities
 * @author Senior QA Automation Engineer
 * @version 1.0.0
 */

export interface Provider {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  npiNumber: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  providerType: string;
  specialties: string[];
  role: string;
  created: boolean;
  selectedInAvailability: string;
}

export interface Patient {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  created: boolean;
}

export interface AvailabilitySettings {
  timezone: string;
  bookingWindow: string;
  startTime: string;
  endTime: string;
  appointmentType: string;
  duration: string;
  scheduleNotice: string;
  telehealth: boolean;
  enabledDays: string[];
  set: boolean;
}

export interface AppointmentDetails {
  patient: Patient;
  provider: Provider;
  appointmentType: string;
  reason: string;
  date: string;
  timeSlot: string;
  visitType: 'In-Person' | 'Telehealth';
  timezone: string;
  booked: boolean;
}

export interface TestSession {
  testRunId: number;
  provider: Provider;
  patient: Patient;
  availability: AvailabilitySettings;
  appointment?: AppointmentDetails;
  randomSuffix: number;
  startTime: Date;
  endTime?: Date;
}

export interface UserCredentials {
  email: string;
  password: string;
  role: 'admin' | 'provider' | 'patient';
}

export interface TestEnvironment {
  baseUrl: string;
  apiUrl?: string;
  name: 'staging' | 'production' | 'development';
  credentials: UserCredentials;
} 
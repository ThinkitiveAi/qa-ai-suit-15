// File: testDataGenerator.js

class TestDataGenerator {
  static generateProviderData() {
    const timestamp = Date.now();
    return {
      firstName: `Auto${timestamp}`,
      lastName: 'Test',
      email: `auto_provider_${timestamp}@mail.com`,
      roleType: 'PROVIDER'
    };
  }

  static generateAvailabilityData(providerId) {
    return {
      providerId,
      setToWeekdays: true,
      timezone: 'EST',
      daySlots: [{ day: 'MONDAY', startTime: '09:00:00', endTime: '17:00:00', availabilityMode: 'VIRTUAL' }],
      xTENANTID: 'stage_aithinkitive'
    };
  }

  static generatePatientData() {
    const timestamp = Date.now();
    return {
      firstName: `Test${timestamp}`,
      lastName: 'Patient',
      birthDate: '1990-01-01',
      gender: 'MALE'
    };
  }

  static generateAppointmentData(providerId, patientId) {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    now.setHours(10, 0, 0);

    const startTime = now.toISOString();
    const endTime = new Date(now.getTime() + 30 * 60000).toISOString();

    return {
      providerId,
      patientId,
      startTime,
      endTime,
      mode: 'VIRTUAL',
      type: 'NEW',
      timezone: 'EST',
      xTENANTID: 'stage_aithinkitive'
    };
  }

  static generateEncounterData(providerId, patientId, appointmentId) {
    return {
      providerId,
      patientId,
      appointmentId,
      complaint: 'Automated test complaint',
      assessment: 'Test assessment',
      plan: 'Initial test plan',
      diagnosis: 'Hypertension - I10',
      status: 'DRAFT',
      encounterMode: 'VIRTUAL',
      xTENANTID: 'stage_aithinkitive'
    };
  }

  static generateEncounterUpdateData() {
    return {
      plan: 'Updated plan via automation',
      notes: 'Follow-up notes added via script'
    };
  }
}

module.exports = TestDataGenerator;

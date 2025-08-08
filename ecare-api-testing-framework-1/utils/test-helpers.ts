// test-helpers.ts
import { APIRequestContext } from '@playwright/test';
import * as winston from 'winston';

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'test-results/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'test-results/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// API Response handler
export class ApiResponseHandler {
  static async handleResponse(response: any, expectedStatus: number | number[]) {
    const status = response.status();
    const expectedStatuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
    
    if (!expectedStatuses.includes(status)) {
      const body = await response.text();
      logger.error(`API call failed. Status: ${status}, Body: ${body}`);
      throw new Error(`Expected status ${expectedStatuses.join(' or ')}, but got ${status}`);
    }
    
    return response;
  }
  
  static async extractJson(response: any) {
    try {
      return await response.json();
    } catch (error) {
      logger.error(`Failed to parse JSON response: ${error}`);
      throw error;
    }
  }
}

// Test data generators
export class TestDataGenerator {
  static generateUniqueEmail(prefix: string = 'test'): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    return `${prefix}.${timestamp}.${randomStr}@test.com`;
  }
  
  static generatePhoneNumber(): string {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const prefix = Math.floor(Math.random() * 900) + 100;
    const lineNumber = Math.floor(Math.random() * 9000) + 1000;
    return `${areaCode}${prefix}${lineNumber}`;
  }
  
  static generateSSN(): string {
    const area = Math.floor(Math.random() * 900) + 100;
    const group = Math.floor(Math.random() * 90) + 10;
    const serial = Math.floor(Math.random() * 9000) + 1000;
    return `${area}-${group}-${serial}`;
  }
  
  static generateNPI(): string {
    // Generate a 10-digit NPI number
    return Math.floor(Math.random() * 9000000000 + 1000000000).toString();
  }
  
  static generateFutureDate(daysFromNow: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
  }
  
  static generateTimeSlot(date: Date, startHour: number, durationMinutes: number = 30) {
    const startTime = new Date(date);
    startTime.setHours(startHour, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);
    
    return {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    };
  }
}

// API Client wrapper
export class ApiClient {
  private context: APIRequestContext;
  private baseUrl: string;
  
  constructor(context: APIRequestContext, baseUrl: string) {
    this.context = context;
    this.baseUrl = baseUrl;
  }
  
  async get(endpoint: string, options?: any) {
    logger.info(`GET ${endpoint}`);
    const response = await this.context.get(endpoint, options);
    logger.info(`Response status: ${response.status()}`);
    return response;
  }
  
  async post(endpoint: string, data: any, options?: any) {
    logger.info(`POST ${endpoint}`);
    logger.debug(`Request body: ${JSON.stringify(data, null, 2)}`);
    const response = await this.context.post(endpoint, { data, ...options });
    logger.info(`Response status: ${response.status()}`);
    return response;
  }
  
  async put(endpoint: string, data: any, options?: any) {
    logger.info(`PUT ${endpoint}`);
    logger.debug(`Request body: ${JSON.stringify(data, null, 2)}`);
    const response = await this.context.put(endpoint, { data, ...options });
    logger.info(`Response status: ${response.status()}`);
    return response;
  }
  
  async patch(endpoint: string, data: any, options?: any) {
    logger.info(`PATCH ${endpoint}`);
    logger.debug(`Request body: ${JSON.stringify(data, null, 2)}`);
    const response = await this.context.patch(endpoint, { data, ...options });
    logger.info(`Response status: ${response.status()}`);
    return response;
  }
  
  async delete(endpoint: string, options?: any) {
    logger.info(`DELETE ${endpoint}`);
    const response = await this.context.delete(endpoint, options);
    logger.info(`Response status: ${response.status()}`);
    return response;
  }
}

// Authentication helper
export class AuthenticationHelper {
  static async authenticate(apiContext: APIRequestContext, credentials: { username: string; password: string }) {
    logger.info(`Authenticating user: ${credentials.username}`);
    
    const response = await apiContext.post('/api/master/login', {
      data: credentials
    });
    
    if (response.status() !== 200) {
      throw new Error(`Authentication failed with status: ${response.status()}`);
    }
    
    const authResult = await response.json();
    logger.info('Authentication successful');
    
    return authResult.accessToken;
  }
  
  static async createAuthenticatedContext(playwright: any, baseUrl: string, bearerToken: string) {
    return await playwright.request.newContext({
      baseURL: baseUrl,
      extraHTTPHeaders: {
        'Authorization': `Bearer ${bearerToken}`,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/json',
        'Origin': baseUrl,
        'Referer': `${baseUrl}/`,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
      }
    });
  }
}

// Validation helpers
export class ValidationHelper {
  static validateRequiredFields(obj: any, requiredFields: string[]) {
    const missingFields = requiredFields.filter(field => !obj.hasOwnProperty(field));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    return true;
  }
  
  static validateFieldTypes(obj: any, fieldTypes: { [key: string]: string }) {
    for (const [field, expectedType] of Object.entries(fieldTypes)) {
      if (obj.hasOwnProperty(field)) {
        const actualType = typeof obj[field];
        if (actualType !== expectedType) {
          throw new Error(`Field '${field}' expected to be ${expectedType}, but got ${actualType}`);
        }
      }
    }
    
    return true;
  }
}

// Retry helper for flaky API calls
export class RetryHelper {
  static async retry<T>(
    fn: () => Promise<T>,
    options: { maxRetries?: number; delay?: number; backoff?: number } = {}
  ): Promise<T> {
    const { maxRetries = 3, delay = 1000, backoff = 2 } = options;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        const waitTime = delay * Math.pow(backoff, attempt - 1);
        logger.warn(`Attempt ${attempt} failed, retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    throw new Error('Retry failed');
  }
}

// Export logger for use in tests
export { logger };

// Appointment workflow helper
export class AppointmentWorkflowHelper {
  static getAppointmentStatuses() {
    return {
      SCHEDULED: 'SCHEDULED',
      CONFIRMED: 'CONFIRMED',
      CHECKED_IN: 'CHECKED_IN',
      IN_PROGRESS: 'IN_PROGRESS',
      COMPLETED: 'COMPLETED',
      CANCELLED: 'CANCELLED'
    };
  }
  
  static getEncounterStatuses() {
    return {
      INTAKE: 'INTAKE',
      EXAM: 'EXAM',
      COMPLETED: 'COMPLETED'
    };
  }
  
  static generateProviderSignature(): string {
    // Generate a simple base64 signature placeholder
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }
  
  static getDefaultVitals() {
    return [
      {selected: false, name: "bloodPressure", label: "Blood Pressure", unit: "mmHg"},
      {selected: false, name: "bloodGlucose", label: "Blood Glucose", unit: "mg/dL"},
      {selected: false, name: "bodyTemperature", label: "Body Temperature", unit: "f"},
      {selected: false, name: "heartRate", label: "Heart Rate", unit: "BPM"},
      {selected: false, name: "respirationRate", label: "Respiration Rate", unit: "BPM"},
      {selected: false, name: "height", label: "Height", unit: "m"},
      {selected: false, name: "weight", label: "Weight", unit: "lbs"},
      {selected: false, name: "o2_saturation", label: "Oxygen Saturation (SpO2)", unit: "%"},
      {selected: false, name: "pulseRate", label: "Pulse Rate", unit: "BPM"},
      {selected: false, name: "bmi", label: "Body Mass Index", unit: "kg/m^2"},
      {selected: false, name: "respiratoryVolume", label: "Respiratory Volume", unit: "ml"},
      {selected: false, name: "perfusionIndex", label: "Perfusion Index", unit: "%"},
      {selected: false, name: "peakExpiratoryFlow", label: "Peak Expiratory Flow", unit: "l/min"},
      {selected: false, name: "forceExpiratoryVolume", label: "Forced Expiratory Volume", unit: "l"}
    ];
  }
}
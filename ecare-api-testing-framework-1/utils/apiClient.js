const { expect } = require('@playwright/test');

class ApiClient {
  constructor(request, baseURL = 'https://stage-api.ecarehealth.com') {
    this.request = request;
    this.baseURL = baseURL;
    this.bearerToken = null;
  }

  setBearerToken(token) {
    this.bearerToken = token;
  }

  async makeRequest(method, endpoint, data = null, expectedStatuses = [200, 201], useAuth = true) {
    const options = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': 'https://qa.practiceeasily.com',
        'Referer': 'https://qa.practiceeasily.com/',
      }
    };

    if (this.bearerToken && useAuth) {
      options.headers['Authorization'] = `Bearer ${this.bearerToken}`;
    }

    if (data) {
      options.data = data;
    }

    const response = await this.request[method.toLowerCase()](endpoint, options);
    const body = await response.json().catch(() => response.text());

    if (!expectedStatuses.includes(response.status())) {
      throw new Error(`Expected ${expectedStatuses}, got ${response.status()}`);
    }

    return { status: response.status(), body };
  }

  async login(credentials) {
    const res = await this.makeRequest('POST', '/api/master/login', credentials);
    const token = res.body?.data?.access_token;
    this.setBearerToken(token);
    return token;
  }

  async createProvider(data) {
    const res = await this.makeRequest('POST', '/api/master/provider', data);
    return res.body;
  }

  async setAvailability(data) {
    const res = await this.makeRequest('POST', '/api/master/provider/availability-setting', data);
    return res.body;
  }

  async createPatient(data) {
    const res = await this.makeRequest('POST', '/api/master/patient', data);
    return res.body;
  }

  async bookAppointment(data) {
    const res = await this.makeRequest('POST', '/api/master/appointment', data);
    return res.body;
  }

  async confirmAppointment(uuid) {
    const res = await this.makeRequest('PUT', `/api/master/appointment/${uuid}/confirm`);
    return res.body;
  }

  async checkIn(appointmentId) {
    const res = await this.makeRequest('PUT', `/api/master/appointment/${appointmentId}/check-in`);
    return res.body;
  }

  async fetchZoomToken(encounterId) {
    const res = await this.makeRequest('GET', `/api/telehealth/encounter/${encounterId}/zoom-token`);
    return res.body;
  }

  async saveEncounter(data) {
    const res = await this.makeRequest('POST', '/api/encounter', data);
    return res.body;
  }

  async updateEncounter(id, data) {
    const res = await this.makeRequest('PUT', `/api/encounter/${id}`, data);
    return res.body;
  }

  async signOffEncounter(id) {
    const res = await this.makeRequest('PUT', `/api/encounter/${id}/sign-off`);
    return res.body;
  }
}

module.exports = ApiClient;
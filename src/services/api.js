/**
 * src/services/api.js — Centralized Hospital API Client
 *
 * Provides typed, error-handled HTTP communication with the Express/MongoDB backend.
 * Features:
 *  - Automatic JWT Bearer token attachment via Authorization header
 *  - Configurable baseURL via Vite environment variables (VITE_API_URL)
 *  - 3-second automatic timeout to prevent browser UI hanging if backend is offline
 *  - Unified error handling & JSON formatting
 *  - Seamless fallback support for offline/demo scenarios
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Universal request wrapper for Fetch API
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Attach stored JWT token if present
  const token = localStorage.getItem('hms_jwt_token') || sessionStorage.getItem('hms_jwt_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutMs = options.timeout || 3000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const config = {
    ...options,
    headers,
    signal: options.signal || controller.signal,
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    // Auto-detect JSON response
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('hms_jwt_token');
        sessionStorage.removeItem('hms_jwt_token');
      }

      const errorMsg = (data && data.message) || response.statusText || 'Request failed';
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      const error = new Error('Connection to backend timed out.');
      error.isTimeout = true;
      error.isNetworkError = true;
      throw error;
    }

    if (!err.status) {
      err.isNetworkError = true;
      err.message = 'Unable to connect to hospital server. Backend is offline.';
    }
    throw err;
  }
}

// ===========================================================================
// Domain API Services
// ===========================================================================

export const authApi = {
  login:          (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials), timeout: 2500 }),
  getMe:          () => request('/auth/me', { method: 'GET' }),
  changePassword: (passwords) => request('/auth/change-password', { method: 'PUT', body: JSON.stringify(passwords) }),
  logout:         () => request('/auth/logout', { method: 'POST' }),
  checkHealth:    () => request('/health', { method: 'GET', timeout: 1500 }),
};

export const patientApi = {
  getAll:            (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/patients${query ? `?${query}` : ''}`);
  },
  getById:           (id) => request(`/patients/${id}`),
  create:            (data) => request('/patients', { method: 'POST', body: JSON.stringify(data) }),
  update:            (id, data) => request(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete:            (id) => request(`/patients/${id}`, { method: 'DELETE' }),
  getStats:          () => request('/patients/stats'),
  addMedicalHistory: (id, data) => request(`/patients/${id}/medical-history`, { method: 'POST', body: JSON.stringify(data) }),
};

export const appointmentApi = {
  getAll:       (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/appointments${query ? `?${query}` : ''}`);
  },
  getById:      (id) => request(`/appointments/${id}`),
  getToday:     () => request('/appointments/today'),
  create:       (data) => request('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  update:       (id, data) => request(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStatus: (id, statusData) => request(`/appointments/${id}/status`, { method: 'PUT', body: JSON.stringify(statusData) }),
  cancel:       (id, reason) => request(`/appointments/${id}/cancel`, { method: 'PUT', body: JSON.stringify({ reason }) }),
};

export const vitalsApi = {
  getAll:      (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/vitals${query ? `?${query}` : ''}`);
  },
  getByPatient:(patientId) => request(`/vitals/patient/${patientId}`),
  getLatest:   (patientId) => request(`/vitals/patient/${patientId}/latest`),
  create:      (data) => request('/vitals', { method: 'POST', body: JSON.stringify(data) }),
};

export const prescriptionApi = {
  getAll:   (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/prescriptions${query ? `?${query}` : ''}`);
  },
  getById:  (id) => request(`/prescriptions/${id}`),
  create:   (data) => request('/prescriptions', { method: 'POST', body: JSON.stringify(data) }),
  update:   (id, data) => request(`/prescriptions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  dispense: (id) => request(`/prescriptions/${id}/dispense`, { method: 'PUT' }),
};

export const labApi = {
  getAll:       (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/lab-reports${query ? `?${query}` : ''}`);
  },
  getById:      (id) => request(`/lab-reports/${id}`),
  create:       (data) => request('/lab-reports', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, overallStatus) => request(`/lab-reports/${id}/status`, { method: 'PUT', body: JSON.stringify({ overallStatus }) }),
  complete:     (id, resultsData) => request(`/lab-reports/${id}/complete`, { method: 'PUT', body: JSON.stringify(resultsData) }),
};

export const medicineApi = {
  getAll:     (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/medicines${query ? `?${query}` : ''}`);
  },
  getById:    (id) => request(`/medicines/${id}`),
  getLowStock:() => request('/medicines/low-stock'),
  create:     (data) => request('/medicines', { method: 'POST', body: JSON.stringify(data) }),
  update:     (id, data) => request(`/medicines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  restock:    (id, data) => request(`/medicines/${id}/restock`, { method: 'POST', body: JSON.stringify(data) }),
  delete:     (id) => request(`/medicines/${id}`, { method: 'DELETE' }),
};

export const billingApi = {
  getAll:            (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/bills${query ? `?${query}` : ''}`);
  },
  getById:           (id) => request(`/bills/${id}`),
  getRevenueSummary: () => request('/bills/revenue-summary'),
  create:            (data) => request('/bills', { method: 'POST', body: JSON.stringify(data) }),
  recordPayment:     (id, paymentData) => request(`/bills/${id}/pay`, { method: 'PUT', body: JSON.stringify(paymentData) }),
};

export const dashboardApi = {
  getAdminStats:  () => request('/dashboard/admin'),
  getDoctorStats: (doctorId) => request(`/dashboard/doctor${doctorId ? `/${doctorId}` : ''}`),
};

export const auditApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/audit-logs${query ? `?${query}` : ''}`);
  },
};

export default {
  auth: authApi,
  patient: patientApi,
  appointment: appointmentApi,
  vitals: vitalsApi,
  prescription: prescriptionApi,
  lab: labApi,
  medicine: medicineApi,
  billing: billingApi,
  dashboard: dashboardApi,
  audit: auditApi,
};

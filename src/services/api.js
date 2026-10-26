import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Attach JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('recoverai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401s or network drops
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.warn('[API] Session authorization required or expired.');
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// Customer Endpoints
export const customersAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`)
};

// Invoice Endpoints
export const invoicesAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  importCsv: (invoices) => api.post('/invoices/import-csv', { invoices }),
  recordPayment: (id, data) => api.post(`/invoices/${id}/payments`, data),
  getPayments: (id) => api.get(`/invoices/${id}/payments`)
};

// Follow-up Endpoints
export const followUpsAPI = {
  getAll: (params) => api.get('/follow-ups', { params }),
  create: (data) => api.post('/follow-ups', data),
  update: (id, data) => api.put(`/follow-ups/${id}`, data),
  updateStatus: (id, data) => api.patch(`/follow-ups/${id}/status`, data)
};

// AI Endpoints
export const aiAPI = {
  generateReminder: (data) => api.post('/ai/generate-reminder', data)
};

// Dashboard and Reports Endpoints
export const reportsAPI = {
  getSummary: () => api.get('/dashboard/summary'),
  getTrend: () => api.get('/dashboard/collection-trend'),
  getReceivablesReport: () => api.get('/reports/receivables'),
  getActivities: (params) => api.get('/activities', { params })
};

// Health Check
export const checkApiHealth = async () => {
  try {
    const res = await api.get('/health');
    return res.data?.status === 'ok';
  } catch (err) {
    return false;
  }
};

export default api;

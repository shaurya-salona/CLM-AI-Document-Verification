import axios from 'axios';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://127.0.0.1:8000' : 'https://clm-ai-document-verification.onrender.com');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authAPI = {
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  login: async (email, password) => {
    const res = await api.post('/login', { email, password });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  getApprovers: async (location) => {
    const res = await api.get('/auth/approvers', { params: { location } });
    return res.data;
  }
};

export const vendorAPI = {
  createRequest: async (formData) => {
    const res = await api.post('/vendor/create-request', formData);
    return res.data;
  },
  uploadDocuments: async (requestId, files) => {
    const data = new FormData();
    data.append('request_id', requestId);
    if (files.work_order) data.append('work_order', files.work_order);
    if (files.registration) data.append('registration', files.registration);
    if (files.pf) data.append('pf', files.pf);
    if (files.esi) data.append('esi', files.esi);

    const res = await api.post('/vendor/upload', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  getStatus: async () => {
    const res = await api.get('/vendor/status');
    return res.data;
  }
};

export const approverAPI = {
  getRequests: async (statusFilter) => {
    const res = await api.get('/approver/requests', { params: { status_filter: statusFilter } });
    return res.data;
  },
  getRequestById: async (id) => {
    const res = await api.get(`/approver/request/${id}`);
    return res.data;
  },
  approveRequest: async (requestId, remarks) => {
    const res = await api.post('/approver/approve', { request_id: requestId, remarks });
    return res.data;
  },
  rejectRequest: async (requestId, remarks) => {
    const res = await api.post('/approver/reject', { request_id: requestId, remarks });
    return res.data;
  }
};

export const aiAPI = {
  generateRemarks: async (requestId) => {
    const res = await api.post('/ai/generate-remarks', { request_id: requestId });
    return res.data;
  }
};

export default api;

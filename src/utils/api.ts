import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const queryAPI = {
  getAllQueries: (filters?: { status?: string; queryType?: string; user_id?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.queryType) params.append('queryType', filters.queryType);
    if (filters?.user_id) params.append('user_id', filters.user_id);
    
    return api.get(`/all-queries?${params.toString()}`);
  },
  getUserQueries: (userId: string, status?: string) => {
    const params = new URLSearchParams({ user_id: userId });
    if (status) params.append('status', status);
    return api.get(`/user/queries?${params.toString()}`);
  },
  getQueryById: (queryId: string) => api.get(`/query/${queryId}`),
  addQuery: (queryData: { query_type_id: number; title: string; description: string; userId: string }) =>
  api.post('/query', queryData),

  updateQueryStatus: (queryId: string, status: string, assignee_name?: string) => 
    api.put(`/query/${queryId}/status`, { status, assignee_name }),
  assignSpecialist: (queryId: string, specialist_id: string) => 
    api.put(`/query/${queryId}/assign`, { specialist_id }),
  getQueryTypes: () => api.get('/query-types'),
};

export const userAPI = {
  getUsers: () => api.get('/users'),
  createUser: (userData: { name: string; email: string; password: string; role_id: number }) => 
    api.post('/admin/users', userData),
  updateUser: (id: string, userData: { name: string; email: string; password?: string; role_id: number }) => 
    api.put(`/admin/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getRoles: () => api.get('/roles'),
};

export const specialistAPI = {
  getSpecialists: () => api.get('/specialists'),
  getSpecialistQueries: (specialistName: string, status?: string) => {
    const params = status ? `?status=${status}` : '';
    return api.get(`/specialist/${encodeURIComponent(specialistName)}/queries${params}`);
  },
};

export default api;
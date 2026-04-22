import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (username, password) => 
    api.post('/login', { username, password }),
};

export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (product) => api.post('/products', product),
  update: (id, product) => api.put(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`),
  uploadImage: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/products/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateImage: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.put(`/products/${id}/update-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (category) => api.post('/categories', category),
  update: (id, category) => api.put(`/categories/${id}`, category),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const manufacturersAPI = {
  getAll: () => api.get('/manufacturers'),
  create: (manufacturer) => api.post('/manufacturers', manufacturer),
  update: (id, manufacturer) => api.put(`/manufacturers/${id}`, manufacturer),
  delete: (id) => api.delete(`/manufacturers/${id}`),
};

export const shopsAPI = {
  getAll: () => api.get('/shops'),
  create: (shop) => api.post('/shops', shop),
  update: (id, shop) => api.put(`/shops/${id}`, shop),
  delete: (id) => api.delete(`/shops/${id}`),
};

export const companiesAPI = {
  getAll: () => api.get('/companies'),
  create: (company) => api.post('/companies', company),
  update: (id, company) => api.put(`/companies/${id}`, company),
  delete: (id) => api.delete(`/companies/${id}`),
};

export const workersAPI = {
  getAll: () => api.get('/workers'),
  create: (worker) => api.post('/workers', worker),
  update: (id, worker) => api.put(`/workers/${id}`, worker),
  delete: (id) => api.delete(`/workers/${id}`),
};

export const postsAPI = {
  getAll: () => api.get('/posts'),
  create: (post) => api.post('/posts', post),
  update: (id, post) => api.put(`/posts/${id}`, post),
  delete: (id) => api.delete(`/posts/${id}`),
};

export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (order) => api.post('/orders', order),
  update: (id, order) => api.put(`/orders/${id}`, order),
  delete: (id) => api.delete(`/orders/${id}`),
};

export default api;

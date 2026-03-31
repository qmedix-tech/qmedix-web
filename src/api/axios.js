import axios from 'axios';

const API = axios.create({
  baseURL: 'https://qmedix-backend.onrender.com',
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('id_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized or 403 Forbidden by redirecting to login
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (!error.config.url.includes('/auth/login')) {
        localStorage.clear();
        window.location.href = '/get-started';
      }
    }
    return Promise.reject(error);
  }
);

export default API;

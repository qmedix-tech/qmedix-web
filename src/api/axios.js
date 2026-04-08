import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Prevent infinite refresh loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized or 403 Forbidden
    if (error.response?.status === 401 || error.response?.status === 403) {
      
      // If it's the login itself that threw 401, reject immediately
      if (originalRequest.url?.includes('/auth/login')) {
         return Promise.reject(error);
      }

      // If the refresh token API itself failed to authorize, log out user
      if (originalRequest.url?.includes('/auth/refresh')) {
         localStorage.clear();
         window.location.href = '/get-started';
         return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
         localStorage.clear();
         window.location.href = '/get-started';
         return Promise.reject(error);
      }
      
      if (!originalRequest._retry) {
         if (isRefreshing) {
            return new Promise(function(resolve, reject) {
               failedQueue.push({ resolve, reject });
            }).then(token => {
               originalRequest.headers.Authorization = `Bearer ${token}`;
               return API(originalRequest);
            }).catch(err => Promise.reject(err));
         }

         originalRequest._retry = true;
         isRefreshing = true;

         try {
            // Attempt to refresh token via the raw axios instance to avoid interceptor loop
            const { data } = await axios.post(`${API.defaults.baseURL}/auth/refresh`, {
               refresh_token: refreshToken
            });
            
            const newAccessToken = data.access_token;
            // Endpoint returns new access & refresh tokens
            const newRefreshToken = data.refresh_token; 

            localStorage.setItem('access_token', newAccessToken);
            if (newRefreshToken) {
               localStorage.setItem('refresh_token', newRefreshToken);
            }

            API.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            
            processQueue(null, newAccessToken);
            return API(originalRequest);
            
         } catch (refreshError) {
            processQueue(refreshError, null);
            localStorage.clear();
            window.location.href = '/get-started';
            return Promise.reject(refreshError);
         } finally {
            isRefreshing = false;
         }
      }
    }
    
    return Promise.reject(error);
  }
);

export default API;

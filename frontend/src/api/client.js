import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return '/api';
};

const client = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if present
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('leaddesk_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 unauthorized gracefully
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid token if request to authenticated endpoint failed
      localStorage.removeItem('leaddesk_token');
    }
    return Promise.reject(error);
  }
);

export default client;

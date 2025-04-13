import axios from 'axios';

// Create an axios instance with default config
export const axiosClient = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication if needed
axiosClient.interceptors.request.use(
  (config) => {
    // You could add auth token here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases here
    if (error.response) {
      // Server responded with an error status
      console.error('API Error Response:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response
      console.error('API No Response:', error.request);
    } else {
      // Something else caused the error
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);
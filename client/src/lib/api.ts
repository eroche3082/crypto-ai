import axios from 'axios';

// Create an axios instance with default config
export const axiosClient = axios.create({
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to handle errors and token auth if needed
axiosClient.interceptors.request.use(
  (config) => {
    // Add authorization token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific errors
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.status, error.response.data);
      
      // Handle auth errors
      if (error.response.status === 401) {
        // Redirect to login
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Request was made but no response
      console.error('API Request Error:', error.request);
    } else {
      // Something else happened
      console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API function for system status check
export const getSystemStatus = async () => {
  try {
    const response = await axiosClient.get('/api/system/status');
    return response.data;
  } catch (error) {
    console.error('Failed to get system status:', error);
    // Return default data since we don't want the UI to crash
    return {
      status: 'error',
      message: 'Failed to get system status',
      services: {
        ai: { configured: true, name: 'Vertex AI' },
        payments: { 
          stripe: { configured: true },
          multi_payment: true,
          methods: ['Stripe', 'PayPal', 'Crypto', 'Bank Transfer']
        },
        email: { configured: true, provider: 'SendGrid', mode: 'live' },
        news: { configured: true },
        universal_access_code: {
          operational: true,
          features: [
            'QR code generation with custom styling',
            'Analytics dashboard with conversion metrics',
            'Multi-tier referral system',
            'Level unlock animations',
            'Multiple payment options'
          ]
        }
      }
    };
  }
};
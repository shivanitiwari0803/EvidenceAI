import axios from 'axios';
import { API_URL } from '../config/apiConfig.js';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60-second request timeout for AI LLM pipelines
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    let message = error.response?.data?.message ||
                  (Array.isArray(error.response?.data?.errors) && error.response.data.errors.join(', ')) ||
                  error.response?.data?.error ||
                  error.message ||
                  'Backend Error';

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      message = 'Request timed out after 60 seconds. The AI engine took longer than expected to process your request.';
    } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      message = 'Backend server is currently unreachable. Please check if the Render instance is active.';
    }

    const customError = {
      message,
      status: error.response?.status || (error.code === 'ECONNABORTED' ? 504 : 500),
      data: error.response?.data || null,
      stack: error.response?.data?.stack || error.stack || null,
      errors: error.response?.data?.errors || []
    };
    return Promise.reject(customError);
  }
);

export default api;

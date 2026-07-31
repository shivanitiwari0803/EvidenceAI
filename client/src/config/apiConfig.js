/**
 * Centralized API Configuration for Production Vercel & Render Deployment.
 * Reads VITE_API_URL environment variable.
 */
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000'
).replace(/\/+$/, '');

export const API_URL = API_BASE_URL.endsWith('/api')
  ? API_BASE_URL
  : `${API_BASE_URL}/api`;

export default API_BASE_URL;

import axios from 'axios';
import { getCookie } from 'cookies-next';

// Instancia base para rutas SIN /api
export const baseAxios = axios.create({
  baseURL: 'http://127.0.0.1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Instancia principal para rutas CON /api
const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar tokens
axiosInstance.interceptors.request.use((config) => {
  // Agregar el token de autenticación Bearer
  const authToken = getCookie('auth_token');
  if (authToken) {
    config.headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  // Extraer el XSRF token de las cookies
  const xsrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
  
  if (xsrfToken) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
  }
  
  return config;
});

// Interceptor de respuesta
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Sesión expirada o no autorizado');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
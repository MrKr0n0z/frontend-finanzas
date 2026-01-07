import axios from 'axios';
import { getCookie } from 'cookies-next';

// Crear instancia de Axios configurada
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor de solicitud: inyectar token si existe
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getCookie('auth_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta: manejo de errores global (opcional)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Aquí puedes manejar errores globales, por ejemplo:
    // - 401: redirigir a login
    // - 403: mostrar error de permisos
    // - 500: mostrar error del servidor
    
    if (error.response?.status === 401) {
      // Token expirado o no autorizado
      // Podrías limpiar cookies y redirigir a login
      console.error('No autorizado - Token inválido o expirado');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

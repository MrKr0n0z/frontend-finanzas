import axiosInstance, { baseAxios } from '@/lib/axios';
import type { AuthResponse, LoginCredentials, User, ApiResponse } from '@/types';
import { setCookie, deleteCookie } from 'cookies-next';

/**
 * Servicio de autenticación
 */
class AuthService {
  /**
   * Iniciar sesión
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const credentials: LoginCredentials = { email, password };
    
    // Obtener CSRF cookie
    await baseAxios.get('/sanctum/csrf-cookie');
    
    // Login
    const response = await axiosInstance.post('/login', credentials);
    
    // La respuesta viene directamente en response.data
    // Estructura: { message, user, access_token, token_type }
    return {
      user: response.data.user,
      token: response.data.access_token
    };
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      deleteCookie('auth_token');
    }
  }

  /**
   * Obtener usuario autenticado
   */
  async getMe(): Promise<User> {
    const response = await axiosInstance.get('/me');
    return response.data.data || response.data.user || response.data;
  }

  /**
   * Registrar nuevo usuario
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    address?: string;
    city?: string;
    phone?: string;
  }): Promise<AuthResponse> {
    const response = await axiosInstance.post('/register', data);
    
    return {
      user: response.data.user,
      token: response.data.access_token
    };
  }

  /**
   * Solicitar restablecimiento de contraseña
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await axiosInstance.post('/forgot-password', { email });
    return response.data;
  }

  /**
   * Restablecer contraseña
   */
  async resetPassword(data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string }> {
    const response = await axiosInstance.post('/reset-password', data);
    return response.data;
  }
}

// Exportar instancia única
export const authService = new AuthService();
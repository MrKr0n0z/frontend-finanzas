import axiosInstance from '@/lib/axios';
import type { AuthResponse, LoginCredentials, User, ApiResponse } from '@/types';
import { setCookie, deleteCookie } from 'cookies-next';

/**
 * Servicio de autenticación
 */
class AuthService {
  /**
   * Iniciar sesión
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Datos de autenticación con usuario y token
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const credentials: LoginCredentials = { email, password };
    
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      '/login',
      credentials
    );
    
    // Guardar token en cookie
    if (response.data.data.token) {
      setCookie('auth_token', response.data.data.token, {
        maxAge: 60 * 60 * 24 * 7, // 7 días
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }
    
    return response.data.data;
  }

  /**
   * Cerrar sesión
   * @returns Respuesta de logout
   */
  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar token siempre, incluso si falla la petición
      deleteCookie('auth_token');
    }
  }

  /**
   * Obtener datos del usuario autenticado
   * @returns Usuario actual
   */
  async getMe(): Promise<User> {
    const response = await axiosInstance.get<ApiResponse<User>>('/me');
    return response.data.data;
  }

  /**
   * Registrar nuevo usuario
   * @param data - Datos del nuevo usuario
   * @returns Datos de autenticación
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
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      '/register',
      data
    );
    
    // Guardar token en cookie
    if (response.data.data.token) {
      setCookie('auth_token', response.data.data.token, {
        maxAge: 60 * 60 * 24 * 7, // 7 días
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }
    
    return response.data.data;
  }

  /**
   * Solicitar restablecimiento de contraseña
   * @param email - Email del usuario
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<ApiResponse<{ message: string }>>(
      '/forgot-password',
      { email }
    );
    return response.data.data;
  }

  /**
   * Restablecer contraseña
   * @param data - Datos para restablecer contraseña
   */
  async resetPassword(data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string }> {
    const response = await axiosInstance.post<ApiResponse<{ message: string }>>(
      '/reset-password',
      data
    );
    return response.data.data;
  }
}

// Exportar instancia única
export const authService = new AuthService();

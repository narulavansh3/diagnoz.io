import { api } from './api';

export interface User {
  id: string;
  email: string;
  role: 'CENTER' | 'RADIOLOGIST';
  name?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async verifyToken(token: string): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/verify', { token });
      return response;
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  },

  async signup(data: any): Promise<LoginResponse> {
    const endpoint = data.role === 'CENTER' ? '/center/signup' : '/radiologist/signup';
    try {
      const response = await api.post(endpoint, data);
      return response;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },
};
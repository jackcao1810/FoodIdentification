import api from './api';
import { API_ENDPOINTS } from './endpoints';

export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  heightCm?: number;
  weightKg?: number;
  targetCalories: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>(API_ENDPOINTS.AUTH.PROFILE);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<User>(API_ENDPOINTS.AUTH.PROFILE, data);
    return response.data;
  },
};

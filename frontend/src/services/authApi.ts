import { api } from './apiClient';
import { ApiSuccess, AuthResponse, LoginPayload, RegisterPayload, User, UpdateProfileInput, ChangePasswordInput } from '@/types/auth';

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<ApiSuccess<AuthResponse>>('/auth/register', payload);
    return data.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<ApiSuccess<AuthResponse>>('/auth/login', payload);
    return data.data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<ApiSuccess<User>>('/auth/me');
    return data.data;
  },

  async updateProfile(payload: UpdateProfileInput): Promise<User> {
    const { data } = await api.put<ApiSuccess<User>>('/auth/profile', payload);
    return data.data;
  },

  async changePassword(payload: ChangePasswordInput): Promise<void> {
    await api.put('/auth/password', payload);
  },
};

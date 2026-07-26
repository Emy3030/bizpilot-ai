export interface User {
  id: string;
  businessName: string;
  name: string;
  email: string;
  role: 'OWNER' | 'STAFF';
  currency: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterPayload {
  businessName: string;
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  businessName?: string;
  name?: string;
  currency?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  details?: Array<{ field?: string; message: string }>;
}

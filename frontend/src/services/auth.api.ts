import { api } from './api';

// ==================== TYPES ====================

export interface AuthUser {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  phone_verified: boolean;
  role: 'player' | 'manager';
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  documentType?: string;
  documentNumber?: string;
  city?: string;
  district?: string;
}

export interface SocialLoginData {
  email: string;
  firstName: string;
  lastName: string;
  provider: 'google' | 'facebook';
  providerId: string;
  photoUrl?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  verified: boolean;
  user: AuthUser;
}

// ==================== API METHODS ====================

export const AuthApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>(
      '/auth/login',
      { email, password },
      { requiresAuth: false },
    ),

  register: (data: RegisterData) =>
    api.post<LoginResponse>('/auth/register', data, { requiresAuth: false }),

  socialLogin: (data: SocialLoginData) =>
    api.post<LoginResponse>('/auth/social', data, { requiresAuth: false }),

  sendOtp: (phone: string, countryCode: string) =>
    api.post<{ success: boolean; message: string; expiresIn: number }>(
      '/auth/send-otp',
      { phone, countryCode },
    ),

  verifyOtp: (phone: string, countryCode: string, code: string) =>
    api.post<VerifyOtpResponse>('/auth/verify-otp', { phone, countryCode, code }),

  getProfile: () => api.get<AuthUser>('/users/profile'),

  updatePhone: (phone: string) =>
    api.put<{ success: boolean; user: AuthUser }>('/users/phone', { phone }),

  promoteToManager: (businessName: string, ruc: string) =>
    api.post<{ success: boolean; user: AuthUser }>('/users/promote-to-manager', {
      businessName,
      ruc,
    }),
};

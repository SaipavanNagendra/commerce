import { api } from '../lib/axios';
import type {
  RegisterPayload,
  RegisterResponse,
  VerifyEmailPayload,
  AuthSuccessResponse,
  LoginPayload,
  ResendOtpPayload,
  OtpResponse,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  MessageResponse,
  LogoutResponse,
} from '../types/auth.types';

export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<RegisterResponse>('/auth/register', payload).then((res) => res.data),

  verifyEmail: (payload: VerifyEmailPayload) =>
    api.post<AuthSuccessResponse>('/auth/verify-email', payload).then((res) => res.data),

  login: (payload: LoginPayload) =>
    api.post<AuthSuccessResponse>('/auth/login', payload).then((res) => res.data),

  resendOtp: (payload: ResendOtpPayload) =>
    api.post<OtpResponse>('/auth/resend-otp', payload).then((res) => res.data),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    api.post<OtpResponse>('/auth/forgot-password', payload).then((res) => res.data),

  resetPassword: (payload: ResetPasswordPayload) =>
    api.post<MessageResponse>('/auth/reset-password', payload).then((res) => res.data),

  logout: () => api.post<LogoutResponse>('/auth/logout', {}).then((res) => res.data),

  refresh: () => api.post<MessageResponse>('/auth/refresh', {}).then((res) => res.data),
};

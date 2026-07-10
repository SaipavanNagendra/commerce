// Types mirror the CommerceEdge backend API spec exactly.
// Keep field names identical to the JSON the backend sends/expects.

export type ClassLevel = 'CLASS_11' | 'CLASS_12';
export type OtpPurpose = 'REGISTER' | 'FORGOT_PASSWORD';
export type UserRole = 'STUDENT' | string;

export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  avatarPath: string | null;
  classLevel: ClassLevel;
  state: string;
  city: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profile: Profile;
}

export interface Session {
  id: string;
  userId: string;
  deviceInfo: string;
  browser: string;
  os: string;
  ip: string;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
}

// ---------- Request payloads ----------

export interface RegisterPayload {
  email: string;
  password: string;
  phone?: string;
  firstName: string;
  lastName: string;
  classLevel: ClassLevel;
  state: string;
  city: string;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ResendOtpPayload {
  email: string;
  purpose: OtpPurpose;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  password: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  classLevel?: ClassLevel;
  state?: string;
  city?: string;
}

// ---------- Response payloads ----------

export interface RegisterResponse {
  message: string;
  otp: string; // only returned for local/testing per docs
}

export interface AuthSuccessResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface MessageResponse {
  message: string;
}

export interface OtpResponse {
  message: string;
  otp: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: User;
}

export interface AvatarUploadResponse {
  message: string;
  avatarPath: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface RevokeSessionResponse {
  success: boolean;
  message: string;
}

// ---------- Error shape ----------
// The backend always returns this shape on 4xx/5xx errors.
// `message` is either a single string or an array of validation strings.
export interface ApiErrorResponse {
  message: string | string[];
  error: string;
  statusCode: number;
}

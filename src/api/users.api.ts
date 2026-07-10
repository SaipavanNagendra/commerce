import { api } from '../lib/axios';
import type {
  User,
  UpdateProfilePayload,
  UpdateProfileResponse,
  AvatarUploadResponse,
  Session,
  RevokeSessionResponse,
} from '../types/auth.types';

export const usersApi = {
  getProfile: () => api.get<User>('/users/me', { params: { _t: Date.now() } }).then((res) => res.data),

  updateProfile: (payload: UpdateProfilePayload) =>
    api.patch<UpdateProfileResponse>('/users/me', payload).then((res) => res.data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    // Key name MUST be "avatarPath" — that's what the backend's
    // multipart parser is configured to look for.
    formData.append('avatarPath', file);

    return api
      .post<AvatarUploadResponse>('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },

  getSessions: () => api.get<Session[]>('/users/me/sessions').then((res) => res.data),

  revokeSession: (sessionId: string) =>
    api
      .delete<RevokeSessionResponse>(`/users/me/sessions/${sessionId}`)
      .then((res) => res.data),
};

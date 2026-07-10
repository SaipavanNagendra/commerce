import { api } from '../lib/axios';
import type {
  Notification,
  NotificationsListResponse,
  SendNotificationPayload,
} from '../types/entities.types';

export const notificationsApi = {
  list: (params?: { skip?: number; take?: number }) =>
    api.get<NotificationsListResponse>('/notifications', { params }).then((res) => res.data),

  markAllRead: () =>
    api.patch<{ count: number }>('/notifications/read-all', {}).then((res) => res.data),

  markRead: (id: string) =>
    api.patch<Notification>(`/notifications/${id}/read`, {}).then((res) => res.data),

  // Admin-only broadcast
  adminSend: (payload: SendNotificationPayload) =>
    api.post<Notification>('/notifications/admin/send', payload).then((res) => res.data),
};

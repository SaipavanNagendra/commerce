import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications.api';
import type { SendNotificationPayload } from '../types/entities.types';

const notificationsKey = ['notifications'] as const;

export function useNotifications(params?: { skip?: number; take?: number }) {
  return useQuery({
    queryKey: [...notificationsKey, params],
    queryFn: () => notificationsApi.list(params),
    refetchInterval: 30_000,
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKey });
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKey });
    },
  });
}

export function useSendNotification() {
  return useMutation({
    mutationFn: (payload: SendNotificationPayload) => notificationsApi.adminSend(payload),
  });
}

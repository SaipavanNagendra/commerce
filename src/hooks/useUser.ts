import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users.api';
import { authKeys } from './useAuth';
import type { UpdateProfilePayload } from '../types/auth.types';

// Central "am I logged in" query. 401 is expected when logged out,
// so we don't treat it as a query error worth retrying.
export function useProfile() {
  return useQuery({
    queryKey: authKeys.profile,
    queryFn: () => usersApi.getProfile(),
    // Being logged out is a normal state, not a transient failure —
    // don't retry at all here. Retrying a failing /users/me call is
    // what caused the refresh-loop glitch.
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => usersApi.updateProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.profile, data.user);
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(file),
    onSuccess: () => {
      // Avatar path lives on the profile; simplest correct approach
      // is to refetch rather than hand-merge the nested shape.
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
    },
  });
}

export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: () => usersApi.getSessions(),
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => usersApi.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

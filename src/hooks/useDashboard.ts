import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export function useStudentDashboard(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['studentDashboard'],
    queryFn: () => dashboardApi.student(),
    enabled: options?.enabled ?? true,
  });
}

export function useSchoolAdminDashboard(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['schoolAdminDashboard'],
    queryFn: () => dashboardApi.school(),
    enabled: options?.enabled ?? true,
  });
}

export function useAdminDashboard(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => dashboardApi.admin(),
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // backend caches this for 10 minutes server-side
  });
}

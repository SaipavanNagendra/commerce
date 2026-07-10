import { api } from '../lib/axios';
import type {
  StudentDashboardStats,
  SchoolDashboardStats,
  AdminDashboardStats,
} from '../types/entities.types';

export const dashboardApi = {
  student: () => api.get<StudentDashboardStats>('/dashboard/student').then((res) => res.data),

  school: () => api.get<SchoolDashboardStats>('/dashboard/school').then((res) => res.data),

  admin: () => api.get<AdminDashboardStats>('/dashboard/admin').then((res) => res.data),
};

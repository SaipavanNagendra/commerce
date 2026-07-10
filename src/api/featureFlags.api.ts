import { api } from '../lib/axios';
import type {
  FeatureFlag,
  CreateFeatureFlagPayload,
  UpdateFeatureFlagPayload,
} from '../types/entities.types';

export const featureFlagsApi = {
  list: () => api.get<FeatureFlag[]>('/admin/feature-flags').then((res) => res.data),

  get: (name: string) =>
    api.get<{ name: string; enabled: boolean }>(`/admin/feature-flags/${name}`).then((res) => res.data),

  create: (payload: CreateFeatureFlagPayload) =>
    api.post<FeatureFlag>('/admin/feature-flags', payload).then((res) => res.data),

  update: (name: string, payload: UpdateFeatureFlagPayload) =>
    api.patch<FeatureFlag>(`/admin/feature-flags/${name}`, payload).then((res) => res.data),
};

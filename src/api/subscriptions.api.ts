import { api } from '../lib/axios';
import type { SubscriptionPlan, Subscription, SubscribePayload } from '../types/entities.types';

export const subscriptionsApi = {
  plans: () => api.get<SubscriptionPlan[]>('/subscriptions/plans').then((res) => res.data),

  my: () => api.get<Subscription | null>('/subscriptions/my').then((res) => res.data),

  subscribe: (payload: SubscribePayload) =>
    api.post<Subscription>('/subscriptions/subscribe', payload).then((res) => res.data),
};

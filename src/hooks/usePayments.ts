import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsApi, generateIdempotencyKey } from '../api/payments.api';
import { subscriptionsApi } from '../api/subscriptions.api';
import { certificatesApi } from '../api/certificates.api';
import type { CreateOrderPayload, VerifyPaymentPayload, SubscribePayload } from '../types/entities.types';

// ========== PAYMENTS ==========
export function useCreatePaymentOrder() {
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      paymentsApi.createOrder(payload, generateIdempotencyKey()),
  });
}

export function useVerifyPayment() {
  return useMutation({
    mutationFn: (payload: VerifyPaymentPayload) => paymentsApi.verify(payload),
  });
}

// ========== SUBSCRIPTIONS ==========
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: () => subscriptionsApi.plans(),
  });
}

export function useMySubscription() {
  return useQuery({
    queryKey: ['mySubscription'],
    queryFn: () => subscriptionsApi.my(),
  });
}

export function useSubscribe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubscribePayload) => subscriptionsApi.subscribe(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySubscription'] });
      queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
    },
  });
}

// ========== CERTIFICATES ==========
export function useMyCertificates() {
  return useQuery({
    queryKey: ['certificates'],
    queryFn: () => certificatesApi.list(),
  });
}

export function useRequestCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (olympiadId: string) => certificatesApi.request(olympiadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
}

export function useDownloadCertificate() {
  return useMutation({
    mutationFn: (id: string) => certificatesApi.download(id),
  });
}

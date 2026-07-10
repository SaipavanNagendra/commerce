import { api } from '../lib/axios';
import type {
  CreateOrderPayload,
  CreateOrderResponse,
  VerifyPaymentPayload,
  VerifyPaymentResponse,
} from '../types/entities.types';

// Generates a v4 UUID for the mandatory `idempotency-key` header, so a
// dropped network response never results in a double-charge if the
// request is retried.
export function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const paymentsApi = {
  createOrder: (payload: CreateOrderPayload, idempotencyKey: string) =>
    api
      .post<CreateOrderResponse>('/payments/create-order', payload, {
        headers: { 'idempotency-key': idempotencyKey },
      })
      .then((res) => res.data),

  verify: (payload: VerifyPaymentPayload) =>
    api.post<VerifyPaymentResponse>('/payments/verify', payload).then((res) => res.data),
};

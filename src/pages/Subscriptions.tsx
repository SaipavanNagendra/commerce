import { useState } from 'react';
import { SiteHeader } from '../components/layout/SiteHeader';
import { StudentSidebar } from '../components/layout/StudentSidebar';
import { useMySubscription, useSubscribe, useSubscriptionPlans } from '../hooks/usePayments';
import { useCreatePaymentOrder, useVerifyPayment } from '../hooks/usePayments';
import { getApiErrorMessage } from '../lib/axios';

export function Subscriptions() {
  const { data: plans, isLoading } = useSubscriptionPlans();
  const { data: mySub } = useMySubscription();
  const createOrder = useCreatePaymentOrder();
  const verifyPayment = useVerifyPayment();
  const subscribe = useSubscribe();

  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe(planId: string, price: number) {
    setPurchasingId(planId);
    setError(null);
    try {
      const order = await createOrder.mutateAsync({ amount: price, purpose: 'SUBSCRIPTION' });
      const verified = await verifyPayment.mutateAsync({
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: `pay_${order.razorpayOrderId}`,
        razorpaySignature: 'demo-signature',
      });
      if (verified.success) {
        await subscribe.mutateAsync({ planId, paymentId: order.razorpayOrderId });
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not complete the purchase. Please try again.'));
    } finally {
      setPurchasingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex gap-8">
          <StudentSidebar />

          <div className="min-w-0 flex-1 space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Premium Plans</h1>
              <p className="mt-1 text-sm text-slate-600">
                Unlock full syllabus content, unlimited mock tests, and advanced analytics.
              </p>
            </div>

            {mySub?.isActive && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                <p className="text-sm font-bold text-blue-800">
                  Active plan: {mySub.plan}
                </p>
                <p className="mt-1 text-xs text-blue-700">
                  Valid until {new Date(mySub.expiresAt).toLocaleDateString('en-IN')}
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {isLoading && (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
                Loading plans…
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {(plans ?? []).map((plan, idx) => (
                <div
                  key={plan.id}
                  className={`flex flex-col rounded-2xl border p-6 shadow-sm ${
                    idx === 1 ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200 bg-white'
                  }`}
                >
                  {idx === 1 && (
                    <span className="mb-3 inline-block w-fit rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                      MOST POPULAR
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <p className="mt-3">
                    <span className="text-3xl font-bold text-slate-900">₹{plan.price}</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{plan.durationDays} days access</p>
                  <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-600">
                    <li>✓ Full syllabus video lessons</li>
                    <li>✓ Unlimited mock tests</li>
                    <li>✓ National Olympiad eligibility</li>
                    <li>✓ Performance analytics</li>
                  </ul>
                  <button
                    onClick={() => handleSubscribe(plan.id, plan.price)}
                    disabled={purchasingId === plan.id || mySub?.plan === plan.id}
                    className={`mt-6 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
                      idx === 1
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {mySub?.plan === plan.id
                      ? 'Current Plan'
                      : purchasingId === plan.id
                      ? 'Processing…'
                      : 'Choose Plan'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

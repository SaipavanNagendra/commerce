import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SiteHeader } from '../components/layout/SiteHeader';
import { useAuthContext } from '../context/AuthContext';
import {
  useOlympiad,
  useOlympiadLeaderboard,
  useOlympiadMyResult,
  useRegisterOlympiad,
} from '../hooks/useEntities';
import { useCreatePaymentOrder, useVerifyPayment } from '../hooks/usePayments';
import { getApiErrorMessage } from '../lib/axios';
import { resolveAvatarUrl, initials } from '../lib/format';

export function OlympiadDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthContext();
  const { data: olympiad, isLoading } = useOlympiad(id ?? '');
  const { data: leaderboard } = useOlympiadLeaderboard(id ?? '');
  const { data: myResult } = useOlympiadMyResult(id ?? '');
  const register = useRegisterOlympiad(id ?? '');
  const createOrder = useCreatePaymentOrder();
  const verifyPayment = useVerifyPayment();

  const [status, setStatus] = useState<'idle' | 'processing' | 'registered' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    if (!id || !olympiad) return;
    setStatus('processing');
    setError(null);
    try {
      // 1. Create a Razorpay order for the registration fee
      const order = await createOrder.mutateAsync({
        amount: olympiad.registrationFee,
        purpose: 'OLYMPIAD_REGISTRATION',
      });

      // 2. In production this hands off to the Razorpay Checkout widget.
      // The docs note POST /payments/create-order currently reads
      // req.user.id (undefined) instead of req.user.sub, so this call
      // may fail server-side until that JWT-strategy mapping is patched —
      // surfaced here as a normal error rather than crashing the UI.
      // Simulate the widget's success callback for this demo flow:
      await verifyPayment.mutateAsync({
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: `pay_${order.razorpayOrderId}`,
        razorpaySignature: 'demo-signature',
      });

      // 3. Confirm the Olympiad registration itself
      await register.mutateAsync({});
      setStatus('registered');
    } catch (err) {
      setStatus('error');
      setError(getApiErrorMessage(err, 'Registration failed. Please try again.'));
    }
  }

  if (isLoading || !olympiad) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SiteHeader />
        <div className="mx-auto max-w-[1600px] px-6 py-16 text-center text-sm text-slate-500">
          Loading olympiad details…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-[1600px] px-6 py-8 space-y-8">
        <p className="text-sm text-slate-500">
          <Link to="/olympiads" className="hover:text-slate-800">Olympiads</Link>
          <span className="mx-1.5">›</span>
          <span className="font-medium text-slate-800">{olympiad.title}</span>
        </p>

        <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-white shadow-sm">
          <span className="inline-block rounded-md bg-white/20 px-2 py-0.5 text-xs font-semibold">
            {olympiad.status.replace('_', ' ')}
          </span>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{olympiad.title}</h1>
          <p className="mt-2 text-sm text-amber-50">
            Exam Date:{' '}
            {new Date(olympiad.examDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="text-2xl font-bold">₹{olympiad.registrationFee}</span>

            {!isAuthenticated ? (
              <Link
                to="/login"
                className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50"
              >
                Log in to Register
              </Link>
            ) : myResult ? (
              <span className="rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold">
                ✓ Result declared — Rank #{myResult.nationalRank}
              </span>
            ) : status === 'registered' ? (
              <span className="rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold">
                ✓ Registration submitted
              </span>
            ) : (
              <button
                onClick={handleRegister}
                disabled={status === 'processing' || olympiad.status !== 'REGISTRATION_OPEN'}
                className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 disabled:opacity-60"
              >
                {status === 'processing'
                  ? 'Processing payment…'
                  : olympiad.status === 'REGISTRATION_OPEN'
                  ? 'Register Now'
                  : 'Registration Closed'}
              </button>
            )}
          </div>
          {error && (
            <p className="mt-3 rounded-lg bg-white/15 px-3 py-2 text-sm text-white">{error}</p>
          )}
        </div>

        {/* Leaderboard */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">🏆 National Leaderboard</h2>
          <p className="mt-1 text-xs text-slate-500">Refreshes automatically every 30 seconds.</p>

          <div className="mt-4 divide-y divide-slate-100">
            {(leaderboard ?? []).length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">
                Leaderboard will populate once results are declared.
              </p>
            )}
            {(leaderboard ?? []).slice(0, 20).map((entry) => {
              const avatarUrl = resolveAvatarUrl(entry.user?.profile.avatarPath);
              return (
                <div key={entry.id} className="flex items-center gap-4 py-3">
                  <span className="w-8 shrink-0 text-center text-sm font-bold text-slate-700">
                    #{entry.nationalRank}
                  </span>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initials(entry.user?.profile.firstName, entry.user?.profile.lastName)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {entry.user?.profile.firstName} {entry.user?.profile.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{entry.user?.profile.state}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{entry.score.toFixed(1)}</span>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

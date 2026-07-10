import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVerifyEmail, useResendOtp } from '../hooks/useAuth';
import { FormInput } from '../components/FormInput';
import { Button } from '../components/Button';
import { ErrorAlert } from '../components/ErrorAlert';
import { getApiErrorMessage, isApiErrorStatus } from '../lib/axios';

const RESEND_COOLDOWN_SECONDS = 60;

export function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = (location.state as { email?: string } | null)?.email ?? '';

  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendOtp();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (cooldown <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cooldown]);

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    try {
      await verifyMutation.mutateAsync({ email, otp });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Docs: 400 for wrong/expired OTP, 429 for lockout after 3 wrong attempts
      setError(getApiErrorMessage(err, 'Could not verify OTP. Please try again.'));
    }
  }

  async function handleResend() {
    setError(null);
    setInfo(null);
    try {
      const res = await resendMutation.mutateAsync({ email, purpose: 'REGISTER' });
      setDevOtp(res.otp ?? null);
      setInfo('A new OTP has been sent.');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      if (isApiErrorStatus(err, 429)) {
        // Backend message already says "wait N seconds" — surface it directly
        setError(getApiErrorMessage(err));
        setCooldown(RESEND_COOLDOWN_SECONDS);
      } else if (isApiErrorStatus(err, 409)) {
        setError('This email is already verified — try logging in instead.');
      } else {
        setError(getApiErrorMessage(err, 'Could not resend OTP.'));
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <h1 className="text-xl font-bold text-slate-900">Verify your email</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter the 6-digit code we sent to your email.
        </p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleVerify}>
          <ErrorAlert message={error} />
          {info && (
            <div className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-700">
              {info}
            </div>
          )}

          <FormInput
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {devOtp && (
            <button
              type="button"
              onClick={() => setOtp(devOtp)}
              className="w-full rounded-lg border border-dashed border-teal-300 bg-teal-50 px-3 py-2 text-left text-sm text-teal-700 hover:bg-teal-100"
            >
              <span className="block text-xs font-medium uppercase tracking-wide text-teal-500">
                Test OTP (dev only)
              </span>
              <span className="font-mono text-base font-semibold tracking-widest">{devOtp}</span>
              <span className="ml-2 text-xs text-teal-500">— tap to fill</span>
            </button>
          )}

          <FormInput
            label="OTP"
            name="otp"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            required
          />

          <Button type="submit" isLoading={verifyMutation.isPending}>
            Verify email
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={handleResend}
            isLoading={resendMutation.isPending}
            disabled={cooldown > 0 || !email}
          >
            {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
          </Button>
        </form>
      </div>
    </div>
  );
}

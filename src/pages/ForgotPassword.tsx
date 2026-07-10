import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForgotPassword, useResetPassword, useResendOtp } from '../hooks/useAuth';
import { FormInput } from '../components/FormInput';
import { PasswordInput } from '../components/PasswordInput';
import { Button } from '../components/Button';
import { ErrorAlert } from '../components/ErrorAlert';
import { OtpModal } from '../components/OtpModal';
import { getApiErrorMessage, isApiErrorStatus } from '../lib/axios';

const RESEND_COOLDOWN_SECONDS = 60;

export function ForgotPassword() {
  const navigate = useNavigate();
  const forgotPasswordMutation = useForgotPassword();
  const resetMutation = useResetPassword();
  const resendMutation = useResendOtp();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (cooldown <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setCooldown((p) => (p <= 1 ? 0 : p - 1)), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cooldown]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await forgotPasswordMutation.mutateAsync({ email });
      // Backend returns the OTP directly in the response for local testing.
      setDevOtp(res.otp ?? null);
      setNewPassword('');
      setOtpModalOpen(true);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send reset OTP.'));
    }
  }

  async function handleVerify(otp: string) {
    setOtpError(null);
    if (!newPassword) {
      setOtpError('Enter a new password.');
      return;
    }
    try {
      await resetMutation.mutateAsync({ email, otp, password: newPassword });
      setOtpModalOpen(false);
      navigate('/login', { replace: true });
    } catch (err) {
      setOtpError(getApiErrorMessage(err, 'Could not reset password. Check the OTP and try again.'));
    }
  }

  async function handleResend() {
    setOtpError(null);
    try {
      const res = await resendMutation.mutateAsync({ email, purpose: 'FORGOT_PASSWORD' });
      setDevOtp(res.otp ?? null);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      if (isApiErrorStatus(err, 429)) {
        setOtpError(getApiErrorMessage(err));
        setCooldown(RESEND_COOLDOWN_SECONDS);
      } else {
        setOtpError(getApiErrorMessage(err, 'Could not resend OTP.'));
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <h1 className="text-xl font-bold text-slate-900">Reset your password</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your registered email and we'll send you an OTP.
        </p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <ErrorAlert message={error} />

          <FormInput
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" isLoading={forgotPasswordMutation.isPending}>
            Send OTP
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Remembered it?{' '}
          <Link to="/login" className="font-medium text-teal-600 hover:underline">
            Back to login
          </Link>
        </p>
      </div>

      <OtpModal
        open={otpModalOpen}
        title="Reset your password"
        description="Enter the 6-digit code sent to"
        email={email}
        devOtp={devOtp}
        isSubmitting={resetMutation.isPending}
        error={otpError}
        onClose={() => setOtpModalOpen(false)}
        onSubmit={handleVerify}
        onResend={handleResend}
        isResending={resendMutation.isPending}
        resendCooldown={cooldown}
      >
        <PasswordInput
          label="New password"
          name="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
          maxLength={72}
        />
      </OtpModal>
    </div>
  );
}

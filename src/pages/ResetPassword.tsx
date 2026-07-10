import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useResetPassword, useResendOtp } from '../hooks/useAuth';
import { FormInput } from '../components/FormInput';
import { PasswordInput } from '../components/PasswordInput';
import { Button } from '../components/Button';
import { ErrorAlert } from '../components/ErrorAlert';
import { getApiErrorMessage } from '../lib/axios';

export function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = (location.state as { email?: string } | null)?.email ?? '';

  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetMutation = useResetPassword();
  const resendMutation = useResendOtp();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await resetMutation.mutateAsync({ email, otp, password });
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not reset password. Check the OTP and try again.'));
    }
  }

  async function handleResend() {
    setError(null);
    try {
      await resendMutation.mutateAsync({ email, purpose: 'FORGOT_PASSWORD' });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not resend OTP.'));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <h1 className="text-xl font-bold text-slate-900">Set a new password</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter the OTP sent to your email along with your new password.
        </p>

        {success ? (
          <div className="mt-6 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-700">
            Password reset successfully. Redirecting to login…
          </div>
        ) : (
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

            <FormInput
              label="OTP"
              name="otp"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              required
            />

            <PasswordInput
              label="New password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              maxLength={72}
            />

            <Button type="submit" isLoading={resetMutation.isPending}>
              Reset password
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={handleResend}
              isLoading={resendMutation.isPending}
              disabled={!email}
            >
              Resend OTP
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/login" className="font-medium text-teal-600 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister, useVerifyEmail, useResendOtp, useLogout } from '../hooks/useAuth';
import { FormInput } from '../components/FormInput';
import { PasswordInput } from '../components/PasswordInput';
import { Button } from '../components/Button';
import { ErrorAlert } from '../components/ErrorAlert';
import { OtpModal } from '../components/OtpModal';
import { getApiErrorMessage, isApiErrorStatus } from '../lib/axios';
import type { ClassLevel } from '../types/auth.types';

const RESEND_COOLDOWN_SECONDS = 60;

const STEPS = [
  { id: 1, label: 'Personal Info' },
  { id: 2, label: 'Academic Details' },
  { id: 3, label: 'Create Account' },
] as const;

const FEATURES = [
  { icon: ShieldIcon, label: 'SECURE\nPLATFORM' },
  { icon: CapIcon, label: 'EXPERT\nFACULTY' },
  { icon: ChartIcon, label: 'SKILL\nFOCUSED' },
  { icon: MedalIcon, label: 'TOP\nRESULTS' },
];

export function Register() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendOtp();
  const logoutMutation = useLogout();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
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

  const [form, setForm] = useState({
    email: '',
    password: '',
    phone: '',
    firstName: '',
    lastName: '',
    classLevel: 'CLASS_11' as ClassLevel,
    state: '',
    city: '',
  });

  function handleChange(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function validateStep(current: number): string | null {
    if (current === 1) {
      if (!form.firstName || !form.lastName) return 'Please fill in your first and last name.';
    }
    if (current === 2) {
      if (!form.state || !form.city) return 'Please fill in your state and city.';
    }
    return null;
  }

  function goNext() {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((s) => Math.min(3, s + 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await registerMutation.mutateAsync({
        ...form,
        phone: form.phone || undefined,
      });
      setDevOtp(res.otp ?? null);
      setOtpModalOpen(true);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed. Check the fields and try again.'));
    }
  }

  async function handleVerify(otp: string) {
    setOtpError(null);
    try {
      await verifyMutation.mutateAsync({ email: form.email, otp });
      await logoutMutation.mutateAsync();
      navigate('/login', { replace: true, state: { email: form.email } });
    } catch (err) {
      setOtpError(getApiErrorMessage(err, 'Could not verify OTP. Please try again.'));
    }
  }

  async function handleResend() {
    setOtpError(null);
    try {
      const res = await resendMutation.mutateAsync({ email: form.email, purpose: 'REGISTER' });
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
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/subjects" className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-600">
              <path
                d="M4 19V9m6 10V4m6 15v-7m6 7V11"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-lg font-bold text-blue-700">CommerceEdge</span>
          </Link>
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Login →
            </Link>
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Build Your Commerce Future</h1>
          <p className="mt-2 text-slate-600">
            Join India's premier learning ecosystem designed for Class 11 &amp; 12 Commerce excellence.
          </p>
        </div>

        <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Step tabs */}
          <div className="flex border-b border-slate-200">
            {STEPS.map((s, idx) => (
              <div
                key={s.id}
                className={`flex flex-1 items-center justify-center gap-2 py-4 text-sm font-medium ${
                  idx < STEPS.length - 1 ? 'border-r border-slate-100' : ''
                } ${step === s.id ? 'text-blue-600' : 'text-slate-400'}`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                    step >= s.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {s.id}
                </span>
                {s.label}
              </div>
            ))}
          </div>

          <form className="flex flex-col gap-6 p-8" onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}>
            <ErrorAlert message={error} />

            {step === 1 && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput
                    label="First Name"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange('firstName')}
                    placeholder="e.g. Rahul"
                    required
                    maxLength={50}
                  />
                  <FormInput
                    label="Last Name"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange('lastName')}
                    placeholder="e.g. Sharma"
                    required
                    maxLength={50}
                  />
                </div>
                <FormInput
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  placeholder="98765 43210"
                />
                <Button type="button" onClick={goNext} className="mt-2">
                  Continue →
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="classLevel" className="text-sm font-medium text-slate-700">
                    Class Level
                  </label>
                  <select
                    id="classLevel"
                    value={form.classLevel}
                    onChange={handleChange('classLevel')}
                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                  >
                    <option value="CLASS_11">Class 11</option>
                    <option value="CLASS_12">Class 12</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput
                    label="State / Province"
                    name="state"
                    value={form.state}
                    onChange={handleChange('state')}
                    placeholder="e.g. Telangana"
                    required
                    maxLength={50}
                  />
                  <FormInput
                    label="City"
                    name="city"
                    value={form.city}
                    onChange={handleChange('city')}
                    placeholder="e.g. Hyderabad"
                    required
                    maxLength={50}
                  />
                </div>
                <div className="mt-2 flex gap-3">
                  <Button type="button" variant="secondary" onClick={goBack}>
                    ← Back
                  </Button>
                  <Button type="button" onClick={goNext}>
                    Continue →
                  </Button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <FormInput
                  label="Academic Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder="name@email.com"
                  required
                  maxLength={100}
                />
                <div>
                  <PasswordInput
                    label="Secure Password"
                    name="password"
                    value={form.password}
                    onChange={handleChange('password')}
                    required
                    minLength={6}
                    maxLength={72}
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    Min. 12 characters with uppercase, lowercase, number, and special character.
                  </p>
                </div>
                <label className="flex items-start gap-2 text-xs text-slate-600">
                  <input type="checkbox" required className="mt-1 rounded border border-slate-300" />
                  <span>
                    I agree to the{' '}
                    <a href="#" className="text-blue-600 hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>{' '}
                    regarding my academic data processing.
                  </span>
                </label>
                <div className="mt-2 flex gap-3">
                  <Button type="button" variant="secondary" onClick={goBack}>
                    ← Back
                  </Button>
                  <Button type="submit" isLoading={registerMutation.isPending}>
                    Complete Registration
                  </Button>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Feature strip */}
        <div className="mt-10 grid w-full max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
          {FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 text-center">
              <Icon />
              <p className="whitespace-pre-line text-xs font-bold uppercase tracking-wide text-slate-700">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 px-6 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-slate-500">© 2026 CommerceEdge Education. All rights reserved.</p>
          <div className="flex gap-5 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-800">Help Center</a>
            <a href="#" className="hover:text-slate-800">Privacy</a>
            <a href="#" className="hover:text-slate-800">Terms</a>
          </div>
        </div>
      </footer>

      <OtpModal
        open={otpModalOpen}
        title="Verify your email"
        description="Enter the 6-digit code sent to"
        email={form.email}
        devOtp={devOtp}
        isSubmitting={verifyMutation.isPending}
        error={otpError}
        onClose={() => setOtpModalOpen(false)}
        onSubmit={handleVerify}
        onResend={handleResend}
        isResending={resendMutation.isPending}
        resendCooldown={cooldown}
      />
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-blue-600">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CapIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-blue-600">
      <path d="M12 3l10 5-10 5L2 8l10-5z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-blue-600">
      <path d="M4 19V9m6 10V4m6 15v-7m6 7V11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function MedalIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-blue-600">
      <circle cx="12" cy="15" r="6" />
      <path d="M9 3h6l-2 6.5h-2L9 3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Button } from './Button';
import { ErrorAlert } from './ErrorAlert';

interface OtpModalProps {
  open: boolean;
  title: string;
  description: string;
  email: string;
  /**
   * The backend returns the OTP directly in the response body for local
   * testing (see docs: "generate a 6-digit OTP ... return it in the
   * response"). If present, we show it so you don't have to dig through
   * email/logs while testing. Remove this prop once you wire up real
   * email delivery in production.
   */
  devOtp?: string | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (otp: string) => void;
  onResend: () => void;
  isResending: boolean;
  resendCooldown: number;
  /** Extra fields rendered below the OTP boxes, e.g. a new-password field. */
  children?: ReactNode;
}

const OTP_LENGTH = 6;

export function OtpModal({
  open,
  title,
  description,
  email,
  devOtp,
  isSubmitting,
  error,
  onClose,
  onSubmit,
  onResend,
  isResending,
  resendCooldown,
  children,
}: OtpModalProps) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Reset the boxes whenever the modal is (re)opened for a fresh flow
  useEffect(() => {
    if (open) {
      setDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  function handleDigitChange(index: number, value: string) {
    const clean = value.replace(/\D/g, '');
    if (!clean) {
      setDigits((prev) => {
        const next = [...prev];
        next[index] = '';
        return next;
      });
      return;
    }
    // Handle paste of the full code into one box
    if (clean.length > 1) {
      const chars = clean.slice(0, OTP_LENGTH).split('');
      setDigits((prev) => {
        const next = [...prev];
        chars.forEach((c, i) => {
          if (index + i < OTP_LENGTH) next[index + i] = c;
        });
        return next;
      });
      const lastFilled = Math.min(index + chars.length, OTP_LENGTH) - 1;
      inputRefs.current[lastFilled]?.focus();
      return;
    }
    setDigits((prev) => {
      const next = [...prev];
      next[index] = clean;
      return next;
    });
    if (index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleUseDevOtp() {
    if (!devOtp) return;
    setDigits(devOtp.padEnd(OTP_LENGTH, ' ').slice(0, OTP_LENGTH).split(''));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length !== OTP_LENGTH) return;
    onSubmit(otp);
  }

  const otpComplete = digits.every((d) => d !== '');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {description} <span className="font-medium text-slate-700">{email}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {devOtp && (
          <button
            type="button"
            onClick={handleUseDevOtp}
            className="mt-4 w-full rounded-lg border border-dashed border-teal-300 bg-teal-50 px-3 py-2 text-left text-sm text-teal-700 hover:bg-teal-100"
          >
            <span className="block text-xs font-medium uppercase tracking-wide text-teal-500">
              Test OTP (dev only)
            </span>
            <span className="font-mono text-base font-semibold tracking-widest">{devOtp}</span>
            <span className="ml-2 text-xs text-teal-500">— tap to fill</span>
          </button>
        )}

        <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
          <ErrorAlert message={error} />

          <div className="flex justify-between gap-2">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                inputMode="numeric"
                maxLength={OTP_LENGTH}
                className="h-12 w-full max-w-[44px] rounded-lg border border-slate-300 text-center text-lg font-semibold text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/40"
              />
            ))}
          </div>

          {children}

          <Button type="submit" isLoading={isSubmitting} disabled={!otpComplete}>
            Verify
          </Button>

          <button
            type="button"
            onClick={onResend}
            disabled={resendCooldown > 0 || isResending}
            className="text-center text-sm font-medium text-teal-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
          >
            {resendCooldown > 0
              ? `Resend OTP in ${resendCooldown}s`
              : isResending
                ? 'Resending…'
                : 'Resend OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}

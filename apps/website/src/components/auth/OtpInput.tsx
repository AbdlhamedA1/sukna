'use client';

import { useRef, useState } from 'react';

const LENGTH = 6;

interface OtpInputProps {
  onChange: (code: string) => void;
  disabled?: boolean;
}

/** Six-box OTP input with auto-advance, backspace return, and paste support. */
export function OtpInput({ onChange, disabled }: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''));
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const emit = (next: string[]) => {
    setDigits(next);
    onChange(next.join(''));
  };

  const handleChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '');
    if (!clean) return;

    // Pasted or autocompleted multi-digit input fills forward from this box.
    if (clean.length > 1) {
      const next = [...digits];
      clean
        .slice(0, LENGTH - index)
        .split('')
        .forEach((d, offset) => {
          next[index + offset] = d;
        });
      emit(next);
      const focusTo = Math.min(index + clean.length, LENGTH - 1);
      refs.current[focusTo]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = clean;
    emit(next);
    if (index < LENGTH - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const next = [...digits];
      if (next[index]) {
        next[index] = '';
        emit(next);
      } else if (index > 0) {
        next[index - 1] = '';
        emit(next);
        refs.current[index - 1]?.focus();
      }
    }
    if (event.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus();
    if (event.key === 'ArrowRight' && index < LENGTH - 1) refs.current[index + 1]?.focus();
  };

  return (
    <div className="flex justify-between gap-2 sm:gap-3" dir="ltr">
      {digits.map((digit, index) => (
        <input
          // Index keys are stable here: the box count never changes.
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={LENGTH}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${LENGTH}`}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="h-12 w-11 rounded-lg border border-brand-border bg-white text-center text-xl font-semibold text-brand-ink outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30 disabled:opacity-50 sm:h-14 sm:w-12"
        />
      ))}
    </div>
  );
}

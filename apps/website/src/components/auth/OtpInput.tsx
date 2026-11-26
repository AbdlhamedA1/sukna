'use client';

import { Input } from 'antd';

interface OtpInputProps {
  onChange: (code: string) => void;
  disabled?: boolean;
}

/** Six-box OTP input (Ant Design) with auto-advance and paste support. */
export function OtpInput({ onChange, disabled }: OtpInputProps) {
  return (
    <div className="flex justify-center" dir="ltr">
      <Input.OTP length={6} size="large" disabled={disabled} onChange={onChange} formatter={(v) => v.replace(/\D/g, '')} />
    </div>
  );
}

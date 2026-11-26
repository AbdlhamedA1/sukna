'use client';

import { Input } from 'antd';
import { forwardRef } from 'react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/** Ant Design input with an accessible label; keeps native `name` so plain form submits work. */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, error, id, type, size: _size, prefix: _prefix, ...rest },
  ref,
) {
  const fieldId = id ?? rest.name ?? label;
  const Control = type === 'password' ? Input.Password : Input;
  return (
    <div>
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-brand-ink">
        {label}
      </label>
      <Control
        ref={ref as never}
        id={fieldId}
        size="large"
        type={type === 'password' ? undefined : type}
        status={error ? 'error' : undefined}
        aria-invalid={Boolean(error)}
        {...(rest as object)}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
});

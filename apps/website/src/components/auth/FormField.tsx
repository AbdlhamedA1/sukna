import { forwardRef } from 'react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, error, id, ...rest },
  ref,
) {
  const fieldId = id ?? rest.name ?? label;
  return (
    <div>
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-brand-ink">
        {label}
      </label>
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className="h-12 w-full rounded-lg border border-brand-border bg-white px-4 text-brand-ink outline-none transition placeholder:text-brand-muted/60 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        {...rest}
      />
      {error ? (
        <p id={`${fieldId}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
});

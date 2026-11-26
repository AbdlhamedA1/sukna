interface SubmitButtonProps {
  loading: boolean;
  children: React.ReactNode;
}

export function SubmitButton({ loading, children }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex h-12 w-full items-center justify-center rounded-lg bg-brand-accent font-semibold text-white transition hover:bg-brand-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? 'Please wait…' : children}
    </button>
  );
}

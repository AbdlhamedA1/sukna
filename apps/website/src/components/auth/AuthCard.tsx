interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold text-brand-primary">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-brand-muted">{subtitle}</p> : null}
      <div className="mt-6">{children}</div>
      {footer ? <div className="mt-6 text-center text-sm text-brand-muted">{footer}</div> : null}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-[90%] max-w-container flex-col items-center justify-center px-4 text-center">
      <span className="mb-4 rounded-full bg-brand-primary-soft px-4 py-1 text-sm font-medium text-brand-primary">
        Qena &middot; Sohag &middot; Minya
      </span>
      <h1 className="text-4xl font-bold text-brand-primary">
        SUKNA <span className="font-arabic">سُكنا</span>
      </h1>
      <p className="mt-3 max-w-xl text-lg text-brand-muted">
        Verified student and residential housing discovery for Upper Egypt. The public catalog,
        search filters, and property detail pages arrive with their vertical slices per
        docs/DEVELOPMENT_ROADMAP.md.
      </p>
      <a
        href="http://localhost:5000/api/v1/health"
        className="mt-6 inline-flex h-12 items-center rounded-lg bg-brand-accent px-6 font-semibold text-white transition hover:bg-brand-accent-hover active:scale-[0.98]"
      >
        API Health Check
      </a>
    </main>
  );
}

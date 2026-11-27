const POINTS = [
  {
    title: 'Every building is verified',
    body: 'Our team reviews each building before it goes live, so what you see is what you get.',
  },
  {
    title: 'Built for Upper Egypt',
    body: 'Browse by governorate, city and area across Qena, Sohag and Minya.',
  },
  {
    title: 'Clear prices, no surprises',
    body: 'Monthly rent, furnishing and floor details are shown up front on every listing.',
  },
  {
    title: 'Made for students and families',
    body: 'Entire places, shared flats and private rooms, filtered the way you actually search.',
  },
];

export function WhySukna() {
  return (
    <section id="why" className="py-16 sm:py-20">
      <div className="mx-auto w-full max-w-container px-4 sm:px-8">
        <h2 className="text-center text-2xl font-bold text-brand-primary sm:text-3xl">
          Why choose SUKNA
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map((p, i) => (
            <div key={p.title} className="rounded-2xl border border-brand-border bg-white p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-accent-soft text-sm font-bold text-brand-accent">
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold text-brand-primary">{p.title}</h3>
              <p className="mt-2 text-sm text-brand-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

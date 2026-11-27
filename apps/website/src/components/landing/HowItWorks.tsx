import { Reveal } from './Reveal';

const STEPS = [
  ['01', 'Search by area', 'Pick your governorate, city and area. Filter by price, rooms and furnishing.'],
  ['02', 'Check the details', 'Photos, floor, price and the distance to the university gates, all on one page.'],
  ['03', 'Contact the owner', 'Create a free account, save your favorites and reveal the owner contact when you are ready.'],
];

export function HowItWorks() {
  return (
    <section className="bg-brand-canvas py-16 sm:py-24">
      <div className="mx-auto w-full max-w-container px-4 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-teal">How it works</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-brand-primary sm:text-4xl">Find a place in three steps</h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map(([n, t, d], i) => (
            <Reveal key={n} delay={i * 90}>
              <div className="h-full rounded-3xl border border-brand-border bg-gradient-to-b from-white to-brand-canvas p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <span className="text-5xl font-extrabold text-brand-teal/30">{n}</span>
                <h3 className="mt-4 text-xl font-bold text-brand-primary">{t}</h3>
                <p className="mt-2 leading-relaxed text-brand-muted">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Reveal } from './Reveal';

const POINTS = [
  { title: 'Every building is verified', body: 'Our team reviews each building before it goes live, so what you see is what you get.', wide: true },
  { title: 'Built for Upper Egypt', body: 'Qena, Sohag and Minya, down to the area.' },
  { title: 'Clear prices', body: 'Monthly rent, floor and furnishing shown up front.' },
  { title: 'Students and families', body: 'Entire places, shared flats and private rooms, filtered the way you actually search.', wide: true },
];

export function WhySukna() {
  return (
    <section id="why" className="bg-brand-canvas py-16 sm:py-24">
      <div className="mx-auto w-full max-w-container px-4 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-teal">Why SUKNA</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-brand-primary sm:text-4xl">Housing search, made calm</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {POINTS.map((p, i) => (
            <Reveal key={p.title} delay={i * 70} className={p.wide ? 'md:col-span-2' : ''}>
              <div className={`h-full rounded-3xl p-8 transition hover:-translate-y-1 hover:shadow-xl ${i === 0 ? 'bg-gradient-to-br from-brand-primary to-[#1E5A7A] text-white' : i === 3 ? 'bg-brand-teal-soft text-brand-primary' : 'border border-brand-border bg-white text-brand-primary'}`}>
                <h3 className="text-xl font-bold">{p.title}</h3>
                <p className={`mt-2 max-w-md leading-relaxed ${i === 0 ? 'text-white/80' : 'text-brand-muted'}`}>{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* eslint-disable @next/next/no-img-element */
export function Logo({ variant = 'dark', className = 'h-10' }: { variant?: 'dark' | 'white'; className?: string }) {
  return (
    <a href="/" aria-label="SUKNA home" className="inline-flex shrink-0 cursor-pointer items-center transition hover:opacity-80">
      <img src={variant === 'white' ? '/logo-h-white.png' : '/logo-h.png'} alt="SUKNA" className={`${className} w-auto`} />
    </a>
  );
}

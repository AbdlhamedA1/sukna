/* eslint-disable @next/next/no-img-element */
export function Logo({
  variant = 'dark',
  art = 'header',
  className = 'h-9 sm:h-11',
}: {
  variant?: 'dark' | 'white';
  /** 'header' art has strengthened strokes so the wordmark stays crisp at small
   * sizes; 'full' is the original artwork for large placements like the hero. */
  art?: 'header' | 'full';
  className?: string;
}) {
  const src =
    art === 'full'
      ? variant === 'white'
        ? '/logo-h-white.png'
        : '/logo-h.png'
      : variant === 'white'
        ? '/logo-header-white.png'
        : '/logo-header.png';
  return (
    <a href="/" aria-label="SUKNA home" className="inline-flex shrink-0 cursor-pointer items-center rounded-lg transition hover:opacity-80">
      <img src={src} alt="SUKNA" className={`${className} w-auto`} />
    </a>
  );
}

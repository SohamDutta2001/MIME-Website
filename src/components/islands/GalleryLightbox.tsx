import { useEffect, useState, useCallback } from 'react';

type Photo = { src: string; alt: string };

export default function GalleryLightbox({ photos }: { photos: Photo[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const next = useCallback(
    () => setActiveIndex(i => (i === null ? null : (i + 1) % photos.length)),
    [photos.length],
  );
  const prev = useCallback(
    () => setActiveIndex(i => (i === null ? null : (i - 1 + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    const onClick = (e: Event) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>('[data-gallery-index]');
      if (!target) return;
      e.preventDefault();
      const i = Number(target.dataset.galleryIndex);
      if (!Number.isNaN(i)) setActiveIndex(i);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [activeIndex, close, next, prev]);

  if (activeIndex === null) return null;
  const photo = photos[activeIndex];
  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-tea-900/92 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      onClick={close}
    >
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); prev(); }}
        aria-label="Previous photo"
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-cream/15 p-3 text-cream transition-colors hover:bg-cream/25 sm:left-8"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      <figure className="max-h-[88vh] max-w-[92vw]" onClick={(e) => e.stopPropagation()}>
        <img
          src={photo.src}
          alt={photo.alt}
          className="block max-h-[80vh] max-w-full object-contain shadow-2xl"
        />
        <figcaption className="mt-4 text-center font-hand text-base text-cream/85">
          {photo.alt}
        </figcaption>
      </figure>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); next(); }}
        aria-label="Next photo"
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-cream/15 p-3 text-cream transition-colors hover:bg-cream/25 sm:right-8"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); close(); }}
        aria-label="Close"
        className="absolute right-4 top-4 rounded-full bg-cream/15 p-2.5 text-cream transition-colors hover:bg-cream/25 sm:right-8 sm:top-8"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-body text-sm text-cream/70 tabular-nums">
        {activeIndex + 1} / {photos.length}
      </div>
    </div>
  );
}

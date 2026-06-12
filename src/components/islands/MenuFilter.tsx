import { useEffect, useState } from 'react';

interface Props {
  /** Category strings in display order, derived from the menu data.
   *  "All" is prepended automatically. */
  categories?: string[];
  initial?: string;
}

export default function MenuFilter({ categories = [], initial = 'all' }: Props) {
  const [active, setActive] = useState(initial);
  const filters = ['all', ...categories];

  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>('[data-menu-category]');
    cards.forEach(card => {
      const cat = card.dataset.menuCategory ?? '';
      const visible = active === 'all' || cat === active;
      card.style.display = visible ? '' : 'none';
    });
  }, [active]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3" role="tablist" aria-label="Menu category filter">
      {filters.map(cat => {
        const isActive = active === cat;
        const label = cat === 'all' ? 'All' : cat;
        return (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setActive(cat)}
            className={[
              'rounded-full px-4 py-1.5 text-sm tracking-wide transition-colors duration-200',
              isActive
                ? 'bg-tea-700 text-cream shadow-sm'
                : 'border border-tea-500/30 bg-cream/60 text-tea-700 hover:border-tea-500/60 hover:bg-cream',
            ].join(' ')}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

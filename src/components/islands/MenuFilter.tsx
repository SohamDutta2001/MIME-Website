import { useEffect, useState } from 'react';

type Category = 'all' | 'tea' | 'coffee' | 'snack' | 'quick-bite';

const FILTERS: { value: Category; label: string; bn?: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'tea', label: 'Teas', bn: 'চা' },
  { value: 'coffee', label: 'Coffees' },
  { value: 'snack', label: 'Snacks' },
  { value: 'quick-bite', label: 'Quick Bites' },
];

export default function MenuFilter({ initial = 'all' }: { initial?: Category }) {
  const [active, setActive] = useState<Category>(initial);

  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>('[data-menu-category]');
    cards.forEach(card => {
      const cat = card.dataset.menuCategory as Category | undefined;
      const visible = active === 'all' || cat === active;
      card.style.display = visible ? '' : 'none';
    });
  }, [active]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3" role="tablist" aria-label="Menu category filter">
      {FILTERS.map(f => {
        const isActive = active === f.value;
        return (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setActive(f.value)}
            className={[
              'rounded-full px-4 py-1.5 text-sm tracking-wide transition-colors duration-200',
              isActive
                ? 'bg-tea-700 text-cream shadow-sm'
                : 'border border-tea-500/30 bg-cream/60 text-tea-700 hover:border-tea-500/60 hover:bg-cream',
            ].join(' ')}
          >
            {f.label}
            {f.bn && (
              <span className="ml-1 font-bn text-[0.95em] opacity-75">· {f.bn}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

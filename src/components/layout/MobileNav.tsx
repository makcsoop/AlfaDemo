import { NavLink } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useActivationStore } from '@/store/useActivationStore';
import { ALFA_START_NAV, DEMO_STORY_NAV } from './nav';

const ITEMS = [...ALFA_START_NAV, DEMO_STORY_NAV];

/**
 * Навигация для планшета/узких окон (<lg), где сайдбар скрыт:
 * горизонтальная прокручиваемая лента разделов под шапкой.
 */
export function MobileNav() {
  return (
    <nav className="lg:hidden sticky top-16 z-10 border-b border-line bg-surface/90 backdrop-blur">
      <div className="flex gap-1.5 overflow-x-auto scrollbar-thin px-3 py-2">
        {ITEMS.map((item) => (
          <MobileNavLink key={item.to} item={item} />
        ))}
      </div>
    </nav>
  );
}

function MobileNavLink({ item }: { item: (typeof ITEMS)[number] }) {
  const locked = useActivationStore((s) => !s.isRouteUnlocked(item.to));

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
          item.accent
            ? isActive
              ? 'bg-alfa-red text-white'
              : 'bg-alfa-red-50 text-alfa-red'
            : isActive
              ? 'bg-alfa-ink text-white'
              : locked
                ? 'bg-bg text-muted'
                : 'bg-bg text-alfa-graphite hover:bg-line/60',
        )
      }
      title={locked ? 'Закрыто — активируйте в стартовом пакете' : undefined}
    >
      <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.9} />
      {item.label}
      {locked && <Lock className="h-3 w-3 shrink-0" />}
    </NavLink>
  );
}

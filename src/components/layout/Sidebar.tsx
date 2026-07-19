import { NavLink } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useActivationStore } from '@/store/useActivationStore';
import { ALFA_START_NAV, DEMO_STORY_NAV, ECOSYSTEM } from './nav';

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-[264px] shrink-0 flex-col border-r border-line bg-surface">
      {/* Логотип */}
      <div className="flex items-center gap-2.5 h-16 px-5 border-b border-line">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-alfa-red text-white font-bold">
          А
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-alfa-ink">Альфа Онлайн</div>
          <div className="text-xs text-muted">для бизнеса</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
        {/* Экосистема — контекст, активен только Альфа-старт */}
        <div className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Экосистема
        </div>
        <ul className="space-y-0.5">
          {ECOSYSTEM.map((item) => (
            <li key={item.label}>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm',
                  item.active
                    ? 'bg-alfa-red-50 text-alfa-red font-medium'
                    : 'text-muted cursor-not-allowed opacity-70',
                )}
                aria-disabled={!item.active}
                title={item.active ? undefined : 'Недоступно в демо'}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.9} />
                <span className="truncate">{item.label}</span>
                {item.active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-alfa-red" aria-hidden />
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Внутренняя навигация Альфа-старт */}
        <div className="px-2 mt-6 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Альфа-старт
        </div>
        <ul className="space-y-0.5">
          {ALFA_START_NAV.map((item) => (
            <li key={item.to}>
              <SidebarLink item={item} />
            </li>
          ))}
        </ul>

        {/* Флагманский демо-сценарий */}
        <div className="mt-6 px-1">
          <SidebarLink item={DEMO_STORY_NAV} />
        </div>
      </nav>

      <div className="border-t border-line px-5 py-3 text-[11px] text-muted">
        Демо-прототип · не финансовый продукт
      </div>
    </aside>
  );
}

function SidebarLink({ item }: { item: (typeof ALFA_START_NAV)[number] }) {
  const locked = useActivationStore((s) => !s.isRouteUnlocked(item.to));

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
          item.accent
            ? isActive
              ? 'bg-alfa-red text-white font-medium shadow-sm'
              : 'text-alfa-red bg-alfa-red-50/60 hover:bg-alfa-red-50 font-medium'
            : isActive
              ? 'bg-alfa-ink text-white font-medium'
              : locked
                ? 'text-muted hover:bg-bg'
                : 'text-alfa-graphite hover:bg-bg',
        )
      }
      title={locked ? 'Закрыто — активируйте в стартовом пакете' : undefined}
    >
      <item.icon className={cn('h-[18px] w-[18px] shrink-0', locked && 'opacity-60')} strokeWidth={1.9} />
      <span className={cn('truncate', locked && 'opacity-70')}>{item.label}</span>
      {locked && <Lock className="ml-auto h-3.5 w-3.5 shrink-0 text-muted" />}
    </NavLink>
  );
}

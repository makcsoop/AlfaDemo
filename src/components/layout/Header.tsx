import { useNavigate } from 'react-router-dom';
import { ChevronDown, Bell, RotateCcw } from 'lucide-react';
import { ModeToggle } from './ModeToggle';
import { DEMO_BUSINESS, DEMO_OWNER } from '@/mock/business';
import { Badge } from '@/shared/ui';
import { resetDemo } from '@/lib/demoReset';

export function Header() {
  const navigate = useNavigate();

  const restartDemo = () => {
    if (!window.confirm('Сбросить весь путь и пройти демо заново?')) return;
    resetDemo();
    navigate('/onboarding');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-line bg-surface/90 px-4 sm:px-6 backdrop-blur">
      {/* Переключатель бизнеса */}
      <button
        type="button"
        className="group inline-flex items-center gap-3 rounded-xl px-2.5 py-1.5 hover:bg-bg transition-colors"
        title="Переключить бизнес (демо)"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-alfa-red-50 text-alfa-red font-semibold">
          {DEMO_OWNER.initials}
        </div>
        <div className="text-left leading-tight">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-alfa-ink">
            {DEMO_BUSINESS.name}
            <ChevronDown className="h-4 w-4 text-muted group-hover:text-alfa-graphite" />
          </div>
          <div className="text-xs text-muted">{DEMO_BUSINESS.city} · ИП</div>
        </div>
      </button>

      <Badge tone="green" dot className="hidden sm:inline-flex">
        Счёт активен
      </Badge>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={restartDemo}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line px-3 text-sm font-medium text-alfa-graphite hover:bg-bg transition-colors"
          title="Сбросить путь к пресету персоны и начать показ заново"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="hidden md:inline">Демо заново</span>
        </button>
        <ModeToggle />
        <button
          type="button"
          className="relative hidden sm:flex h-10 w-10 items-center justify-center rounded-xl border border-line text-alfa-graphite hover:bg-bg transition-colors"
          aria-label="Уведомления"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-alfa-red" />
        </button>
      </div>
    </header>
  );
}

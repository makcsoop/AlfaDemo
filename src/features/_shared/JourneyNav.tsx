import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, LayoutDashboard } from 'lucide-react';
import { Button } from '@/shared/ui';
import { JOURNEY } from '@/lib/journey';
import { useProgressStore } from '@/store/useProgressStore';
import { useActivationStore } from '@/store/useActivationStore';

/**
 * Единая навигация по шагам пути: «Назад» слева, «Далее» справа — всегда на
 * одном и том же месте на каждом шаге, чтобы кнопка «дальше» не «прыгала» по
 * экранам. Вне шагов пути (дашборд, радар, демо-сценарий) не отображается.
 *
 * Регистрация покрывает два шага пути (регистрация + пакет) на одном роуте,
 * поэтому список строится по уникальным последовательным роутам.
 */
const STEPS = JOURNEY.reduce<{ to: string; label: string; short: string }[]>((acc, s) => {
  if (acc[acc.length - 1]?.to !== s.to) acc.push({ to: s.to, label: s.label, short: s.short });
  return acc;
}, []);

export function JourneyNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const complete = useProgressStore((s) => s.complete);
  const registered = useActivationStore((s) => s.registered);

  const idx = STEPS.findIndex((s) => s.to === pathname);
  if (idx === -1) return null; // текущий экран не входит в путь — контрол не нужен

  // На регистрации до её завершения ведёт свой пошаговый мастер — не дублируем «Далее».
  if (pathname === '/registration' && !registered) return null;

  const prev = idx > 0 ? STEPS[idx - 1] : null;
  const next = idx < STEPS.length - 1 ? STEPS[idx + 1] : null;

  const go = (to: string) => {
    // Онбординг завершается по факту прохождения — фиксируем при уходе вперёд/назад.
    if (pathname === '/onboarding') complete('/onboarding');
    navigate(to);
    document.querySelector('main')?.scrollTo({ top: 0 });
  };

  return (
    <div className="sticky bottom-0 z-10 -mx-4 -mb-6 mt-8 border-t border-line bg-surface/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:-mx-6 sm:-mb-8 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        {prev ? (
          <Button variant="secondary" onClick={() => go(prev.to)}>
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>
        ) : (
          <span aria-hidden />
        )}

        <div className="hidden text-xs text-muted sm:block">
          Шаг {idx + 1} из {STEPS.length} · {STEPS[idx].label}
        </div>

        {next ? (
          <Button onClick={() => go(next.to)}>
            Далее<span className="hidden sm:inline">: {next.short}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={() => go('/dashboard')}>
            <LayoutDashboard className="h-4 w-4" />
            На дашборд
          </Button>
        )}
      </div>
    </div>
  );
}

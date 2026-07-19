import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { JOURNEY, isJourneyStepDone, journeyProgress } from '@/lib/journey';
import { useProgressStore } from '@/store/useProgressStore';
import { useActivationStore } from '@/store/useActivationStore';

/** Компактный индикатор пути из 8 шагов. Активный шаг подсвечен, пройденные — красные. */
export function JourneyBar({ className, clickable = true }: { className?: string; clickable?: boolean }) {
  const navigate = useNavigate();
  const steps = useProgressStore((s) => s.steps);
  const registered = useActivationStore((s) => s.registered);
  const packageActivated = useActivationStore((s) => s.isPackageActivated());

  const inputs = { steps, registered, packageActivated };
  const { doneCount, total, percent } = journeyProgress(inputs);
  const statuses = JOURNEY.map((step) => isJourneyStepDone(step, inputs));
  // Текущий шаг — первый незавершённый.
  const currentIdx = statuses.findIndex((d) => !d);

  return (
    <div className={className}>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="text-sm text-muted">Путь запуска</div>
          <div className="mt-0.5 text-xl font-bold text-alfa-ink sm:text-2xl">
            {doneCount} из {total} шагов
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-alfa-red sm:text-2xl">{percent}%</div>
          <div className="text-xs text-muted">{percent === 100 ? 'путь пройден' : 'в процессе'}</div>
        </div>
      </div>

      <div className="flex items-start gap-1 sm:gap-1.5">
        {JOURNEY.map((step, i) => {
          const done = statuses[i];
          const active = i === currentIdx;
          return (
            <button
              key={step.id}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && navigate(step.to)}
              className={cn('group flex flex-1 flex-col items-center gap-1.5', clickable && 'cursor-pointer')}
              title={step.label}
            >
              <span className="flex w-full items-center justify-center">
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                    done && 'bg-alfa-red text-white',
                    active && !done && 'bg-alfa-red-50 text-alfa-red ring-2 ring-alfa-red',
                    !active && !done && 'bg-bg text-muted',
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                </span>
              </span>
              {/* Подписи шагов только с sm: на телефоне 8 колонок текста не помещаются. */}
              <span
                className={cn(
                  'hidden text-center text-[11px] leading-tight sm:block',
                  done || active ? 'text-alfa-graphite font-medium' : 'text-muted',
                )}
              >
                {step.short}
              </span>
            </button>
          );
        })}
      </div>

      {/* Мобильная подпись: какой шаг сейчас (вместо 8 подписей под кружками). */}
      <div className="mt-2.5 text-center text-xs font-medium text-alfa-graphite sm:hidden">
        {currentIdx === -1
          ? 'Все шаги пройдены 🎉'
          : `Шаг ${currentIdx + 1} из ${total} — ${JOURNEY[currentIdx].label}`}
      </div>
    </div>
  );
}

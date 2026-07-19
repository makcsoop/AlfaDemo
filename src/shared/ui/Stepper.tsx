import { Fragment } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface Step {
  id: string;
  title: string;
  description?: string;
}

export interface StepperProps {
  steps: Step[];
  /** Индекс текущего шага (0-based). */
  current: number;
  /** Явно завершённые шаги по id (иначе завершёнными считаются все до current). */
  completed?: string[];
  onStepClick?: (index: number, step: Step) => void;
  className?: string;
}

export function Stepper({ steps, current, completed, onStepClick, className }: StepperProps) {
  const isDone = (i: number, step: Step) =>
    completed ? completed.includes(step.id) : i < current;

  // Обёртка с горизонтальной прокруткой — контент не вылезает за пределы
  // карточки-панели. Внутренний p-1 нужен, чтобы ring активного шага
  // (box-shadow за границей кружка) не обрезался краем контейнера.
  return (
    <div className={cn('w-full overflow-x-auto scrollbar-thin', className)}>
      <ol className="flex w-full min-w-max items-center p-1">
        {steps.map((step, i) => {
          const done = isDone(i, step);
          const active = i === current;
          const clickable = Boolean(onStepClick);

          return (
            <Fragment key={step.id}>
              <li className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => onStepClick?.(i, step)}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                    done && 'bg-alfa-red text-white',
                    active && !done && 'bg-alfa-red-50 text-alfa-red ring-2 ring-alfa-red',
                    !active && !done && 'bg-bg text-muted',
                    clickable && 'cursor-pointer',
                  )}
                  aria-current={active ? 'step' : undefined}
                >
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </button>
                <div className="hidden sm:block">
                  <div
                    className={cn(
                      'text-sm font-medium leading-tight',
                      active || done ? 'text-alfa-ink' : 'text-muted',
                    )}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-xs text-muted leading-tight">{step.description}</div>
                  )}
                </div>
              </li>
              {i < steps.length - 1 && (
                <div className={cn('mx-3 h-px flex-1 min-w-4', done ? 'bg-alfa-red' : 'bg-line')} />
              )}
            </Fragment>
          );
        })}
      </ol>
      {/* На телефоне подписи шагов скрыты — показываем текущий шаг строкой. */}
      {steps[current] && (
        <div className="px-1 pb-1 pt-1.5 text-xs font-medium text-alfa-graphite sm:hidden">
          Шаг {current + 1} из {steps.length} · {steps[current].title}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Card, Skeleton } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';

/** Стадии «живого» анализа. Текст меняется по мере расчёта (задержка ~1–1.4 с). */
const STAGES = [
  { label: 'Анализируем рынок и географию района', sub: 'обороты похожих бизнесов, трафик, аренда' },
  { label: 'Сравниваем с похожими бизнесами клиентов Альфа', sub: 'обезличенные данные по нише и району' },
  { label: 'Считаем юнит-экономику и три сценария', sub: 'выручка, маржа, точка окупаемости' },
  { label: 'Проверяем безопасную кредитную нагрузку', sub: 'комфортный платёж и стресс-тест спроса' },
];

const STAGE_MS = 1300;

export function AnalyzingState() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((i) => Math.min(i + 1, STAGES.length - 1));
    }, STAGE_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="animate-fade-up space-y-5">
      <Card>
        <div className="space-y-3">
          {STAGES.map((stage, i) => {
            const done = i < active;
            const current = i === active;
            return (
              <div
                key={stage.label}
                className={cn(
                  'flex items-start gap-3 rounded-xl border px-3.5 py-3 transition-colors',
                  current ? 'border-alfa-red/30 bg-alfa-red-50/50' : 'border-transparent',
                  !done && !current && 'opacity-45',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                    done ? 'bg-risk-low text-white' : current ? 'text-alfa-red' : 'text-muted',
                  )}
                >
                  {done ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : current ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  )}
                </span>
                <div className="min-w-0">
                  <div className={cn('text-sm font-medium', current || done ? 'text-alfa-ink' : 'text-muted')}>
                    {stage.label}
                  </div>
                  <div className="text-xs text-muted">{stage.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Скелетон будущего результата */}
      <div className="grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-32 w-full" />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

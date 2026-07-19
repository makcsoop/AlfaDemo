import { ShieldCheck, TriangleAlert, TrendingDown, CircleCheck, CircleX } from 'lucide-react';
import { Card } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import type { Credit } from '@/lib/schema';
import { formatPercent, formatRub } from '@/lib/format';

const LIGHT: Record<Credit['light'], { label: string; color: string; bg: string; text: string }> = {
  green: { label: 'Можно брать', color: '#12A150', bg: 'bg-emerald-50', text: 'text-risk-low' },
  yellow: { label: 'На грани — берите меньше', color: '#F5A524', bg: 'bg-amber-50', text: 'text-amber-600' },
  red: { label: 'Рискованно', color: '#EF3124', bg: 'bg-alfa-red-50', text: 'text-alfa-red' },
};

export interface CreditBlockProps {
  credit: Credit;
}

export function CreditBlock({ credit }: CreditBlockProps) {
  const light = LIGHT[credit.light];
  const payback = credit.paybackMonth ? `${credit.paybackMonth} мес` : '> 12 мес';

  return (
    <Card>
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-alfa-ink">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-alfa-red-50 text-alfa-red">
          <ShieldCheck className="h-4 w-4" />
        </span>
        Рекомендация по кредиту
      </div>

      {/* Светофор + безопасная сумма */}
      <div className={cn('flex items-center gap-4 rounded-xl p-4', light.bg)}>
        <TrafficLight active={credit.light} />
        <div className="min-w-0">
          <div className={cn('text-sm font-semibold', light.text)}>{light.label}</div>
          <div className="mt-0.5 text-xs text-muted">Безопасная сумма кредита</div>
          <div className="text-2xl font-bold text-alfa-ink">≤ {formatRub(credit.safeAmount)}</div>
        </div>
      </div>

      {/* Ключевые параметры */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Param label="Вы запросили" value={formatRub(credit.requested)} muted={credit.requested > credit.safeAmount} />
        <Param label="Комфортный платёж" value={`${formatRub(credit.comfortablePayment)}/мес`} />
        <Param label="Срок / ставка" value={`${credit.termMonths} мес · ${formatPercent(credit.rate)}`} />
        <Param label="Окупаемость кредита" value={payback} />
      </div>

      {/* Стресс-тест */}
      <div className="mt-4 rounded-xl border border-line bg-bg p-3.5">
        <div className="flex items-center gap-2 text-sm font-medium text-alfa-ink">
          <TrendingDown className="h-4 w-4 text-alfa-red" />
          Стресс-тест: {credit.stressTest.label}
          <span
            className={cn(
              'ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              credit.stressTest.survives ? 'bg-emerald-50 text-risk-low' : 'bg-alfa-red-50 text-alfa-red',
            )}
          >
            {credit.stressTest.survives ? <CircleCheck className="h-3.5 w-3.5" /> : <CircleX className="h-3.5 w-3.5" />}
            {credit.stressTest.survives ? 'выдержит' : 'риск'}
          </span>
        </div>
        <p className="mt-1.5 text-sm text-muted">{credit.stressTest.note}</p>
      </div>

      {/* Явный вывод */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-alfa-ink/[0.03] p-3.5">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-alfa-red" />
        <p className="text-sm text-alfa-graphite">{credit.verdict}</p>
      </div>
    </Card>
  );
}

/** Вертикальный светофор: активна лампа red/yellow/green. */
function TrafficLight({ active }: { active: Credit['light'] }) {
  const lamps: Credit['light'][] = ['red', 'yellow', 'green'];
  const colors: Record<Credit['light'], string> = {
    red: '#EF3124',
    yellow: '#F5A524',
    green: '#12A150',
  };
  return (
    <div className="flex shrink-0 flex-col gap-1.5 rounded-full bg-alfa-ink/90 p-2">
      {lamps.map((l) => {
        const on = l === active;
        return (
          <span
            key={l}
            className="h-4 w-4 rounded-full transition-all"
            style={{
              backgroundColor: on ? colors[l] : 'rgba(255,255,255,0.18)',
              boxShadow: on ? `0 0 10px ${colors[l]}` : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

function Param({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className={cn('mt-1 text-sm font-semibold', muted ? 'text-muted line-through' : 'text-alfa-ink')}>
        {value}
      </div>
    </div>
  );
}

import { useState, type ReactNode } from 'react';
import { Wallet, TrendingUp, Receipt, Hash, Landmark, Info } from 'lucide-react';
import { Card, Disclaimer } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { formatRub } from '@/lib/format';
import { estimateTax, moneySummary } from '@/lib/pocketAdmin';
import { TAX_REGIMES, type TaxRegimeId } from '@/mock/pocketAdmin';
import { usePocketAdminStore } from '@/store/usePocketAdminStore';

type Period = 'week' | 'month';
const PERIOD_DAYS: Record<Period, number> = { week: 7, month: 30 };

export function MoneyView() {
  const payments = usePocketAdminStore((s) => s.payments);
  const regimeId = usePocketAdminStore((s) => s.regime);
  const setRegime = usePocketAdminStore((s) => s.setRegime);
  const [period, setPeriod] = useState<Period>('week');

  const summary = moneySummary(payments, PERIOD_DAYS[period]);
  const regime = TAX_REGIMES[regimeId];
  const tax = estimateTax(summary.revenue, regime);

  return (
    <div className="space-y-5">
      {/* Период */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted">Сводка по деньгам</div>
        <div className="inline-flex rounded-lg border border-line bg-bg p-0.5">
          {(['week', 'month'] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                period === p ? 'bg-surface text-alfa-ink shadow-sm' : 'text-muted hover:text-alfa-graphite',
              )}
            >
              {p === 'week' ? 'Неделя' : 'Месяц'}
            </button>
          ))}
        </div>
      </div>

      {/* Виджеты */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Widget icon={<Wallet className="h-4 w-4" />} label="Выручка" value={formatRub(summary.revenue)} accent />
        <Widget icon={<TrendingUp className="h-4 w-4" />} label="Прибыль (оценка)" value={formatRub(summary.profit)} />
        <Widget icon={<Receipt className="h-4 w-4" />} label="Средний чек" value={formatRub(summary.avgCheck)} />
        <Widget icon={<Hash className="h-4 w-4" />} label="Платежей" value={String(summary.count)} />
      </div>

      {/* Налоги под статус */}
      <Card>
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-alfa-ink">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-alfa-red-50 text-alfa-red">
            <Landmark className="h-4 w-4" />
          </span>
          Налоги и статус
        </div>

        {/* Выбор режима */}
        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(TAX_REGIMES) as TaxRegimeId[]).map((id) => {
            const r = TAX_REGIMES[id];
            const active = id === regimeId;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setRegime(id)}
                className={cn(
                  'rounded-xl border p-3 text-left transition-colors',
                  active ? 'border-alfa-red/40 bg-alfa-red-50/40 ring-1 ring-alfa-red/20' : 'border-line hover:bg-bg',
                )}
              >
                <div className="text-sm font-semibold text-alfa-ink">{r.short}</div>
                <div className="text-xs text-muted">{r.rateLabel}</div>
              </button>
            );
          })}
        </div>

        {/* Оценка налога */}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-bg px-4 py-3">
          <div>
            <div className="text-sm text-muted">Налог за {period === 'week' ? 'неделю' : 'месяц'} ({tax.baseLabel})</div>
            <div className="text-xs text-muted">лимит режима: {regime.limit}</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-alfa-ink">≈ {formatRub(tax.amount)}</div>
            <div className="text-xs text-muted">с {formatRub(tax.base)}</div>
          </div>
        </div>

        {/* Подсказки */}
        <ul className="mt-4 space-y-2">
          {regime.hints.map((h) => (
            <li key={h} className="flex items-start gap-2 text-sm text-alfa-graphite">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-alfa-red" />
              {h}
            </li>
          ))}
        </ul>

        <Disclaimer className="mt-4">
          Оценка налога — ориентир по выбранному режиму, без учёта вычетов и взносов. Точную сумму
          определяет ваш бухгалтер или налоговый калькулятор ФНС.
        </Disclaimer>
      </Card>
    </div>
  );
}

function Widget({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={cn('rounded-2xl border p-4 shadow-card', accent ? 'border-alfa-red/20 bg-alfa-red-50/40' : 'border-line bg-surface')}>
      <div className="flex items-center gap-1.5 text-xs text-muted">
        <span className="text-alfa-red">{icon}</span>
        {label}
      </div>
      <div className="mt-1.5 text-2xl font-bold text-alfa-ink">{value}</div>
    </div>
  );
}

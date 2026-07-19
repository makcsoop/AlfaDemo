import type { ReactNode } from 'react';
import { Wallet, TrendingUp, Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { formatPercent, formatRub, formatRubCompact } from '@/lib/format';
import type { Totals } from '@/lib/unitEconomics';

export function Dashboard({ totals }: { totals: Totals }) {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <Kpi icon={<Wallet className="h-4 w-4" />} label="Оборот за год" value={formatRub(totals.revenue)} accent />
      <Kpi icon={<TrendingUp className="h-4 w-4" />} label="Чистая прибыль" value={formatRub(totals.netProfit)} />
      <Kpi icon={<Percent className="h-4 w-4" />} label="Средняя маржа" value={formatPercent(totals.marginPct, 1)} />

      <Card className="flex flex-col justify-center gap-2">
        <Leader dir="up" name={totals.best.sku.name} value={formatRubCompact(totals.best.netProfit)} />
        <Leader dir="down" name={totals.worst.sku.name} value={formatRubCompact(totals.worst.netProfit)} />
      </Card>
    </div>
  );
}

function Kpi({ icon, label, value, accent }: { icon: ReactNode; label: string; value: string; accent?: boolean }) {
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

function Leader({ dir, name, value }: { dir: 'up' | 'down'; name: string; value: string }) {
  const up = dir === 'up';
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
          up ? 'bg-emerald-50 text-risk-low' : 'bg-alfa-red-50 text-alfa-red',
        )}
      >
        {up ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] text-muted">{up ? 'Топ по прибыли' : 'Аутсайдер'}</div>
        <div className="truncate text-sm font-medium text-alfa-ink">{name}</div>
      </div>
      <span className={cn('shrink-0 text-sm font-semibold', up ? 'text-risk-low' : 'text-alfa-red')}>{value}</span>
    </div>
  );
}

import { AlertTriangle, ShieldCheck, Radar } from 'lucide-react';
import { Card, Badge } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { formatRub } from '@/lib/format';
import { detectAnomalies, type Severity } from '@/lib/financialRadar';
import { RADAR_PERSONA, SHIFTS, OVERDRAFT_PARAMS } from '@/mock/financialRadar';

const SEV_STYLE: Record<Severity, string> = {
  high: 'border-alfa-red/40 bg-alfa-red-50/60',
  medium: 'border-amber-200 bg-amber-50/60',
  low: 'border-line bg-surface',
};

export function AnomalyRadar() {
  const anomalies = detectAnomalies(SHIFTS, RADAR_PERSONA.normCostRatio, OVERDRAFT_PARAMS.anomalyThreshold);
  const flagged = new Set(anomalies.map((a) => a.shift.id));

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-alfa-ink">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-alfa-red-50 text-alfa-red">
            <Radar className="h-4 w-4" />
          </span>
          Радар аномалий
        </div>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-risk-low" />
          AI следит в реальном времени
        </span>
      </div>

      {/* Сигналы */}
      {anomalies.length > 0 ? (
        <div className="space-y-2.5">
          {anomalies.map((a) => (
            <div key={a.shift.id} className={cn('flex items-start gap-3 rounded-xl border p-3.5', SEV_STYLE[a.severity])}>
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-alfa-red text-white">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-alfa-ink">{a.message}</span>
                  <Badge tone={a.severity === 'high' ? 'red' : 'amber'} size="sm">
                    {a.severity === 'high' ? 'Высокий приоритет' : 'Проверить'}
                  </Badge>
                </div>
                <div className="mt-1 text-sm text-muted">
                  Выручка {formatRub(a.shift.revenue)} · расход {formatRub(a.shift.fuelExpense + a.shift.partsExpense)} ·
                  доля {Math.round(a.ratio * 100)}% при норме {Math.round(RADAR_PERSONA.normCostRatio * 100)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm text-risk-low">
          <ShieldCheck className="h-4 w-4" />
          Аномалий не обнаружено — расход сходится с выручкой.
        </div>
      )}

      {/* Все смены */}
      <div className="mt-4 border-t border-line pt-4">
        <div className="mb-2 text-xs font-medium text-muted">Проверено смен: {SHIFTS.length}</div>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {SHIFTS.map((s) => {
            const ratio = (s.fuelExpense + s.partsExpense) / s.revenue;
            const bad = flagged.has(s.id);
            return (
              <div
                key={s.id}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2 text-sm',
                  bad ? 'bg-alfa-red-50/60' : 'bg-bg',
                )}
              >
                <span className={cn('font-medium', bad ? 'text-alfa-red' : 'text-alfa-graphite')}>{s.label}</span>
                <span className={cn('tabular-nums', bad ? 'font-semibold text-alfa-red' : 'text-muted')}>
                  {Math.round(ratio * 100)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

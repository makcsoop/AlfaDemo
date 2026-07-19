import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { CalendarClock, ArrowDownLeft, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { Card } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { formatRub, formatRubCompact } from '@/lib/format';
import { buildCashCalendar } from '@/lib/financialRadar';
import { INFLOWS, OUTFLOWS, RADAR_PERSONA } from '@/mock/financialRadar';

function offsetDate(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function CashCalendar() {
  const calendar = buildCashCalendar(RADAR_PERSONA.balance, INFLOWS, OUTFLOWS);
  const gapPoint = calendar.gap ? calendar.points.find((p) => p.day === calendar.gap!.day) : null;

  return (
    <Card>
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-alfa-ink">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-alfa-red-50 text-alfa-red">
          <CalendarClock className="h-4 w-4" />
        </span>
        Кассовый календарь
      </div>
      <div className="mb-3 text-xs text-muted">
        Поступления от агрегаторов (с отсрочкой) против предоплат поставщикам
      </div>

      {/* Прогноз разрыва */}
      {calendar.gap && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-alfa-red/30 bg-alfa-red-50/60 px-3.5 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-alfa-red" />
          <div className="text-sm">
            <span className="font-semibold text-alfa-ink">
              Кассовый разрыв через {calendar.gap.day} дн. — {offsetDate(calendar.gap.day)}
            </span>
            <div className="text-muted">
              Прогноз баланса: {formatRub(calendar.gap.amount)}. Максимальный дефицит — {formatRub(calendar.maxDeficit)}.
            </div>
          </div>
        </div>
      )}

      {/* График баланса */}
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={calendar.points} margin={{ top: 8, right: 8, bottom: 4, left: 4 }}>
            <defs>
              <linearGradient id="radar-balance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF3124" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#EF3124" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#EDEEF1" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#9AA0AA' }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={54}
              tick={{ fontSize: 11, fill: '#9AA0AA' }}
              tickFormatter={(v) => formatRubCompact(Number(v))}
            />
            <Tooltip content={<BalanceTooltip />} cursor={{ stroke: '#D6D8DE' }} />
            <ReferenceLine y={0} stroke="#C9CCD2" strokeDasharray="4 4" />
            <Area type="monotone" dataKey="balance" stroke="#EF3124" strokeWidth={2.5} fill="url(#radar-balance)" />
            {gapPoint && (
              <ReferenceDot x={gapPoint.label} y={gapPoint.balance} r={5} fill="#EF3124" stroke="#fff" strokeWidth={2} isFront />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* События календаря */}
      <div className="mt-4 space-y-1.5">
        {[...INFLOWS.map((i) => ({ kind: 'in' as const, day: i.inDays, title: i.source, amount: i.amount })),
          ...OUTFLOWS.map((o) => ({ kind: 'out' as const, day: o.inDays, title: `${o.supplier}: ${o.purpose}`, amount: o.amount }))]
          .sort((a, b) => a.day - b.day)
          .map((e, idx) => (
            <div key={idx} className="flex items-center gap-3 rounded-lg bg-bg px-3 py-2 text-sm">
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                  e.kind === 'in' ? 'bg-emerald-50 text-risk-low' : 'bg-alfa-red-50 text-alfa-red',
                )}
              >
                {e.kind === 'in' ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-alfa-ink">{e.title}</div>
                <div className="text-xs text-muted">{offsetDate(e.day)} · через {e.day} дн.</div>
              </div>
              <span className={cn('shrink-0 font-semibold tabular-nums', e.kind === 'in' ? 'text-risk-low' : 'text-alfa-red')}>
                {e.kind === 'in' ? '+' : '−'}{formatRub(e.amount)}
              </span>
            </div>
          ))}
      </div>
    </Card>
  );
}

function BalanceTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 shadow-card">
      <div className="text-xs font-medium text-muted">{p.label}</div>
      <div className={cn('text-sm font-semibold', p.balance < 0 ? 'text-alfa-red' : 'text-alfa-ink')}>
        Баланс: {formatRub(p.balance)}
      </div>
      {p.events?.length > 0 && <div className="mt-1 text-xs text-muted">{p.events.join(', ')}</div>}
    </div>
  );
}

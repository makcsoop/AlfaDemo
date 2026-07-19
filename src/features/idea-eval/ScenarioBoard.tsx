import { useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Check, TrendingUp } from 'lucide-react';
import { Card } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import type { Scenario } from '@/lib/schema';
import { formatPercent, formatRub, formatRubCompact } from '@/lib/format';

/** Цвета сценариев — согласованы с флагманским демо-сценарием. */
const COLORS: Record<string, string> = {
  optimistic: '#12A150',
  base: '#EF3124',
  negative: '#F5A524',
};

/** Порядок вывода табов: от оптимистичного к негативному. */
const ORDER = ['optimistic', 'base', 'negative'];

export interface ScenarioBoardProps {
  scenarios: Scenario[];
}

export function ScenarioBoard({ scenarios }: ScenarioBoardProps) {
  const ordered = [...scenarios].sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
  const [activeId, setActiveId] = useState(() => (scenarios.some((s) => s.id === 'base') ? 'base' : ordered[0]?.id));
  const active = ordered.find((s) => s.id === activeId) ?? ordered[0];

  if (!active) return null;

  return (
    <Card>
      {/* Табы сценариев */}
      <div className="flex flex-wrap gap-2">
        {ordered.map((s) => {
          const on = s.id === active.id;
          const color = COLORS[s.id] ?? '#EF3124';
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveId(s.id)}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors',
                on ? 'border-transparent text-white' : 'border-line bg-surface text-alfa-graphite hover:bg-bg',
              )}
              style={on ? { backgroundColor: color } : undefined}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: on ? 'white' : color }}
              />
              {s.name}
              <span className={cn('text-xs', on ? 'text-white/80' : 'text-muted')}>
                {formatPercent(s.probability)}
              </span>
            </button>
          );
        })}
      </div>

      <ScenarioChart scenario={active} />

      <ScenarioMetrics scenario={active} />

      {active.assumptions && active.assumptions.length > 0 && (
        <div className="mt-5 rounded-xl bg-bg p-4">
          <div className="mb-2.5 text-sm font-semibold text-alfa-ink">При каких условиях</div>
          <ul className="space-y-2">
            {active.assumptions.map((a) => (
              <li key={a} className="flex items-start gap-2 text-sm text-alfa-graphite">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-risk-low" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

// ── График выручки/прибыли с точкой выхода в плюс ──────────────────────

function ScenarioChart({ scenario }: { scenario: Scenario }) {
  const color = COLORS[scenario.id] ?? '#EF3124';
  const breakEven = scenario.metrics?.breakEvenMonth ?? null;
  const bePoint = breakEven ? scenario.points[breakEven - 1] : null;
  const gradId = `rev-${scenario.id}`;

  return (
    <div className="mt-5 h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={scenario.points} margin={{ top: 10, right: 8, bottom: 4, left: 4 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.18} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#EDEEF1" vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: '#9AA0AA' }}
            tickFormatter={(m) => `${m}`}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={52}
            tick={{ fontSize: 11, fill: '#9AA0AA' }}
            tickFormatter={(v) => formatRubCompact(Number(v))}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#D6D8DE', strokeWidth: 1 }} />
          <ReferenceLine y={0} stroke="#C9CCD2" strokeDasharray="4 4" />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Выручка"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradId})`}
          />
          <Line type="monotone" dataKey="profit" name="Прибыль" stroke={color} strokeWidth={2.5} dot={false} />
          {bePoint && (
            <ReferenceDot
              x={bePoint.month}
              y={bePoint.profit}
              r={5}
              fill="#12A150"
              stroke="#FFFFFF"
              strokeWidth={2}
              isFront
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      {breakEven && (
        <div className="mt-1 flex items-center gap-1.5 text-xs text-risk-low">
          <TrendingUp className="h-3.5 w-3.5" />
          Выход прибыли в плюс — {breakEven}-й месяц
        </div>
      )}
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 shadow-card">
      <div className="mb-1 text-xs font-medium text-muted">Месяц {label}</div>
      <Row label="Выручка" value={formatRub(point.revenue)} />
      <Row label="Расходы" value={formatRub(point.costs)} />
      <Row label="Прибыль" value={formatRub(point.profit)} strong />
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-6 text-sm">
      <span className="text-muted">{label}</span>
      <span className={cn(strong ? 'font-semibold text-alfa-ink' : 'text-alfa-graphite')}>{value}</span>
    </div>
  );
}

// ── Ключевые цифры сценария ────────────────────────────────────────────

function ScenarioMetrics({ scenario }: { scenario: Scenario }) {
  const m = scenario.metrics;
  if (!m) return null;
  const payback = m.paybackMonth ? `${m.paybackMonth} мес` : '> 12 мес';

  return (
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Metric label="Оборот, ср/мес" value={formatRub(m.turnover)} />
      <Metric label="Маржа" value={formatPercent(m.margin)} />
      <Metric label="Окупаемость вложений" value={payback} />
      <Metric label="Кассовый разрыв" value={formatRub(m.cashGap)} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-base font-semibold text-alfa-ink">{value}</div>
    </div>
  );
}

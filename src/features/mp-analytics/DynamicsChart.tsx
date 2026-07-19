import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card } from '@/shared/ui';
import { formatRub, formatRubCompact } from '@/lib/format';
import type { TurnoverPoint } from '@/lib/unitEconomics';

/** Динамика оборота по месяцам + прогноз на 3 месяца (пунктир). */
export function DynamicsChart({ points }: { points: TurnoverPoint[] }) {
  return (
    <Card>
      <div className="mb-1 text-sm font-semibold text-alfa-ink">Динамика оборота и прогноз</div>
      <div className="mb-3 text-xs text-muted">Помесячный оборот по всем SKU с прогнозом по тренду</div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 8, right: 8, bottom: 4, left: 4 }}>
            <defs>
              <linearGradient id="mp-turnover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF3124" stopOpacity={0.16} />
                <stop offset="100%" stopColor="#EF3124" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#EDEEF1" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#9AA0AA' }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={54}
              tick={{ fontSize: 11, fill: '#9AA0AA' }}
              tickFormatter={(v) => formatRubCompact(Number(v))}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#D6D8DE' }} />
            <Legend
              formatter={(v) => <span className="text-xs text-muted">{v === 'actual' ? 'Факт' : 'Прогноз'}</span>}
            />
            <Area type="monotone" dataKey="actual" name="actual" stroke="#EF3124" strokeWidth={2.5} fill="url(#mp-turnover)" connectNulls />
            <Line
              type="monotone"
              dataKey="forecast"
              name="forecast"
              stroke="#9AA0AA"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as TurnoverPoint;
  const value = point.actual ?? point.forecast ?? 0;
  const isForecast = point.actual == null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 shadow-card">
      <div className="text-xs font-medium text-muted">{isForecast ? `Прогноз ${label}` : `Месяц ${label}`}</div>
      <div className="text-sm font-semibold text-alfa-ink">{formatRub(value)}</div>
    </div>
  );
}

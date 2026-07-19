import type { ReactNode } from 'react';
import { MapPin, Store, TrendingUp, Users } from 'lucide-react';
import { Card } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import type { Market } from '@/lib/schema';
import { formatRub } from '@/lib/format';

const MONTHS_SHORT = ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'];

const COMPETITION: Record<Market['competition'], { label: string; tone: string }> = {
  low: { label: 'Низкая', tone: 'text-risk-low' },
  medium: { label: 'Средняя', tone: 'text-amber-600' },
  high: { label: 'Высокая', tone: 'text-alfa-red' },
};

export interface MarketBlockProps {
  market: Market;
}

export function MarketBlock({ market }: MarketBlockProps) {
  return (
    <Card>
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-alfa-ink">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-alfa-red-50 text-alfa-red">
          <Store className="h-4 w-4" />
        </span>
        Рынок и окружение
      </div>

      <p className="text-sm text-alfa-graphite">{market.demand}</p>

      {/* Сезонность */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-alfa-ink">Сезонность спроса</span>
          <span className="text-xs text-muted">коэффициент по месяцам</span>
        </div>
        <Seasonality values={market.seasonality} />
        <p className="mt-2 text-xs text-muted">{market.seasonalityNote}</p>
      </div>

      {/* Карта района + конкуренция */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-bg p-3">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-alfa-ink">
            <MapPin className="h-4 w-4 text-alfa-red" />
            Конкуренты рядом
          </div>
          <DistrictMap peers={market.peers.length} />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-muted">Конкуренция</span>
            <span className={cn('font-semibold', COMPETITION[market.competition].tone)}>
              {COMPETITION[market.competition].label}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Stat
            icon={<Users className="h-4 w-4" />}
            label="Средние обороты похожих"
            value={`${formatRub(market.peerAvgTurnover)}/мес`}
          />
          <Stat icon={<TrendingUp className="h-4 w-4" />} label="Средний чек в нише" value={formatRub(market.avgCheck)} />
          <div className="rounded-xl border border-line bg-surface p-3">
            <div className="text-xs text-muted">Похожие бизнесы района</div>
            <ul className="mt-1.5 space-y-1">
              {market.peers.map((p) => (
                <li key={p.label} className="flex items-center justify-between text-sm">
                  <span className="text-alfa-graphite">{p.label}</span>
                  <span className="font-medium text-alfa-ink">{formatRub(p.monthlyTurnover)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted">{market.source}.</p>
    </Card>
  );
}

/** Мини-график сезонности: 12 столбиков, высота ∝ коэффициенту. */
function Seasonality({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-16 items-end gap-1">
      {values.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-alfa-red/70"
            style={{ height: `${Math.max(6, (v / max) * 100)}%` }}
            title={`${MONTHS_SHORT[i]}: ×${v.toFixed(2)}`}
          />
          <span className="text-[10px] leading-none text-muted">{MONTHS_SHORT[i]}</span>
        </div>
      ))}
    </div>
  );
}

/** Статичная стилизованная карта района: вы в центре, конкуренты вокруг. */
function DistrictMap({ peers }: { peers: number }) {
  const positions = [
    { x: 20, y: 24 },
    { x: 80, y: 20 },
    { x: 24, y: 78 },
    { x: 82, y: 74 },
    { x: 62, y: 40 },
  ].slice(0, Math.max(2, peers));

  return (
    <svg viewBox="0 0 100 92" className="w-full" role="img" aria-label="Карта района с конкурентами">
      <rect x="0" y="0" width="100" height="92" rx="6" fill="#F5F6F8" />
      {/* стилизованные улицы */}
      <line x1="0" y1="46" x2="100" y2="46" stroke="#E4E6EA" strokeWidth="3" />
      <line x1="50" y1="0" x2="50" y2="92" stroke="#E4E6EA" strokeWidth="3" />
      {positions.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.4" fill="#9AA0AA" />
      ))}
      {/* вы */}
      <circle cx="50" cy="46" r="7" fill="#EF3124" opacity="0.14" />
      <circle cx="50" cy="46" r="4" fill="#EF3124" />
    </svg>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-alfa-red-50 text-alfa-red">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-muted">{label}</div>
        <div className="text-sm font-semibold text-alfa-ink">{value}</div>
      </div>
    </div>
  );
}

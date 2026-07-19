import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Eye, MousePointerClick, Users, Percent } from 'lucide-react';
import { Card } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { formatNumber, formatPercent } from '@/lib/format';
import { getSegment, IMPRESSION_LOG_SEED } from '@/mock/audience';
import { useStorefrontStore } from '@/store/useStorefrontStore';
import { computeReach } from './storefront';

interface LiveEvent {
  id: string;
  segmentId: string;
  kind: 'view' | 'click';
  at: number; // timestamp
}

const now = () => Date.now();

export function MetricsPanel() {
  const settings = useStorefrontStore((s) => s.settings);
  const metrics = useMemo(() => computeReach(settings), [settings]);

  // Матчнутые сегменты — из них «прилетают» живые показы.
  const matched = metrics.segments.filter((s) => s.reached > 0);
  const matchedRef = useRef(matched);
  matchedRef.current = matched;

  const [events, setEvents] = useState<LiveEvent[]>(() =>
    IMPRESSION_LOG_SEED.map((e) => ({ id: e.id, segmentId: e.segmentId, kind: e.kind, at: now() - e.secondsAgo * 1000 })),
  );
  const [today, setToday] = useState({ views: 0, clicks: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const pool = matchedRef.current;
      if (pool.length === 0) return;
      // Взвешенный выбор сегмента по охвату.
      const total = pool.reduce((s, x) => s + x.reached, 0);
      let r = Math.random() * total;
      const seg = pool.find((x) => (r -= x.reached) <= 0) ?? pool[0];
      const kind: LiveEvent['kind'] = Math.random() < 0.28 ? 'click' : 'view';

      setEvents((prev) => [{ id: `l${now()}`, segmentId: seg.id, kind, at: now() }, ...prev].slice(0, 6));
      setToday((t) => ({ views: t.views + 1, clicks: t.clicks + (kind === 'click' ? 1 : 0) }));
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-alfa-ink">Показы и переходы</div>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-risk-low" />
          обновляется вживую
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi icon={<Users className="h-4 w-4" />} label="Охват" value={formatNumber(metrics.reached)} />
        <Kpi
          icon={<Eye className="h-4 w-4" />}
          label="Показы"
          value={formatNumber(metrics.impressions)}
          delta={today.views}
        />
        <Kpi
          icon={<MousePointerClick className="h-4 w-4" />}
          label="Переходы"
          value={formatNumber(metrics.clicks)}
          delta={today.clicks}
        />
        <Kpi icon={<Percent className="h-4 w-4" />} label="CTR" value={formatPercent(metrics.ctr, 1)} />
      </div>

      {/* Разбивка по сегментам */}
      <div className="mt-5">
        <div className="mb-2 text-sm font-medium text-alfa-ink">Кому показываем</div>
        {matched.length === 0 ? (
          <p className="text-sm text-muted">Аудитория пуста — расширьте радиус, интересы или диапазон трат.</p>
        ) : (
          <div className="space-y-2">
            {matched.slice(0, 5).map((s) => {
              const share = metrics.reached > 0 ? s.reached / metrics.reached : 0;
              const seg = getSegment(s.id);
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="flex w-40 shrink-0 items-center gap-1.5 text-sm text-alfa-graphite">
                    {seg && <seg.icon className="h-3.5 w-3.5 text-muted" />}
                    <span className="truncate">{s.label}</span>
                  </div>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg">
                    <div className="h-full rounded-full bg-alfa-red" style={{ width: `${Math.round(share * 100)}%` }} />
                  </div>
                  <span className="w-16 shrink-0 text-right text-sm font-medium text-alfa-ink">
                    {formatNumber(s.reached)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Живой лог показов */}
      <div className="mt-5 border-t border-line pt-4">
        <div className="mb-2 text-sm font-medium text-alfa-ink">Лента показов</div>
        <ul className="space-y-1.5">
          {events.map((e) => {
            const seg = getSegment(e.segmentId);
            return (
              <li key={e.id} className="flex items-center gap-2 text-sm">
                <span
                  className={cn(
                    'inline-flex h-5 w-5 items-center justify-center rounded-full',
                    e.kind === 'click' ? 'bg-alfa-red-50 text-alfa-red' : 'bg-bg text-muted',
                  )}
                >
                  {e.kind === 'click' ? <MousePointerClick className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </span>
                <span className="text-alfa-graphite">
                  {seg?.label ?? 'Аудитория'} — {e.kind === 'click' ? 'переход в карточку' : 'показ'}
                </span>
                <span className="ml-auto text-xs text-muted">{formatAgo(e.at)}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}

function Kpi({ icon, label, value, delta }: { icon: ReactNode; label: string; value: string; delta?: number }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted">
        <span className="text-alfa-red">{icon}</span>
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-lg font-bold text-alfa-ink">{value}</span>
        {delta ? <span className="text-xs font-medium text-risk-low">+{delta}</span> : null}
      </div>
    </div>
  );
}

function formatAgo(at: number): string {
  const sec = Math.max(1, Math.round((now() - at) / 1000));
  if (sec < 60) return `${sec} сек назад`;
  const min = Math.round(sec / 60);
  return `${min} мин назад`;
}

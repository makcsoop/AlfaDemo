import { useMemo, useState } from 'react';
import { MapPin, CalendarClock, ShieldCheck, ChevronRight, Clock, SearchX } from 'lucide-react';
import { Card, Badge, EmptyState, Button } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { formatRub } from '@/lib/format';
import { matchTenders } from '@/lib/matchTenders';
import { TENDER_PROFILE } from '@/mock/tenders';
import { MatchScore, VerdictBadge } from './MatchScore';

type RegionFilter = 'all' | 'Казань' | 'Татарстан' | 'Москва';
type DepositFilter = 'all' | 'with' | 'without';

export function TenderList({ onOpen }: { onOpen: (id: string) => void }) {
  const scored = useMemo(() => matchTenders(TENDER_PROFILE), []);
  const [region, setRegion] = useState<RegionFilter>('all');
  const [deposit, setDeposit] = useState<DepositFilter>('all');

  const filtered = scored.filter((s) => {
    if (region !== 'all' && s.tender.region !== region) return false;
    if (deposit === 'with' && !s.tender.requiresDeposit) return false;
    if (deposit === 'without' && s.tender.requiresDeposit) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Фильтры */}
      <div className="flex flex-wrap items-center gap-4">
        <FilterGroup
          label="Регион"
          value={region}
          onChange={(v) => setRegion(v as RegionFilter)}
          options={[
            { value: 'all', label: 'Все' },
            { value: 'Казань', label: 'Казань' },
            { value: 'Татарстан', label: 'Татарстан' },
            { value: 'Москва', label: 'Москва' },
          ]}
        />
        <FilterGroup
          label="Обеспечение"
          value={deposit}
          onChange={(v) => setDeposit(v as DepositFilter)}
          options={[
            { value: 'all', label: 'Все' },
            { value: 'with', label: 'С гарантией' },
            { value: 'without', label: 'Без' },
          ]}
        />
        <span className="ml-auto text-sm text-muted">Найдено: {filtered.length}</span>
      </div>

      {/* Список */}
      {filtered.length === 0 && (
        <Card padded={false}>
          <EmptyState
            icon={SearchX}
            title="По фильтрам ничего не нашлось"
            description="Попробуйте расширить регион или убрать фильтр по обеспечению."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setRegion('all');
                  setDeposit('all');
                }}
              >
                Сбросить фильтры
              </Button>
            }
          />
        </Card>
      )}
      <div className="space-y-3">
        {filtered.map(({ tender, score, verdict }) => {
          const urgent = tender.submissionInDays <= 5;
          return (
            <Card key={tender.id} interactive onClick={() => onOpen(tender.id)} className="!p-4">
              <div className="flex items-center gap-4">
                <MatchScore score={score} verdict={verdict} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge tone="neutral" size="sm">
                      {tender.law}
                    </Badge>
                    {tender.requiresDeposit && (
                      <Badge tone="amber" size="sm">
                        <ShieldCheck className="h-3 w-3" />
                        Нужна гарантия
                      </Badge>
                    )}
                    <VerdictBadge verdict={verdict} />
                  </div>
                  <h3 className="mt-1.5 truncate text-[15px] font-semibold text-alfa-ink">{tender.title}</h3>
                  <p className="truncate text-sm text-muted">{tender.customer}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span className="font-semibold text-alfa-ink">{formatRub(tender.sum)}</span>
                    <span className="flex items-center gap-1 text-muted">
                      <MapPin className="h-3.5 w-3.5" />
                      {tender.region}
                    </span>
                    <span className={cn('flex items-center gap-1', urgent ? 'text-alfa-red' : 'text-muted')}>
                      {urgent ? <Clock className="h-3.5 w-3.5" /> : <CalendarClock className="h-3.5 w-3.5" />}
                      приём ещё {tender.submissionInDays} дн.
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function FilterGroup<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted">{label}:</span>
      <div className="inline-flex rounded-lg border border-line bg-bg p-0.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-md px-2.5 py-1 text-sm font-medium transition-colors',
              value === o.value ? 'bg-surface text-alfa-ink shadow-sm' : 'text-muted hover:text-alfa-graphite',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

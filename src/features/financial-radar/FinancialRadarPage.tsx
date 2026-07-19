import { PageHeader } from '@/features/_shared/PageHeader';
import { Badge } from '@/shared/ui';
import { RADAR_PERSONA } from '@/mock/financialRadar';
import { AnomalyRadar } from './AnomalyRadar';
import { CashCalendar } from './CashCalendar';
import { OverdraftOffer } from './OverdraftOffer';

export function FinancialRadarPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Блок 6 · Платёжный бизнес"
        title="Финансовый радар"
        description={`AI ловит аномалии «расход↔выручка» в реальном времени и предлагает мгновенный овердрафт под конкретную сделку. На примере персоны «${RADAR_PERSONA.name}».`}
        badge={RADAR_PERSONA.kind}
      />

      {/* Контекст персоны */}
      <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm">
        <span className="font-semibold text-alfa-ink">{RADAR_PERSONA.name}</span>
        <span className="text-muted">· {RADAR_PERSONA.city}</span>
        <Badge tone="neutral" size="sm">Остаток на счёте {new Intl.NumberFormat('ru-RU').format(RADAR_PERSONA.balance)} ₽</Badge>
        <span className="ml-auto text-xs text-muted">Боль отрасли: 100% предоплата поставщикам при отсрочке от агрегаторов</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <AnomalyRadar />
        <CashCalendar />
      </div>

      <div className="mt-5">
        <OverdraftOffer />
      </div>
    </div>
  );
}

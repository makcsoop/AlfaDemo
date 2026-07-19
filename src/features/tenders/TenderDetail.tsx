import type { ReactNode } from 'react';
import { ArrowLeft, MapPin, Landmark, CalendarClock, Wallet, ShieldCheck } from 'lucide-react';
import { Card, Badge, EmptyState } from '@/shared/ui';
import { formatRub, formatRubCompact } from '@/lib/format';
import { scoreTender } from '@/lib/matchTenders';
import { getTender, TENDER_PROFILE } from '@/mock/tenders';
import { MatchScore, VerdictBadge } from './MatchScore';
import { ComplianceCheck } from './ComplianceCheck';
import { DocumentWizard } from './DocumentWizard';
import { TenderTimeline } from './TenderTimeline';
import { GuaranteeBlock } from './GuaranteeBlock';

export function TenderDetail({ tenderId, onBack }: { tenderId: string; onBack: () => void }) {
  const tender = getTender(tenderId);
  if (!tender) {
    return <EmptyState title="Тендер не найден" description="Вернитесь к списку подобранных закупок." />;
  }
  const scored = scoreTender(tender, TENDER_PROFILE);

  return (
    <div className="animate-fade-up space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-alfa-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        К списку тендеров
      </button>

      {/* Шапка */}
      <Card>
        <div className="flex items-start gap-4">
          <MatchScore score={scored.score} verdict={scored.verdict} size={64} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="neutral">{tender.law}</Badge>
              {tender.requiresDeposit && (
                <Badge tone="amber">
                  <ShieldCheck className="h-3 w-3" />
                  Обеспечение {tender.depositPercent}%
                </Badge>
              )}
              <VerdictBadge verdict={scored.verdict} />
            </div>
            <h2 className="mt-2 text-xl font-bold text-alfa-ink">{tender.title}</h2>
            <p className="text-sm text-muted">{tender.customer}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Fact icon={<Wallet className="h-4 w-4" />} label="НМЦК" value={formatRub(tender.sum)} />
          <Fact icon={<MapPin className="h-4 w-4" />} label="Регион" value={tender.region} />
          <Fact icon={<CalendarClock className="h-4 w-4" />} label="Приём заявок" value={`ещё ${tender.submissionInDays} дн.`} />
          <Fact icon={<Landmark className="h-4 w-4" />} label="Исполнение" value={`${tender.durationDays} дн.`} />
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <div className="mb-2 text-sm font-semibold text-alfa-ink">Описание закупки</div>
            <p className="text-sm text-alfa-graphite">{tender.description}</p>
          </Card>
          <ComplianceCheck scored={scored} />
          <DocumentWizard tenderId={tender.id} documents={tender.documents} />
        </div>

        <div className="space-y-5">
          <Card>
            <div className="mb-3 text-sm font-semibold text-alfa-ink">Требования</div>
            <dl className="space-y-2.5 text-sm">
              <Req label="ОКВЭД" value={tender.okved.join(', ')} />
              <Req label="Мин. оборот" value={tender.minAnnualTurnover ? `${formatRubCompact(tender.minAnnualTurnover)}/год` : 'нет'} />
              <Req label="Опыт" value={tender.minExperienceMonths ? `от ${tender.minExperienceMonths} мес` : 'не требуется'} />
              <Req label="Обеспечение" value={tender.requiresDeposit ? `${tender.depositPercent}% (${formatRub(Math.round(tender.sum * tender.depositPercent / 100))})` : 'нет'} />
            </dl>
          </Card>
          <TenderTimeline tender={tender} />
        </div>
      </div>

      {/* Часть Б — гарантия, только для тендеров с обеспечением */}
      {tender.requiresDeposit && <GuaranteeBlock tender={tender} />}
    </div>
  );
}

function Fact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted">
        <span className="text-alfa-red">{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-alfa-ink">{value}</div>
    </div>
  );
}

function Req({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-alfa-ink">{value}</dd>
    </div>
  );
}

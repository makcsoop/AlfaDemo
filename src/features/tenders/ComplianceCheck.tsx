import { Check, Minus, X } from 'lucide-react';
import { Card } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import type { CriterionStatus, ScoredTender } from '@/lib/matchTenders';

const STATUS_ICON: Record<CriterionStatus, typeof Check> = {
  pass: Check,
  partial: Minus,
  fail: X,
};

const STATUS_STYLE: Record<CriterionStatus, string> = {
  pass: 'bg-emerald-50 text-risk-low',
  partial: 'bg-amber-50 text-amber-600',
  fail: 'bg-alfa-red-50 text-alfa-red',
};

/** Чек-лист соответствия требованиям тендера. */
export function ComplianceCheck({ scored }: { scored: ScoredTender }) {
  const passCount = scored.criteria.filter((c) => c.status === 'pass').length;

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-alfa-ink">Соответствие требованиям</div>
        <span className="text-sm text-muted">
          {passCount} из {scored.criteria.length} критериев
        </span>
      </div>

      <div className="space-y-2.5">
        {scored.criteria.map((c) => {
          const Icon = STATUS_ICON[c.status];
          return (
            <div key={c.id} className="flex items-start gap-3">
              <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full', STATUS_STYLE[c.status])}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-alfa-ink">{c.label}</div>
                <div className="text-sm text-muted">{c.detail}</div>
              </div>
            </div>
          );
        })}
      </div>

      {scored.blockers.length > 0 ? (
        <div className="mt-4 rounded-xl bg-alfa-red-50 px-3.5 py-2.5 text-sm text-alfa-red">
          Участие затруднено: {scored.blockers.join('; ')}.
        </div>
      ) : scored.missing.length > 0 ? (
        <div className="mt-4 rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm text-amber-700">
          Можно участвовать, но стоит усилить: {scored.missing.join('; ')}.
        </div>
      ) : (
        <div className="mt-4 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm text-risk-low">
          Вы полностью соответствуете требованиям — можно подавать заявку.
        </div>
      )}
    </Card>
  );
}

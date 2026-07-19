import { Check, Loader2, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { formatRub } from '@/lib/format';
import { GUARANTEE_STEPS } from '@/mock/guarantee';
import type { GuaranteeCalc } from '@/lib/guarantee';
import type { Tender } from '@/mock/tenders';
import { useTendersStore } from '@/store/useTendersStore';

/** Мастер выпуска гарантии: 3–4 шага, статус «одобрено», привязка к тендеру. */
export function GuaranteeWizard({ tender, calc }: { tender: Tender; calc: GuaranteeCalc }) {
  const guarantee = useTendersStore((s) => s.guarantee);
  const startGuarantee = useTendersStore((s) => s.startGuarantee);
  const advanceGuarantee = useTendersStore((s) => s.advanceGuarantee);
  const resetGuarantee = useTendersStore((s) => s.resetGuarantee);

  const activeHere = guarantee?.tenderId === tender.id;
  const step = activeHere ? guarantee!.step : -1;
  const issued = activeHere && guarantee!.issued;

  // Ещё не начали для этого тендера.
  if (!activeHere) {
    return (
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-alfa-ink">Оформление гарантии</div>
            <div className="text-sm text-muted">3–4 шага, без визита в банк. Данные подставим автоматически.</div>
          </div>
          <Button onClick={() => startGuarantee(tender.id)}>
            Оформить гарантию
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-4 text-sm font-semibold text-alfa-ink">Оформление гарантии</div>

      <ol className="space-y-3">
        {GUARANTEE_STEPS.map((s, i) => {
          const state = i < step || issued ? 'done' : i === step ? 'active' : 'upcoming';
          return (
            <li key={s.id} className="flex items-start gap-3">
              <span
                className={cn(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  state === 'done' && 'bg-risk-low text-white',
                  state === 'active' && 'bg-alfa-red text-white',
                  state === 'upcoming' && 'bg-bg text-muted',
                )}
              >
                {state === 'done' ? <Check className="h-3.5 w-3.5" /> : state === 'active' && !issued ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : i + 1}
              </span>
              <div className="min-w-0">
                <div className={cn('text-sm font-medium', state === 'upcoming' ? 'text-muted' : 'text-alfa-ink')}>
                  {s.title}
                </div>
                <div className="text-xs text-muted">{s.description}</div>
              </div>
            </li>
          );
        })}
      </ol>

      {issued ? (
        <div className="mt-4 rounded-xl bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-risk-low">
            <ShieldCheck className="h-5 w-5" />
            Гарантия одобрена
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <Kv label="Сумма гарантии" value={formatRub(calc.amount)} />
            <Kv label="Стоимость" value={formatRub(calc.price)} />
            <Kv label="Тариф" value={calc.tariff.label} />
            <Kv label="Привязана к тендеру" value={tender.title} />
          </div>
          <button
            type="button"
            onClick={resetGuarantee}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-alfa-red"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Оформить заново
          </button>
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-between gap-4">
          <span className="text-sm text-muted">
            Шаг {step + 1} из {GUARANTEE_STEPS.length}
          </span>
          <Button onClick={advanceGuarantee}>
            {step >= GUARANTEE_STEPS.length - 2 ? 'Выпустить гарантию' : 'Продолжить'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function Kv({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className="truncate font-medium text-alfa-ink">{value}</div>
    </div>
  );
}

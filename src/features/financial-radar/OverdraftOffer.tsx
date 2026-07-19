import { useEffect, useState } from 'react';
import { Zap, HelpCircle, ArrowRight, Check, Loader2, CheckCircle2, RotateCcw, CalendarCheck } from 'lucide-react';
import { Card, Button, Disclaimer } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { formatPercent, formatRub } from '@/lib/format';
import { calcOverdraft, suggestOverdraft } from '@/lib/financialRadar';
import { INFLOWS, OUTFLOWS, OVERDRAFT_PARAMS, OVERDRAFT_STEPS, RADAR_DISCLAIMER, RADAR_PERSONA } from '@/mock/financialRadar';
import { useProgressStore } from '@/store/useProgressStore';

function offsetDate(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function OverdraftOffer() {
  const suggestion = suggestOverdraft(RADAR_PERSONA.balance, INFLOWS, OUTFLOWS);
  const completeStep = useProgressStore((s) => s.complete);
  const [step, setStep] = useState(-1);

  const approved = step >= OVERDRAFT_STEPS.length - 1;
  useEffect(() => {
    if (approved) completeStep('/radar');
  }, [approved, completeStep]);

  if (!suggestion) {
    return (
      <Card>
        <div className="text-sm font-semibold text-alfa-ink">Овердрафт под сделку</div>
        <div className="mt-2 text-sm text-muted">Кассовых разрывов не прогнозируется — финансирование не требуется.</div>
      </Card>
    );
  }

  const { invoice, cover, termDays } = suggestion;
  const calc = calcOverdraft(invoice.amount, termDays, OVERDRAFT_PARAMS);

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-alfa-ink">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-alfa-red-50 text-alfa-red">
          <Zap className="h-4 w-4" />
        </span>
        Овердрафт под сделку
      </div>

      {/* Пояснение */}
      <div className="rounded-xl bg-bg p-3.5">
        <div className="flex items-center gap-1.5 text-sm font-medium text-alfa-ink">
          <HelpCircle className="h-4 w-4 text-alfa-red" />
          Зачем это
        </div>
        <p className="mt-1.5 text-sm text-alfa-graphite">
          Поставщик требует предоплату сейчас, а выручка от агрегатора придёт позже. Банк закрывает разрыв:
          оплачиваете счёт сразу, а овердрафт списывается автоматически в день поступления выручки.
        </p>
      </div>

      {/* Сделка */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-3.5">
          <div className="text-xs text-muted">Счёт к оплате</div>
          <div className="mt-0.5 text-sm font-semibold text-alfa-ink">{invoice.supplier}</div>
          <div className="text-xs text-muted">{invoice.purpose}</div>
          <div className="mt-2 text-lg font-bold text-alfa-ink">{formatRub(invoice.amount)}</div>
          <div className="text-xs text-muted">оплатить через {invoice.inDays} дн. · {offsetDate(invoice.inDays)}</div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-3.5">
          <div className="text-xs text-muted">Источник погашения</div>
          <div className="mt-0.5 text-sm font-semibold text-alfa-ink">{cover.source}</div>
          <div className="text-xs text-muted">поступление от агрегатора</div>
          <div className="mt-2 text-lg font-bold text-risk-low">{formatRub(cover.amount)}</div>
          <div className="text-xs text-muted">придёт через {cover.inDays} дн. · {offsetDate(cover.inDays)}</div>
        </div>
      </div>

      {/* Калькулятор */}
      <div className="mt-4 rounded-xl border border-line bg-bg p-4">
        <div className="mb-3 text-sm font-semibold text-alfa-ink">Калькулятор стоимости</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <CalcCell label="Сумма" value={formatRub(calc.amount)} />
          <CalcCell label="Срок" value={`${calc.termDays} дн.`} />
          <CalcCell label="Ставка" value={`${formatPercent(calc.annualRate)} годовых`} />
          <CalcCell label="Стоимость" value={formatRub(calc.cost)} accent />
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-surface px-3.5 py-2.5 text-sm">
          <CalendarCheck className="h-4 w-4 shrink-0 text-risk-low" />
          <span className="text-alfa-graphite">
            Автопогашение <span className="font-medium text-alfa-ink">{formatRub(calc.total)}</span> в день выручки —
            {' '}{offsetDate(cover.inDays)}
          </span>
        </div>
      </div>

      {/* Мастер */}
      <div className="mt-4">
        <Wizard step={step} onStart={() => setStep(0)} onAdvance={() => setStep((s) => Math.min(s + 1, OVERDRAFT_STEPS.length - 1))} onReset={() => setStep(-1)} invoice={invoice.supplier} total={calc.total} repay={offsetDate(cover.inDays)} />
      </div>

      <Disclaimer className="mt-4">{RADAR_DISCLAIMER}</Disclaimer>
    </Card>
  );
}

function CalcCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg bg-surface p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className={cn('mt-0.5 text-sm font-bold', accent ? 'text-alfa-red' : 'text-alfa-ink')}>{value}</div>
    </div>
  );
}

function Wizard({
  step,
  onStart,
  onAdvance,
  onReset,
  invoice,
  total,
  repay,
}: {
  step: number;
  onStart: () => void;
  onAdvance: () => void;
  onReset: () => void;
  invoice: string;
  total: number;
  repay: string;
}) {
  const last = OVERDRAFT_STEPS.length - 1;
  const approved = step >= last;

  if (step < 0) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-4">
        <div className="text-sm text-muted">Оформление за 3–4 шага, без визита в банк.</div>
        <Button onClick={onStart}>
          Оформить овердрафт
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <ol className="space-y-3">
        {OVERDRAFT_STEPS.map((s, i) => {
          const state = i < step || approved ? 'done' : i === step ? 'active' : 'upcoming';
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
                {state === 'done' ? <Check className="h-3.5 w-3.5" /> : state === 'active' && !approved ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : i + 1}
              </span>
              <div className="min-w-0">
                <div className={cn('text-sm font-medium', state === 'upcoming' ? 'text-muted' : 'text-alfa-ink')}>{s.title}</div>
                <div className="text-xs text-muted">{s.description}</div>
              </div>
            </li>
          );
        })}
      </ol>

      {approved ? (
        <div className="mt-4 rounded-xl bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-risk-low">
            <CheckCircle2 className="h-5 w-5" />
            Овердрафт одобрен
          </div>
          <p className="mt-1.5 text-sm text-alfa-graphite">
            Счёт «{invoice}» можно оплатить сейчас. Автосписание {formatRub(total)} — {repay}.
          </p>
          <button type="button" onClick={onReset} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-alfa-red">
            <RotateCcw className="h-3.5 w-3.5" />
            Оформить заново
          </button>
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-between gap-4">
          <span className="text-sm text-muted">Шаг {step + 1} из {OVERDRAFT_STEPS.length}</span>
          <Button onClick={onAdvance}>
            {step >= last - 1 ? 'Одобрить овердрафт' : 'Продолжить'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

import { Sparkles, TrendingDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { formatPercent, formatRub } from '@/lib/format';
import { GUARANTEE_TARIFFS } from '@/mock/guarantee';
import type { GuaranteeCalc } from '@/lib/guarantee';

export interface GuaranteeCalculatorProps {
  calc: GuaranteeCalc;
  contractSum: number;
  onSumChange: (v: number) => void;
  eligible: boolean;
  onEligibleChange: (v: boolean) => void;
}

/** Экспресс-калькулятор гарантии: сумма контракта → сумма/стоимость, обычный vs льготный. */
export function GuaranteeCalculator({ calc, contractSum, onSumChange, eligible, onEligibleChange }: GuaranteeCalculatorProps) {
  return (
    <div>
      {/* Ввод суммы контракта */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-alfa-graphite">Сумма контракта (НМЦК)</label>
          <div className="flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-3.5">
            <input
              type="number"
              min={0}
              step={10_000}
              value={contractSum}
              onChange={(e) => onSumChange(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-transparent text-[15px] text-alfa-ink focus:outline-none"
            />
            <span className="text-sm text-muted">₽</span>
          </div>
        </div>
        <div className="rounded-xl bg-bg p-3">
          <div className="text-xs text-muted">Обеспечение заявки ({formatPercent(calc.securityPercent)})</div>
          <div className="mt-0.5 text-xl font-bold text-alfa-ink">{formatRub(calc.amount)}</div>
          <div className="text-xs text-muted">сумма банковской гарантии на {calc.termDays} дн.</div>
        </div>
      </div>

      {/* Признак льготной категории */}
      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface p-3.5">
        <input
          type="checkbox"
          checked={eligible}
          onChange={(e) => onEligibleChange(e.target.checked)}
          className="mt-0.5 h-4 w-4"
          style={{ accentColor: '#EF3124' }}
        />
        <span className="text-sm">
          <span className="font-medium text-alfa-ink">Новичок до 25 без кредитной истории</span>
          <span className="block text-muted">Льготная категория «Гарант для старта» — субсидированная ставка</span>
        </span>
      </label>

      {/* Сравнение тарифов */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <TariffCard
          label={GUARANTEE_TARIFFS.standard.label}
          rate={GUARANTEE_TARIFFS.standard.annualRate}
          price={calc.priceStandard}
          active={!eligible}
          muted
        />
        <TariffCard
          label={GUARANTEE_TARIFFS.preferential.label}
          rate={GUARANTEE_TARIFFS.preferential.annualRate}
          price={calc.pricePreferential}
          active={eligible}
          highlight
          disabled={!eligible}
        />
      </div>

      {/* Экономия */}
      {eligible && calc.savings > 0 && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-risk-low">
          <TrendingDown className="h-4 w-4" />
          Экономия по льготному тарифу: {formatRub(calc.savings)} против обычного
        </div>
      )}
      {!eligible && (
        <p className="mt-3 text-sm text-muted">
          Отметьте льготную категорию, чтобы увидеть субсидированную ставку для новичков.
        </p>
      )}
    </div>
  );
}

function TariffCard({
  label,
  rate,
  price,
  active,
  highlight,
  muted,
  disabled,
}: {
  label: string;
  rate: number;
  price: number;
  active?: boolean;
  highlight?: boolean;
  muted?: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-colors',
        active && highlight && 'border-alfa-red/40 bg-alfa-red-50/40 ring-1 ring-alfa-red/20',
        active && !highlight && 'border-line bg-surface',
        !active && 'border-line bg-surface opacity-70',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-alfa-ink">{label}</span>
        {highlight && (
          <span className="inline-flex items-center gap-1 rounded-full bg-alfa-red px-2 py-0.5 text-xs font-medium text-white">
            <Sparkles className="h-3 w-3" />
            старт
          </span>
        )}
      </div>
      <div className={cn('mt-2 text-2xl font-bold', disabled ? 'text-muted' : 'text-alfa-ink')}>{formatRub(price)}</div>
      <div className="text-xs text-muted">ставка {formatPercent(rate)} годовых · разовая комиссия</div>
      {active && <div className="mt-1 text-xs font-medium text-risk-low">ваш тариф</div>}
    </div>
  );
}

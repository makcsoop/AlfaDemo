import { useState, type ReactNode } from 'react';
import { Lightbulb, MapPin, Wallet, Landmark, Sparkles, Wand2 } from 'lucide-react';
import { Button, Card, Input } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import type { IdeaInput } from '@/lib/schema';
import { formatRub } from '@/lib/format';
import { suggestExpenses } from '@/mock/markets';
import { DEFAULT_IDEA_INPUT, DISTRICT_OPTIONS, NICHE_OPTIONS } from './ideaInputs';

export interface IdeaFormProps {
  initial: IdeaInput;
  onSubmit: (input: IdeaInput) => void;
}

const COMPETITION_HINT: Record<string, string> = {
  low: 'низкая конкуренция',
  medium: 'средняя конкуренция',
  high: 'высокая конкуренция',
};

export function IdeaForm({ initial, onSubmit }: IdeaFormProps) {
  const [form, setForm] = useState<IdeaInput>(initial);

  const set = <K extends keyof IdeaInput>(key: K, value: IdeaInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setExpense = (key: keyof IdeaInput['expenses'], value: number) =>
    setForm((f) => ({ ...f, expenses: { ...f.expenses, [key]: value } }));

  /** Смена ниши/района подтягивает типовые расходы (пока пользователь их не менял вручную). */
  const changeMarket = (patch: Partial<Pick<IdeaInput, 'niche' | 'district'>>) => {
    setForm((f) => {
      const niche = patch.niche ?? f.niche;
      const district = patch.district ?? f.district;
      return { ...f, niche, district, expenses: suggestExpenses(niche, district) };
    });
  };

  const totalExpenses = form.expenses.rent + form.expenses.payroll + form.expenses.goods + form.expenses.other;

  return (
    <form
      className="grid gap-5 lg:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      {/* Идея и рынок */}
      <div className="lg:col-span-2 space-y-5">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <SectionTitle icon={<Lightbulb className="h-4 w-4" />}>Идея и ниша</SectionTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setForm(DEFAULT_IDEA_INPUT)}
              title="Заполнить форму пресетом персоны «Кофейня Анны» для быстрого показа"
            >
              <Wand2 className="h-4 w-4 text-alfa-red" />
              Автозаполнить
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-alfa-graphite">Идея бизнеса</label>
              <textarea
                value={form.idea}
                onChange={(e) => set('idea', e.target.value)}
                rows={3}
                className={cn(
                  'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[15px] text-alfa-ink',
                  'placeholder:text-muted transition-shadow resize-none',
                  'focus:outline-none focus:border-alfa-red/50 focus:shadow-focus',
                )}
                placeholder="Опишите идею: что продаёте, кому, чем отличаетесь"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Ниша"
                value={form.niche}
                onChange={(v) => changeMarket({ niche: v })}
                options={NICHE_OPTIONS}
              />
              <Select
                label="Район"
                value={form.district}
                onChange={(v) => changeMarket({ district: v })}
                options={DISTRICT_OPTIONS.map((o) => ({
                  value: o.value,
                  label: `${o.label} · ${COMPETITION_HINT[o.competition]}`,
                }))}
              />
            </div>
            <Input
              label="Город"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              leftIcon={<MapPin className="h-4 w-4" />}
            />
          </div>
        </Card>

        <Card>
          <SectionTitle icon={<Wallet className="h-4 w-4" />}>Планируемые расходы, ₽/мес</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <MoneyField label="Аренда" value={form.expenses.rent} onChange={(v) => setExpense('rent', v)} />
            <MoneyField label="ФОТ (зарплаты)" value={form.expenses.payroll} onChange={(v) => setExpense('payroll', v)} />
            <MoneyField label="Закупка / сырьё" value={form.expenses.goods} onChange={(v) => setExpense('goods', v)} />
            <MoneyField label="Прочее" value={form.expenses.other} onChange={(v) => setExpense('other', v)} />
          </div>
          <p className="mt-3 text-sm text-muted">
            Итого расходов: <span className="font-medium text-alfa-ink">{formatRub(totalExpenses)}/мес</span>
          </p>
        </Card>
      </div>

      {/* Деньги и запуск */}
      <div className="space-y-5">
        <Card>
          <SectionTitle icon={<Landmark className="h-4 w-4" />}>Финансирование</SectionTitle>
          <div className="space-y-4">
            <MoneyField label="Свой бюджет" hint="Сколько готовы вложить своих" value={form.budget} onChange={(v) => set('budget', v)} />
            <MoneyField
              label="Желаемая сумма кредита"
              hint="Проверим, безопасна ли она"
              value={form.desiredCredit}
              onChange={(v) => set('desiredCredit', v)}
            />
          </div>
          <div className="mt-5 rounded-xl bg-bg p-3.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Всего на старт</span>
              <span className="font-semibold text-alfa-ink">{formatRub(form.budget + form.desiredCredit)}</span>
            </div>
          </div>
          <Button type="submit" fullWidth size="lg" className="mt-5">
            <Sparkles className="h-4 w-4" />
            Оценить идею
          </Button>
          <p className="mt-3 text-center text-xs text-muted">
            Анализ рынка, сценарии выручки и безопасный кредит
          </p>
        </Card>
      </div>
    </form>
  );
}

// ── Локальные поля формы ───────────────────────────────────────────────

function SectionTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-alfa-ink">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-alfa-red-50 text-alfa-red">{icon}</span>
      {children}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-alfa-graphite">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full h-11 rounded-xl border border-line bg-surface px-3 text-[15px] text-alfa-ink',
          'focus:outline-none focus:border-alfa-red/50 focus:shadow-focus',
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function MoneyField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <Input
      label={label}
      hint={hint}
      type="number"
      inputMode="numeric"
      min={0}
      step={1000}
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
    />
  );
}

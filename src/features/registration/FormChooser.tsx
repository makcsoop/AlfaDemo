import { Sparkles, Check } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui';
import { BUSINESS_FORMS, type BusinessForm, type FormRecommendation } from '@/lib/registration';

interface FormChooserProps {
  value: BusinessForm | null;
  onChange: (form: BusinessForm) => void;
  recommendation: FormRecommendation;
}

/** Выбор формы бизнеса с рекомендацией под профиль. */
export function FormChooser({ value, onChange, recommendation }: FormChooserProps) {
  return (
    <div>
      {/* Рекомендация */}
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-alfa-red-100 bg-alfa-red-50/60 px-4 py-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-alfa-red text-white">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <div className="text-[15px] font-semibold text-alfa-ink">
            {recommendation.headline} — под профиль «Кофейни Анны»
          </div>
          <ul className="mt-1.5 space-y-1">
            {recommendation.reasons.map((r) => (
              <li key={r} className="flex items-start gap-1.5 text-sm text-alfa-graphite">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-alfa-red" strokeWidth={2.5} />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Карточки форм */}
      <div className="grid gap-4 lg:grid-cols-3">
        {BUSINESS_FORMS.map((form) => {
          const recommended = form.id === recommendation.form;
          const selected = value === form.id;
          return (
            <button
              key={form.id}
              type="button"
              onClick={() => onChange(form.id)}
              className={cn(
                'flex flex-col rounded-2xl border bg-surface p-5 text-left shadow-card transition-all',
                selected ? 'border-alfa-red ring-2 ring-alfa-red/25' : 'border-line hover:border-alfa-red/40',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-alfa-red-50 text-alfa-red">
                  <form.icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                {recommended && (
                  <Badge tone="red" dot>
                    Рекомендуем
                  </Badge>
                )}
              </div>
              <h3 className="mt-3.5 text-base font-semibold text-alfa-ink">{form.name}</h3>
              <p className="text-xs text-muted">{form.short}</p>

              <dl className="mt-3.5 space-y-1.5 text-sm">
                <Row label="Налоги" value={form.tax} />
                <Row label="Сотрудники" value={form.staff} />
                <Row label="Доход" value={form.income} />
                <Row label="Товары" value={form.goods} />
                <Row label="Оформление" value={form.setup} />
              </dl>

              <div className="mt-3.5 border-t border-line pt-3 text-xs text-muted">
                Подходит: {form.goodFor}
              </div>

              <div
                className={cn(
                  'mt-3.5 flex h-9 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                  selected ? 'bg-alfa-red text-white' : 'bg-bg text-alfa-graphite',
                )}
              >
                {selected ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> Выбрано
                  </span>
                ) : (
                  'Выбрать'
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-[86px] shrink-0 text-muted">{label}</dt>
      <dd className="text-alfa-graphite">{value}</dd>
    </div>
  );
}

import { useState, type ReactNode } from 'react';
import { Plus, X, Pencil } from 'lucide-react';
import { Card, Input } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { useStorefrontStore } from '@/store/useStorefrontStore';

/** Редактор автосозданной карточки бизнеса. Пишет напрямую в стор витрины. */
export function BusinessCardEditor() {
  const card = useStorefrontStore((s) => s.card);
  const updateCard = useStorefrontStore((s) => s.updateCard);
  const [service, setService] = useState('');

  const addService = () => {
    const v = service.trim();
    if (!v || card.services.includes(v)) return;
    updateCard({ services: [...card.services, v] });
    setService('');
  };

  const removeService = (s: string) =>
    updateCard({ services: card.services.filter((x) => x !== s) });

  return (
    <Card>
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-alfa-ink">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-alfa-red-50 text-alfa-red">
          <Pencil className="h-4 w-4" />
        </span>
        Карточка бизнеса
      </div>

      <div className="space-y-4">
        <Input label="Название" value={card.name} onChange={(e) => updateCard({ name: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Ниша" value={card.nicheLabel} onChange={(e) => updateCard({ nicheLabel: e.target.value })} />
          <Input label="Район" value={card.district} onChange={(e) => updateCard({ district: e.target.value })} />
        </div>

        <Field label="Описание">
          <textarea
            value={card.tagline}
            onChange={(e) => updateCard({ tagline: e.target.value })}
            rows={2}
            className={cn(
              'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[15px] text-alfa-ink',
              'resize-none transition-shadow focus:outline-none focus:border-alfa-red/50 focus:shadow-focus',
            )}
          />
        </Field>

        <Field label="Услуги">
          <div className="flex flex-wrap gap-1.5">
            {card.services.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-full bg-bg px-2.5 py-1 text-sm text-alfa-graphite"
              >
                {s}
                <button
                  type="button"
                  onClick={() => removeService(s)}
                  className="text-muted hover:text-alfa-red"
                  aria-label={`Убрать «${s}»`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <Input
              value={service}
              onChange={(e) => setService(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addService();
                }
              }}
              placeholder="Добавить услугу"
            />
            <button
              type="button"
              onClick={addService}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-alfa-red hover:bg-bg"
              aria-label="Добавить услугу"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </Field>

        <Field label="Спецпредложение для старта">
          <Input value={card.offer} onChange={(e) => updateCard({ offer: e.target.value })} />
        </Field>
      </div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-alfa-graphite">{label}</label>
      {children}
    </div>
  );
}

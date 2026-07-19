import { Radar, Activity } from 'lucide-react';
import { Card } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { formatRub } from '@/lib/format';
import { INTERESTS, ALFA_PULSE } from '@/mock/audience';
import { useStorefrontStore } from '@/store/useStorefrontStore';

/** Панель настройки аудитории: гео-радиус, интересы, диапазон трат. */
export function AudiencePanel() {
  const settings = useStorefrontStore((s) => s.settings);
  const updateSettings = useStorefrontStore((s) => s.updateSettings);
  const toggleInterest = useStorefrontStore((s) => s.toggleInterest);

  return (
    <Card>
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-alfa-ink">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-alfa-red-50 text-alfa-red">
          <Radar className="h-4 w-4" />
        </span>
        Настройка аудитории
      </div>

      {/* Гео-радиус */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-alfa-graphite">Гео-радиус показа</label>
          <span className="text-sm font-semibold text-alfa-ink">{settings.radiusKm.toFixed(1)} км</span>
        </div>
        <input
          type="range"
          min={0.5}
          max={5}
          step={0.5}
          value={settings.radiusKm}
          onChange={(e) => updateSettings({ radiusKm: Number(e.target.value) })}
          className="w-full"
          style={{ accentColor: '#EF3124' }}
        />
        <div className="mt-0.5 flex justify-between text-xs text-muted">
          <span>0,5 км</span>
          <span>5 км</span>
        </div>
      </div>

      {/* Интересы */}
      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-alfa-graphite">Интересы аудитории</label>
        <div className="flex flex-wrap gap-1.5">
          {INTERESTS.map((i) => {
            const on = settings.interests.includes(i.id);
            return (
              <button
                key={i.id}
                type="button"
                onClick={() => toggleInterest(i.id)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                  on
                    ? 'border-transparent bg-alfa-red text-white'
                    : 'border-line bg-surface text-alfa-graphite hover:bg-bg',
                )}
              >
                {i.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Диапазон трат */}
      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-alfa-graphite">
          Средний чек трат клиента, ₽/мес
        </label>
        <div className="grid grid-cols-2 gap-3">
          <SpendInput
            label="от"
            value={settings.spendMin}
            onChange={(v) => updateSettings({ spendMin: Math.min(v, settings.spendMax) })}
          />
          <SpendInput
            label="до"
            value={settings.spendMax}
            onChange={(v) => updateSettings({ spendMax: Math.max(v, settings.spendMin) })}
          />
        </div>
      </div>

      {/* Альфа Пульс рынка */}
      <div className="mt-5 rounded-xl border border-line bg-bg p-3.5">
        <div className="flex items-center gap-1.5 text-sm font-medium text-alfa-ink">
          <Activity className="h-4 w-4 text-alfa-red" />
          Альфа Пульс рынка
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <PulseStat label="Категория" value={ALFA_PULSE.category} />
          <PulseStat label="Средние траты рядом" value={`${formatRub(ALFA_PULSE.avgSpend)}/мес`} />
          <PulseStat label="Динамика" value={ALFA_PULSE.trend} />
          <PulseStat label="Район" value={ALFA_PULSE.district} />
        </div>
        <p className="mt-2 text-xs text-muted">{ALFA_PULSE.note}.</p>
      </div>
    </Card>
  );
}

function SpendInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3">
      <span className="text-sm text-muted">{label}</span>
      <input
        type="number"
        min={0}
        step={100}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="h-11 w-full bg-transparent text-[15px] text-alfa-ink focus:outline-none"
      />
    </div>
  );
}

function PulseStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className="font-medium text-alfa-ink">{value}</div>
    </div>
  );
}

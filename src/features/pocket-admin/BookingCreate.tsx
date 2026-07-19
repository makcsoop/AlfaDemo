import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { CLIENTS, getPreset } from '@/mock/pocketAdmin';
import { usePocketAdminStore } from '@/store/usePocketAdminStore';

const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** Форма создания записи клиента. */
export function BookingCreate({ onDone }: { onDone: () => void }) {
  const presetId = usePocketAdminStore((s) => s.presetId);
  const addBooking = usePocketAdminStore((s) => s.addBooking);
  const services = getPreset(presetId).services;

  const [clientId, setClientId] = useState(CLIENTS[0].id);
  const [serviceIdx, setServiceIdx] = useState(0);
  const [dayOffset, setDayOffset] = useState(0);
  const [time, setTime] = useState('12:00');

  const submit = () => {
    const svc = services[serviceIdx];
    addBooking({ clientId, service: svc.name, price: svc.price, dayOffset, time, durationMin: svc.durationMin });
    onDone();
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-alfa-ink">Новая запись</div>
        <button type="button" onClick={onDone} className="text-muted hover:text-alfa-ink" aria-label="Закрыть">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Клиент" value={clientId} onChange={setClientId} options={CLIENTS.map((c) => ({ value: c.id, label: c.name }))} />
        <Select
          label="Услуга"
          value={String(serviceIdx)}
          onChange={(v) => setServiceIdx(Number(v))}
          options={services.map((s, i) => ({ value: String(i), label: `${s.name} · ${s.price} ₽` }))}
        />
        <Select
          label="День недели"
          value={String(dayOffset)}
          onChange={(v) => setDayOffset(Number(v))}
          options={DAY_LABELS.map((d, i) => ({ value: String(i), label: d }))}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-alfa-graphite">Время</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[15px] text-alfa-ink focus:outline-none focus:border-alfa-red/50 focus:shadow-focus"
          />
        </div>
      </div>

      <Button className="mt-4" onClick={submit}>
        <Plus className="h-4 w-4" />
        Создать запись
      </Button>
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
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-alfa-graphite">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-11 w-full rounded-xl border border-line bg-surface px-3 text-[15px] text-alfa-ink',
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

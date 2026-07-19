import { useState } from 'react';
import { Plus, Clock, CreditCard, Bell, Check, Phone } from 'lucide-react';
import { Card, Badge, Button } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { formatRub } from '@/lib/format';
import { CLIENTS, getClient, type Booking, type BookingStatus } from '@/mock/pocketAdmin';
import { usePocketAdminStore } from '@/store/usePocketAdminStore';
import { BookingCreate } from './BookingCreate';
import { ReminderPreview } from './ReminderPreview';

const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const STATUS: Record<BookingStatus, { label: string; tone: 'neutral' | 'green' | 'red' | 'outline'; dot: string }> = {
  new: { label: 'Новая', tone: 'neutral', dot: 'bg-muted' },
  confirmed: { label: 'Подтверждена', tone: 'outline', dot: 'bg-alfa-red' },
  prepaid: { label: 'Предоплата внесена', tone: 'green', dot: 'bg-risk-low' },
  done: { label: 'Завершена', tone: 'neutral', dot: 'bg-muted' },
  cancelled: { label: 'Отменена', tone: 'red', dot: 'bg-alfa-red' },
};

function weekDate(dayOffset: number): string {
  const now = new Date();
  const monday = new Date(now);
  const dow = (now.getDay() + 6) % 7; // 0 = Пн
  monday.setDate(now.getDate() - dow + dayOffset);
  return monday.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function BookingsView({ onRequestPayment }: { onRequestPayment: (b: Booking) => void }) {
  const bookings = usePocketAdminStore((s) => s.bookings);
  const setBookingStatus = usePocketAdminStore((s) => s.setBookingStatus);
  const [creating, setCreating] = useState(false);

  const byDay = [...bookings].sort((a, b) => a.dayOffset - b.dayOffset || a.time.localeCompare(b.time));
  const days = Array.from(new Set(byDay.map((b) => b.dayOffset)));

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {/* Лента записей */}
      <div className="space-y-4 lg:col-span-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-muted">Записи на неделю · {bookings.length}</div>
          {!creating && (
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              Создать запись
            </Button>
          )}
        </div>

        {creating && <BookingCreate onDone={() => setCreating(false)} />}

        {days.map((day) => (
          <div key={day}>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-alfa-ink">
              {DAY_LABELS[day]}
              <span className="text-muted font-normal">{weekDate(day)}</span>
            </div>
            <div className="space-y-2">
              {byDay.filter((b) => b.dayOffset === day).map((b) => (
                <BookingRow
                  key={b.id}
                  booking={b}
                  onRequestPayment={() => onRequestPayment(b)}
                  onDone={() => setBookingStatus(b.id, 'done')}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Мини-CRM: клиенты */}
      <div>
        <div className="mb-2 text-sm font-medium text-muted">Клиенты · {CLIENTS.length}</div>
        <div className="space-y-2">
          {CLIENTS.map((c) => (
            <Card key={c.id} className="!p-3.5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-alfa-red-50 text-sm font-semibold text-alfa-red">
                  {c.name.split(' ').map((w) => w[0]).join('')}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-alfa-ink">{c.name}</span>
                    <Badge tone="neutral" size="sm">{c.tag}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <Phone className="h-3 w-3" />
                    {c.phone}
                  </div>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between border-t border-line pt-2.5 text-xs text-muted">
                <span>Визитов: <span className="font-medium text-alfa-ink">{c.visits}</span></span>
                <span>Потрачено: <span className="font-medium text-alfa-ink">{formatRub(c.totalSpent)}</span></span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookingRow({
  booking,
  onRequestPayment,
  onDone,
}: {
  booking: Booking;
  onRequestPayment: () => void;
  onDone: () => void;
}) {
  const [showReminder, setShowReminder] = useState(false);
  const client = getClient(booking.clientId);
  const st = STATUS[booking.status];

  return (
    <div className="rounded-xl border border-line bg-surface p-3.5">
      <div className="flex items-start gap-3">
        <div className="flex w-14 shrink-0 flex-col items-center rounded-lg bg-bg py-1.5">
          <Clock className="h-3.5 w-3.5 text-muted" />
          <span className="mt-0.5 text-sm font-semibold text-alfa-ink">{booking.time}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn('h-1.5 w-1.5 rounded-full', st.dot)} />
            <span className="truncate text-sm font-medium text-alfa-ink">{booking.service}</span>
          </div>
          <div className="text-sm text-muted">{client?.name}</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-alfa-ink">{formatRub(booking.price)}</span>
            <Badge tone={st.tone} size="sm">{st.label}</Badge>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {!booking.prepaid && (
          <ActionButton icon={CreditCard} label="Запросить предоплату" onClick={onRequestPayment} primary />
        )}
        <ActionButton icon={Bell} label={showReminder ? 'Скрыть напоминание' : 'Напоминание'} onClick={() => setShowReminder((v) => !v)} />
        {booking.status !== 'done' && <ActionButton icon={Check} label="Завершить" onClick={onDone} />}
      </div>

      {showReminder && client && (
        <div className="mt-3 border-t border-line pt-3">
          <ReminderPreview clientName={client.name} service={booking.service} when={`${DAY_LABELS[booking.dayOffset]} в ${booking.time}`} />
        </div>
      )}
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  primary,
}: {
  icon: typeof Bell;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
        primary ? 'bg-alfa-red-50 text-alfa-red hover:bg-alfa-red-100' : 'border border-line bg-surface text-alfa-graphite hover:bg-bg',
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

import { useEffect, useState } from 'react';
import { CalendarDays, QrCode, Wallet } from 'lucide-react';
import { PageHeader } from '@/features/_shared/PageHeader';
import { cn } from '@/shared/lib/cn';
import { useProgressStore } from '@/store/useProgressStore';
import { usePocketAdminStore } from '@/store/usePocketAdminStore';
import { getClient, NICHE_PRESETS, type Booking } from '@/mock/pocketAdmin';
import { BookingsView } from './BookingsView';
import { PaymentView } from './PaymentView';
import { MoneyView } from './MoneyView';

type Tab = 'bookings' | 'pay' | 'money';

const TABS: { id: Tab; label: string; icon: typeof QrCode }[] = [
  { id: 'bookings', label: 'Записи', icon: CalendarDays },
  { id: 'pay', label: 'Оплата', icon: QrCode },
  { id: 'money', label: 'Деньги', icon: Wallet },
];

export function PocketAdminPage() {
  const [tab, setTab] = useState<Tab>('bookings');
  const generatePayment = usePocketAdminStore((s) => s.generatePayment);
  const completeStep = useProgressStore((s) => s.complete);

  useEffect(() => {
    completeStep('/admin');
  }, [completeStep]);

  const requestPayment = (b: Booking) => {
    generatePayment({
      amount: b.price,
      service: b.service,
      clientName: getClient(b.clientId)?.name ?? 'Клиент',
      bookingId: b.id,
    });
    setTab('pay');
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Блок 4 · Операционка"
        title="Администратор в кармане"
        description="Мини-CRM, приём предоплаты по QR и ссылке, авто-напоминания клиентам и сводка по деньгам с налоговыми подсказками — всё в телефоне."
        badge="CRM + оплаты"
        actions={<PresetPicker />}
      />

      {/* Вкладки */}
      <div className="mb-5 inline-flex rounded-xl border border-line bg-bg p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors',
              tab === t.id ? 'bg-surface text-alfa-ink shadow-sm' : 'text-muted hover:text-alfa-graphite',
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'bookings' && <BookingsView onRequestPayment={requestPayment} />}
      {tab === 'pay' && <PaymentView />}
      {tab === 'money' && <MoneyView />}
    </div>
  );
}

function PresetPicker() {
  const presetId = usePocketAdminStore((s) => s.presetId);
  const setPreset = usePocketAdminStore((s) => s.setPreset);

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Ниша:</span>
      <select
        value={presetId}
        onChange={(e) => setPreset(e.target.value)}
        className="h-9 rounded-lg border border-line bg-surface px-2.5 text-sm font-medium text-alfa-ink focus:outline-none focus:border-alfa-red/50"
      >
        {NICHE_PRESETS.map((p) => (
          <option key={p.id} value={p.id}>{p.label}</option>
        ))}
      </select>
    </label>
  );
}

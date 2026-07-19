import { useState, type ReactNode } from 'react';
import { Link2, Copy, CheckCircle2, QrCode as QrIcon, CreditCard, Smartphone, Check } from 'lucide-react';
import { Card, Button, Badge } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { formatRub } from '@/lib/format';
import { CLIENTS, getPreset, type Payment, type PaymentMethod } from '@/mock/pocketAdmin';
import { usePocketAdminStore } from '@/store/usePocketAdminStore';
import { QrCode } from './QrCode';

const METHOD: Record<PaymentMethod, { label: string; icon: typeof QrIcon }> = {
  qr: { label: 'QR', icon: QrIcon },
  link: { label: 'Ссылка', icon: Link2 },
  card: { label: 'Карта', icon: CreditCard },
};

function agoLabel(daysAgo: number): string {
  if (daysAgo <= 0) return 'сегодня';
  if (daysAgo === 1) return 'вчера';
  return `${daysAgo} дн. назад`;
}

export function PaymentView() {
  const pending = usePocketAdminStore((s) => s.pending);
  const payments = usePocketAdminStore((s) => s.payments);
  const generatePayment = usePocketAdminStore((s) => s.generatePayment);
  const markPaid = usePocketAdminStore((s) => s.markPaid);
  const clearPending = usePocketAdminStore((s) => s.clearPending);

  const [justPaid, setJustPaid] = useState(false);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div>
        {pending ? (
          <PendingCard
            onPaid={() => {
              markPaid();
              setJustPaid(true);
            }}
            onCancel={clearPending}
          />
        ) : justPaid ? (
          <SuccessCard payment={payments[0]} onNew={() => setJustPaid(false)} />
        ) : (
          <GenerateForm onGenerate={generatePayment} />
        )}
      </div>

      {/* История платежей */}
      <Card>
        <div className="mb-4 text-sm font-semibold text-alfa-ink">История платежей</div>
        <div className="space-y-2">
          {payments.map((p) => {
            const m = METHOD[p.method];
            return (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-risk-low">
                  <m.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-alfa-ink">{p.service}</div>
                  <div className="truncate text-xs text-muted">{p.clientName} · {m.label} · {agoLabel(p.daysAgo)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-alfa-ink">{formatRub(p.amount)}</div>
                  <Badge tone="green" size="sm">оплачено</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ── Генерация запроса оплаты ───────────────────────────────────────────

function GenerateForm({
  onGenerate,
}: {
  onGenerate: (input: { amount: number; service: string; clientName: string }) => void;
}) {
  const services = getPreset(usePocketAdminStore((s) => s.presetId)).services;
  const [clientName, setClientName] = useState(CLIENTS[0].name);
  const [serviceIdx, setServiceIdx] = useState(0);
  const [amount, setAmount] = useState(services[0].price);

  return (
    <Card>
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-alfa-ink">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-alfa-red-50 text-alfa-red">
          <QrIcon className="h-4 w-4" />
        </span>
        Запросить предоплату
      </div>

      <div className="space-y-4">
        <Field label="Клиент">
          <select
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-[15px] text-alfa-ink focus:outline-none focus:border-alfa-red/50 focus:shadow-focus"
          >
            {CLIENTS.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Услуга">
          <select
            value={String(serviceIdx)}
            onChange={(e) => {
              const i = Number(e.target.value);
              setServiceIdx(i);
              setAmount(services[i].price);
            }}
            className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-[15px] text-alfa-ink focus:outline-none focus:border-alfa-red/50 focus:shadow-focus"
          >
            {services.map((s, i) => (
              <option key={s.name} value={String(i)}>{s.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Сумма, ₽">
          <input
            type="number"
            min={0}
            step={100}
            value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
            className="h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[15px] text-alfa-ink focus:outline-none focus:border-alfa-red/50 focus:shadow-focus"
          />
        </Field>
      </div>

      <Button
        className="mt-4"
        fullWidth
        onClick={() => onGenerate({ amount, service: services[serviceIdx].name, clientName })}
      >
        <QrIcon className="h-4 w-4" />
        Сгенерировать ссылку и QR
      </Button>
    </Card>
  );
}

// ── Ожидание оплаты: QR + ссылка ───────────────────────────────────────

function PendingCard({ onPaid, onCancel }: { onPaid: () => void; onCancel: () => void }) {
  const pending = usePocketAdminStore((s) => s.pending)!;
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(pending.link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card>
      <div className="mb-1 text-sm font-semibold text-alfa-ink">Оплата по QR или ссылке</div>
      <div className="text-sm text-muted">{pending.clientName} · {pending.service}</div>

      <div className="mt-4 flex flex-col items-center rounded-2xl bg-bg p-5">
        <QrCode text={pending.link} size={168} />
        <div className="mt-3 text-2xl font-bold text-alfa-ink">{formatRub(pending.amount)}</div>
        <div className="text-xs text-muted">предоплата</div>
      </div>

      <button
        type="button"
        onClick={copy}
        className="mt-3 flex w-full items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-alfa-graphite hover:bg-bg"
      >
        <Link2 className="h-4 w-4 shrink-0 text-muted" />
        <span className="truncate">{pending.link}</span>
        {copied ? <Check className="ml-auto h-4 w-4 shrink-0 text-risk-low" /> : <Copy className="ml-auto h-4 w-4 shrink-0 text-muted" />}
      </button>

      <div className="mt-3 flex items-center gap-2 rounded-xl bg-bg px-3.5 py-2.5 text-sm text-muted">
        <Smartphone className="h-4 w-4 shrink-0 text-alfa-red" />
        Клиент сканирует QR или открывает ссылку и оплачивает картой.
      </div>

      <div className="mt-4 flex gap-2">
        <Button fullWidth onClick={onPaid}>
          <Check className="h-4 w-4" />
          Клиент оплатил (демо)
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </Card>
  );
}

// ── Успешная оплата ────────────────────────────────────────────────────

function SuccessCard({ payment, onNew }: { payment: Payment | undefined; onNew: () => void }) {
  return (
    <Card className="flex flex-col items-center py-8 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-risk-low">
        <CheckCircle2 className="h-9 w-9" />
      </span>
      <div className="mt-4 text-lg font-bold text-alfa-ink">Оплата прошла</div>
      {payment && (
        <>
          <div className="mt-1 text-sm text-muted">{payment.clientName} · {payment.service}</div>
          <div className="mt-3 text-3xl font-bold text-alfa-ink">{formatRub(payment.amount)}</div>
          <div className="mt-1 text-sm text-risk-low">зачислено на счёт</div>
        </>
      )}
      <Button className="mt-6" variant="secondary" onClick={onNew}>
        Новый платёж
      </Button>
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

import { useState } from 'react';
import { MessageSquare, Bell, Check } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { DEMO_BUSINESS } from '@/mock/business';

type Channel = 'sms' | 'push';

/** Превью авто-напоминания клиенту о визите (мок SMS/пуш). */
export function ReminderPreview({
  clientName,
  service,
  when,
}: {
  clientName: string;
  service: string;
  when: string;
}) {
  const [channel, setChannel] = useState<Channel>('sms');
  const text = `${clientName.split(' ')[0]}, напоминаем: ${when} у вас «${service}» в «${DEMO_BUSINESS.name}». Ждём вас! Отменить — ответом СТОП.`;

  return (
    <div>
      <div className="mb-2 inline-flex rounded-lg border border-line bg-bg p-0.5">
        <ChannelButton active={channel === 'sms'} onClick={() => setChannel('sms')} icon={MessageSquare} label="SMS" />
        <ChannelButton active={channel === 'push'} onClick={() => setChannel('push')} icon={Bell} label="Пуш" />
      </div>

      {channel === 'sms' ? (
        <div className="max-w-sm rounded-2xl rounded-tl-sm bg-bg px-3.5 py-2.5 text-sm text-alfa-graphite">
          {text}
        </div>
      ) : (
        <div className="max-w-sm rounded-2xl border border-line bg-surface p-3 shadow-card">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-alfa-red text-white text-xs font-bold">
              А
            </span>
            <span className="text-sm font-semibold text-alfa-ink">{DEMO_BUSINESS.name}</span>
            <span className="ml-auto text-xs text-muted">сейчас</span>
          </div>
          <p className="mt-1.5 text-sm text-alfa-graphite">{text}</p>
        </div>
      )}

      <div className="mt-2 flex items-center gap-1.5 text-xs text-risk-low">
        <Check className="h-3.5 w-3.5" />
        Отправляется автоматически за 24 часа до визита
      </div>
    </div>
  );
}

function ChannelButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Bell;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition-colors',
        active ? 'bg-surface text-alfa-ink shadow-sm' : 'text-muted hover:text-alfa-graphite',
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

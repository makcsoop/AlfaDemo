import { Wifi, FlaskConical } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useAppStore, type AppMode } from '@/store/useAppStore';

/** Сегментированный переключатель LIVE / ДЕМО в шапке. */
export function ModeToggle() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);

  return (
    <div
      className="inline-flex items-center rounded-xl bg-bg p-1 border border-line"
      role="tablist"
      aria-label="Режим работы"
    >
      <ModeButton current={mode} value="live" label="Live" icon={Wifi} onClick={setMode} />
      <ModeButton current={mode} value="demo" label="Демо" icon={FlaskConical} onClick={setMode} />
    </div>
  );
}

function ModeButton({
  current,
  value,
  label,
  icon: Icon,
  onClick,
}: {
  current: AppMode;
  value: AppMode;
  label: string;
  icon: typeof Wifi;
  onClick: (m: AppMode) => void;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => onClick(value)}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? value === 'demo'
            ? 'bg-alfa-red text-white shadow-sm'
            : 'bg-surface text-alfa-ink shadow-sm'
          : 'text-muted hover:text-alfa-graphite',
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

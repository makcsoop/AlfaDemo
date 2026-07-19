import { useEffect, useState } from 'react';
import { Store, Eye, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/features/_shared/PageHeader';
import { cn } from '@/shared/lib/cn';
import { useProgressStore } from '@/store/useProgressStore';
import { useStorefrontStore } from '@/store/useStorefrontStore';
import { BusinessCardEditor } from './BusinessCardEditor';
import { AudiencePanel } from './AudiencePanel';
import { MetricsPanel } from './MetricsPanel';
import { ClientPreview } from './ClientPreview';
import { StorefrontCard } from './StorefrontCard';

type View = 'owner' | 'client';

export function ShowcasePage() {
  const card = useStorefrontStore((s) => s.card);
  const completeStep = useProgressStore((s) => s.complete);
  const [view, setView] = useState<View>('owner');

  // Карточка автосоздана — блок считается пройденным по факту наличия витрины.
  useEffect(() => {
    completeStep('/storefront');
  }, [completeStep]);

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Блок 2 · Локальная витрина"
        title="Клиенты рядом находят вас сами"
        description="Карточка бизнеса автоматически попадает к релевантной аудитории Альфа Онлайн поблизости. Настройте аудиторию и посмотрите витрину глазами клиента."
        badge="Альфа Онлайн"
        actions={<ViewToggle view={view} onChange={setView} />}
      />

      {/* Карточка создана автоматически */}
      <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-risk-low" />
        <p className="text-sm text-alfa-graphite">
          Карточка создана автоматически после регистрации бизнеса и подключения эквайринга — остаётся
          отредактировать детали и настроить аудиторию.
        </p>
      </div>

      {view === 'owner' ? (
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <BusinessCardEditor />
            <div>
              <div className="mb-2 text-sm font-medium text-muted">Так карточка выглядит в витрине</div>
              <StorefrontCard card={card} variant="full" />
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <AudiencePanel />
            <MetricsPanel />
          </div>
        </div>
      ) : (
        <ClientPreview />
      )}
    </div>
  );
}

function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <div className="inline-flex items-center rounded-xl border border-line bg-bg p-1" role="tablist">
      <ToggleButton active={view === 'owner'} onClick={() => onChange('owner')} icon={LayoutGrid} label="Предприниматель" />
      <ToggleButton active={view === 'client'} onClick={() => onChange('client')} icon={Eye} label="Как видит клиент" />
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Store;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
        active ? 'bg-surface text-alfa-ink shadow-sm' : 'text-muted hover:text-alfa-graphite',
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

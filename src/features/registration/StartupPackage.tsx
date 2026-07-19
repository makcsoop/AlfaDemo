import { Link } from 'react-router-dom';
import { Gift, ArrowUpRight, Zap, Lock } from 'lucide-react';
import { Card, Button, Badge, Switch } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { STARTUP_FEATURES, type StartupFeature } from '@/lib/registration';
import { DEMO_OWNER, YOUNG_ENTREPRENEUR_MAX_AGE } from '@/mock/business';
import { useActivationStore } from '@/store/useActivationStore';

/**
 * Стартовый пакет: карточки-тумблеры активации. Тумблеры с kind==='unlock'
 * мгновенно открывают соответствующий раздел в сайдбаре и на дашборде.
 */
export function StartupPackage() {
  const features = useActivationStore((s) => s.features);
  const toggleFeature = useActivationStore((s) => s.toggleFeature);
  const activateAll = useActivationStore((s) => s.activateAll);
  const unlockedCount = useActivationStore((s) => s.unlockedCount());

  const totalUnlockable = STARTUP_FEATURES.filter((f) => f.kind === 'unlock').length;

  return (
    <div className="space-y-5">
      {/* Заголовок программы */}
      <Card className="bg-gradient-to-br from-alfa-red-50/70 to-surface">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-alfa-red text-white">
              <Gift className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-alfa-ink">Стартовый пакет</h2>
                <Badge tone="red">до {YOUNG_ENTREPRENEUR_MAX_AGE} лет</Badge>
              </div>
              <p className="mt-1 max-w-xl text-sm text-muted">
                Возраст {DEMO_OWNER.age} — вам доступна программа для молодых предпринимателей. Включайте
                сервисы: разделы с пометкой «блок» открываются в меню сразу после активации.
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted">Открыто разделов</div>
            <div className="text-2xl font-bold text-alfa-red">
              {unlockedCount}/{totalUnlockable}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={activateAll} disabled={unlockedCount === totalUnlockable}>
            <Zap className="h-4 w-4" />
            {unlockedCount === totalUnlockable ? 'Все разделы активированы' : 'Активировать всё'}
          </Button>
        </div>
      </Card>

      {/* Карточки-тумблеры */}
      <div className="grid gap-4 sm:grid-cols-2">
        {STARTUP_FEATURES.map((feature) => (
          <FeatureCard
            key={feature.id}
            feature={feature}
            on={Boolean(features[feature.id])}
            onToggle={() => toggleFeature(feature.id)}
          />
        ))}
      </div>
    </div>
  );
}

function FeatureCard({
  feature,
  on,
  onToggle,
}: {
  feature: StartupFeature;
  on: boolean;
  onToggle: () => void;
}) {
  const isUnlock = feature.kind === 'unlock';
  const linkTo = feature.unlocks ?? feature.link;

  return (
    <div
      className={cn(
        'flex gap-3.5 rounded-2xl border bg-surface p-4 shadow-card transition-colors',
        on ? 'border-alfa-red/30' : 'border-line',
      )}
    >
      <span
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors',
          on ? 'bg-alfa-red-50 text-alfa-red' : 'bg-bg text-muted',
        )}
      >
        <feature.icon className="h-5 w-5" strokeWidth={1.9} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-semibold text-alfa-ink">{feature.title}</h3>
          <Switch checked={on} onChange={onToggle} label={feature.title} />
        </div>
        <p className="mt-0.5 text-sm text-muted">{feature.description}</p>

        <div className="mt-2.5 flex items-center gap-2">
          {feature.perk && (
            <Badge tone={on ? 'red' : 'neutral'} size="sm">
              {feature.perk}
            </Badge>
          )}
          {isUnlock &&
            (on ? (
              <Link
                to={linkTo!}
                className="inline-flex items-center gap-1 text-sm font-medium text-alfa-red hover:underline"
              >
                Открыть раздел
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm text-muted">
                <Lock className="h-3.5 w-3.5" />
                Раздел закрыт
              </span>
            ))}
          {!isUnlock && feature.link && on && (
            <Link
              to={feature.link}
              className="inline-flex items-center gap-1 text-sm font-medium text-alfa-red hover:underline"
            >
              Открыть
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

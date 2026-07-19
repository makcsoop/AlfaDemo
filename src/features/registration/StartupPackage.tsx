import { Link, useNavigate } from 'react-router-dom';
import { Gift, ArrowUpRight, ArrowRight, Zap, Lock } from 'lucide-react';
import { Card, Button, Badge, Switch } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { STARTUP_FEATURES, type StartupFeature } from '@/lib/registration';
import { JOURNEY, isJourneyStepDone } from '@/lib/journey';
import { DEMO_OWNER, YOUNG_ENTREPRENEUR_MAX_AGE } from '@/mock/business';
import { useActivationStore } from '@/store/useActivationStore';
import { useProgressStore } from '@/store/useProgressStore';

/**
 * Стартовый пакет: карточки-тумблеры активации. Тумблеры с kind==='unlock'
 * мгновенно открывают соответствующий раздел в сайдбаре и на дашборде.
 * После активации появляется «Далее» — ведёт к следующему шагу пути,
 * чтобы пользователь не потерялся после сбора пакета.
 */
export function StartupPackage() {
  const navigate = useNavigate();
  const features = useActivationStore((s) => s.features);
  const toggleFeature = useActivationStore((s) => s.toggleFeature);
  const activateAll = useActivationStore((s) => s.activateAll);
  const unlockedCount = useActivationStore((s) => s.unlockedCount());
  const registered = useActivationStore((s) => s.registered);
  const packageActivated = useActivationStore((s) => s.isPackageActivated());
  const steps = useProgressStore((s) => s.steps);

  const totalUnlockable = STARTUP_FEATURES.filter((f) => f.kind === 'unlock').length;
  const allActive = unlockedCount === totalUnlockable;

  // Следующий шаг — строго ВПЕРЁД по пути (первый незавершённый после пакета),
  // чтобы «Далее» не уводила назад к онбордингу или оценке идеи.
  const inputs = { steps, registered, packageActivated };
  const packageIdx = JOURNEY.findIndex((st) => st.id === 'package');
  const nextStep = JOURNEY.slice(packageIdx + 1).find((st) => !isJourneyStepDone(st, inputs));
  const goNext = () => navigate(nextStep ? nextStep.to : '/dashboard');

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
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <Button
            variant={packageActivated ? 'secondary' : 'primary'}
            onClick={activateAll}
            disabled={allActive}
          >
            <Zap className="h-4 w-4" />
            {allActive ? 'Все разделы активированы' : 'Активировать всё'}
          </Button>
          {/* «Далее» появляется, как только пакет собран — путь продолжается */}
          {packageActivated && (
            <Button onClick={goNext}>
              {nextStep ? `Далее: ${nextStep.label}` : 'Путь пройден — на дашборд'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
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

      {/* Дублирующий CTA внизу — после прокрутки тумблеров не нужно возвращаться наверх */}
      {packageActivated && (
        <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[15px] font-semibold text-alfa-ink">
              {nextStep ? `Следующий шаг пути — ${nextStep.label}` : 'Путь пройден — бизнес запущен'}
            </div>
            <div className="text-sm text-muted">
              {nextStep
                ? 'Пакет собран, разделы открыты. Продолжайте запуск.'
                : 'Все шаги завершены — сводка на дашборде.'}
            </div>
          </div>
          <Button onClick={goNext} className="shrink-0">
            {nextStep ? 'Далее' : 'На дашборд'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      )}
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

import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Sparkles, Lock, ArrowRight, PackageCheck, CheckCircle2, Flag } from 'lucide-react';
import { PageHeader } from '@/features/_shared/PageHeader';
import { JourneyBar } from '@/features/_shared/JourneyBar';
import { Card, Badge, Button } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { JOURNEY, isJourneyStepDone } from '@/lib/journey';
import { STARTUP_FEATURES } from '@/lib/registration';
import { useProgressStore } from '@/store/useProgressStore';
import { useActivationStore } from '@/store/useActivationStore';
import { DEMO_BUSINESS } from '@/mock/business';
import { useBlockWidgets, type BlockWidget } from './useBlockWidgets';

const ACTION_LABEL: Record<string, string> = {
  onboarding: 'Пройти онбординг',
  idea: 'Оценить идею',
  register: 'Зарегистрировать бизнес',
  package: 'Собрать стартовый пакет',
  storefront: 'Открыть витрину',
  admin: 'Настроить CRM',
  tenders: 'Посмотреть тендеры',
  analytics: 'Открыть аналитику',
};

const TOTAL_UNLOCKABLE = STARTUP_FEATURES.filter((f) => f.kind === 'unlock').length;

export function DashboardPage() {
  const navigate = useNavigate();
  const steps = useProgressStore((s) => s.steps);
  const registered = useActivationStore((s) => s.registered);
  const packageActivated = useActivationStore((s) => s.isPackageActivated());
  const unlockedCount = useActivationStore((s) => s.unlockedCount());
  const widgets = useBlockWidgets();

  const inputs = { steps, registered, packageActivated };
  const nextStep = JOURNEY.find((step) => !isJourneyStepDone(step, inputs));

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Дашборд"
        title={DEMO_BUSINESS.name}
        description="Единый путь запуска, статус каждого блока и ключевые цифры в одном окне."
        actions={
          <Link to="/demo-story">
            <Button variant="secondary">
              <Sparkles className="h-4 w-4 text-alfa-red" />
              Демо-сценарий
            </Button>
          </Link>
        }
      />

      {/* Прогресс-трекер + следующее действие */}
      <Card className="mb-6">
        <JourneyBar />
        <div className="mt-5 border-t border-line pt-4">
          {nextStep ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-alfa-red-50 text-alfa-red">
                  <Flag className="h-[18px] w-[18px]" strokeWidth={2} />
                </span>
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-muted">Следующее действие</div>
                  <div className="text-[15px] font-semibold text-alfa-ink">{nextStep.label}</div>
                </div>
              </div>
              <Button onClick={() => navigate(nextStep.to)}>
                {ACTION_LABEL[nextStep.id] ?? 'Перейти'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-6 w-6 text-risk-low" />
                <div className="text-[15px] font-semibold text-alfa-ink">
                  Путь пройден — бизнес запущен 🎉
                </div>
              </div>
              <Button variant="secondary" onClick={() => navigate('/demo-story')}>
                <Sparkles className="h-4 w-4 text-alfa-red" />
                Показать историю
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Плитки-виджеты блоков */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Блоки и ключевые цифры</h2>
        {!registered && (
          <Link to="/registration" className="text-sm font-medium text-alfa-red hover:underline">
            Активировать разделы →
          </Link>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {widgets.map((w) => (
          <WidgetTile key={w.id} w={w} />
        ))}

        {/* Стартовый пакет */}
        <Link to="/registration">
          <Card interactive className="h-full">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-alfa-red-50 text-alfa-red">
                <PackageCheck className="h-5 w-5" strokeWidth={1.9} />
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted" />
            </div>
            <div className="mt-3.5 text-2xl font-bold text-alfa-ink">
              {registered ? `${unlockedCount}/${TOTAL_UNLOCKABLE}` : '—'}
            </div>
            <div className="text-sm text-muted">
              {registered ? 'Разделов активировано' : 'Регистрация не пройдена'}
            </div>
            <div className="mt-3">
              <Badge tone={registered ? 'green' : 'neutral'} dot>
                {registered ? 'Бизнес зарегистрирован' : 'Стартовый пакет'}
              </Badge>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}

function WidgetTile({ w }: { w: BlockWidget }) {
  const locked = w.gated && !w.unlocked;

  return (
    <Link to={locked ? '/registration' : w.to} className={cn(locked && 'group')}>
      <Card interactive className={cn('h-full', locked && 'opacity-80')}>
        <div className="flex items-start justify-between">
          <div
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl',
              locked ? 'bg-bg text-muted' : 'bg-alfa-red-50 text-alfa-red',
            )}
          >
            <w.icon className="h-5 w-5" strokeWidth={1.9} />
          </div>
          {locked ? <Lock className="h-5 w-5 text-muted" /> : <ArrowUpRight className="h-5 w-5 text-muted" />}
        </div>

        <div className="mt-3.5 text-sm font-medium text-alfa-graphite">{w.label}</div>
        <div className={cn('mt-1 text-2xl font-bold', locked ? 'text-muted' : 'text-alfa-ink')}>{w.metric}</div>
        <div className="text-sm text-muted">{w.metricLabel}</div>
        {w.hint && <div className="mt-1 text-xs text-muted/80">{w.hint}</div>}

        <div className="mt-3">
          {locked ? (
            <Badge tone="neutral">Активируйте в старт-пакете</Badge>
          ) : (
            <Badge tone={w.done ? 'green' : 'neutral'} dot>
              {w.done ? 'Готово' : 'Открыто'}
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  );
}

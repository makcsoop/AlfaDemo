import { useEffect, useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/features/_shared/PageHeader';
import { JourneyBar } from '@/features/_shared/JourneyBar';
import { Card, Badge } from '@/shared/ui';
import { getBusinessForm } from '@/lib/registration';
import { DEMO_BUSINESS } from '@/mock/business';
import { useActivationStore } from '@/store/useActivationStore';
import { useProgressStore } from '@/store/useProgressStore';
import { RegistrationWizard } from './RegistrationWizard';
import { StartupPackage } from './StartupPackage';

/**
 * Этап 6 — склейка пути: мастер регистрации → стартовый пакет → активация блоков.
 * Пока не зарегистрирован — мастер. После — успех + стартовый пакет с тумблерами.
 */
export function RegistrationPage() {
  const registered = useActivationStore((s) => s.registered);
  const form = useActivationStore((s) => s.form);
  const resetActivation = useActivationStore((s) => s.resetActivation);
  const resetProgress = useProgressStore((s) => s.reset);

  const resetPath = () => {
    resetActivation();
    resetProgress();
  };

  // Локальный флаг: показать пакет. Мастер сам держит экран «Готово» до клика,
  // поэтому не переключаемся на пакет автоматически при registered=true.
  // Но при сбросе пути (registered=false) обязательно возвращаемся к мастеру.
  const [showPackage, setShowPackage] = useState(registered);
  useEffect(() => {
    if (!registered) setShowPackage(false);
  }, [registered]);

  const onWizardDone = () => setShowPackage(true);

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Этап 6 · Запуск"
        title="Регистрация и стартовый пакет"
        description="Оформляем бизнес и включаем сервисы: активированные тумблеры открывают разделы Альфа-старта."
        badge="Склейка пути"
        actions={
          registered ? (
            <button
              type="button"
              onClick={resetPath}
              className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-alfa-graphite"
              title="Сбросить прогресс, регистрацию и активацию (для повторного показа)"
            >
              <RotateCcw className="h-4 w-4" />
              Сбросить путь
            </button>
          ) : undefined
        }
      />

      <Card className="mb-6">
        <JourneyBar />
      </Card>

      {registered && (
        <div className="mb-6 flex flex-wrap items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-risk-low" />
          <p className="text-sm text-alfa-graphite">
            «{DEMO_BUSINESS.name}» зарегистрирована как{' '}
            <span className="font-medium">{form ? getBusinessForm(form).name : 'ИП'}</span>. Расчётный счёт открыт.
          </p>
          <Badge tone="green" dot className="ml-auto">
            Бизнес зарегистрирован
          </Badge>
        </div>
      )}

      {showPackage ? <StartupPackage /> : <RegistrationWizard onDone={onWizardDone} />}
    </div>
  );
}

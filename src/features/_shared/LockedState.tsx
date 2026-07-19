import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui';
import { featureForRoute } from '@/lib/registration';
import { useActivationStore } from '@/store/useActivationStore';

/**
 * Экран закрытого раздела: показывается, если блок ещё не активирован в
 * стартовом пакете. Даёт быстрый путь к активации — либо включает фичу
 * прямо отсюда, либо ведёт в стартовый пакет.
 */
export function LockedState({ route }: { route: string }) {
  const navigate = useNavigate();
  const registered = useActivationStore((s) => s.registered);
  const setFeature = useActivationStore((s) => s.setFeature);
  const feature = featureForRoute(route);

  const activateHere = () => {
    if (feature) setFeature(feature.id, true);
  };

  return (
    <div className="animate-fade-up flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bg text-muted">
        <Lock className="h-8 w-8" strokeWidth={1.6} />
      </div>
      <h1 className="mt-5 text-2xl font-bold tracking-tight text-alfa-ink">
        {feature ? feature.title : 'Раздел не активирован'}
      </h1>
      <p className="mt-2 max-w-md text-[15px] text-muted">
        {registered
          ? 'Этот раздел входит в стартовый пакет. Включите его — и он появится в меню и на дашборде.'
          : 'Сначала зарегистрируйте бизнес и соберите стартовый пакет — после этого раздел откроется.'}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {registered && feature ? (
          <Button onClick={activateHere}>
            Активировать «{feature.title}»
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={() => navigate('/registration')}>
            {registered ? 'Открыть стартовый пакет' : 'Зарегистрировать бизнес'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
        <Button variant="ghost" onClick={() => navigate('/registration')}>
          К стартовому пакету
        </Button>
      </div>
    </div>
  );
}
